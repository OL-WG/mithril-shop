let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main';
let discount = 0;

const descriptions = {
    'ruchka': 'Ручка Arm — профессиональный тренажер для армрестлинга. Развивает силу хвата и кисти.',
    'expander': 'Эспандер — компактный тренажер для укрепления мышц предплечья с нагрузкой 50кг.'
};

// 1. ИНФО как на второй картинке (Системное окно Telegram)
function showTgInfo(id) {
    tg.showPopup({
        title: 'О товаре',
        message: descriptions[id],
        buttons: [{type: 'close'}]
    });
}

function addToCart(id, name, price) {
    if (!cart[id]) cart[id] = { name, price, count: 1 };
    renderControls(id);
    updateMainBtn();
}

function renderControls(id) {
    const container = document.getElementById(`controls-${id}`);
    container.innerHTML = `
        <div style="display:flex; justify-content:space-between; align-items:center; background:#000; border:1px solid #333; border-radius:10px; padding:4px;">
            <button onclick="changeCount('${id}', -1)" style="background:none; border:none; color:#fff; font-size:20px; width:30px;">-</button>
            <span>${cart[id].count}</span>
            <button onclick="changeCount('${id}', 1)" style="background:none; border:none; color:#fff; font-size:20px; width:30px;">+</button>
        </div>`;
}

function changeCount(id, delta) {
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        location.reload();
    } else {
        renderControls(id);
        if (currentStep === 'cart') renderCart();
        updateMainBtn();
    }
}

// 2. СКИДКА как на третьей картинке
function applyPromo() {
    const code = document.getElementById('promo-input').value.toLowerCase();
    if (code === 'morozov' || code === 'jarvis') {
        discount = 10;
        document.getElementById('discount-info').style.display = 'flex';
        document.getElementById('discount-val').innerText = '10%';
        tg.showAlert("Промокод применен!");
    } else {
        discount = 0;
        document.getElementById('discount-info').style.display = 'none';
        tg.showAlert("Неверный промокод");
    }
    renderCart();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let subtotal = 0;
    for (let id in cart) {
        let sum = cart[id].count * cart[id].price;
        subtotal += sum;
        container.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${cart[id].name} x${cart[id].count}</span><span>$${sum}</span></div>`;
    }
    
    let total = subtotal - (subtotal * (discount / 100));
    document.getElementById('subtotal-price').innerText = `$${subtotal}`;
    document.getElementById('total-price').innerText = `$${total.toFixed(2)}`;
}

function updateMainBtn() {
    let total = 0;
    for (let id in cart) total += cart[id].count * cart[id].price;
    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({ text: `КОРЗИНА ($${total})`, is_visible: true, color: "#000000", text_color: "#ffffff" });
    } else if (total === 0) tg.MainButton.hide();
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ОФОРМЛЕНИЮ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("ПРОВЕРИТЬ ДАННЫЕ");
    } else if (currentStep === 'address') {
        const fields = ['fio', 'phone', 'country', 'city', 'cdek-addr', 'email'];
        for (let f of fields) {
            if (document.getElementById(f).value.trim() === "") {
                tg.showAlert("Заполните все поля!");
                return;
            }
        }
        currentStep = 'checkout';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('checkout-screen').style.display = 'block';
        
        // Финальный чек со всей инфой
        let subtotal = 0;
        let itemsHtml = '<strong>Заказ:</strong><br>';
        for (let id in cart) {
            let sum = cart[id].count * cart[id].price;
            subtotal += sum;
            itemsHtml += `${cart[id].name} x${cart[id].count} - $${sum}<br>`;
        }
        let total = subtotal - (subtotal * (discount / 100));

        document.getElementById('check-items').innerHTML = itemsHtml;
        document.getElementById('check-address').innerHTML = `
            <strong>Доставка:</strong><br>
            ${document.getElementById('fio').value}<br>${document.getElementById('phone').value}<br>
            ${document.getElementById('country').value}, ${document.getElementById('city').value}<br>
            ${document.getElementById('cdek-addr').value}
        `;
        document.getElementById('final-price').innerText = `$${total.toFixed(2)}`;
        tg.MainButton.setText("ОПЛАТИТЬ");
    }
});

tg.BackButton.onClick(() => {
    location.reload();
});
