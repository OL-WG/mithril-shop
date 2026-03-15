let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main';

// Конфиг для всех состояний MainButton
const BTN_STYLE = { color: "#000000", text_color: "#ffffff" };

function addToCart(id, name, price) {
    if (!cart[id]) cart[id] = { name, price, count: 1 };
    renderControls(id);
    updateMainBtn();
}

function updateMainBtn() {
    let total = 0;
    for (let id in cart) total += cart[id].count * cart[id].price;

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({ text: `КОРЗИНА ($${total})`, is_visible: true, ...BTN_STYLE });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

function renderControls(id) {
    const container = document.getElementById(`controls-${id}`);
    if (cart[id]) {
        container.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; background:#000; border:1px solid #444; border-radius:8px; padding:4px;">
                <button onclick="changeCount('${id}', -1)" style="background:none; border:none; color:#fff; font-size:20px; width:30px;">-</button>
                <span>${cart[id].count}</span>
                <button onclick="changeCount('${id}', 1)" style="background:none; border:none; color:#fff; font-size:20px; width:30px;">+</button>
            </div>`;
    }
}

function changeCount(id, delta) {
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        const name = id === 'ruchka' ? 'Ручка Arm' : 'Эспандер';
        const price = id === 'ruchka' ? 35 : 12;
        document.getElementById(`controls-${id}`).innerHTML = `<button class="black-btn" onclick="addToCart('${id}', '${name}', ${price})">ДОБАВИТЬ</button>`;
    } else {
        renderControls(id);
    }
    if (currentStep === 'cart') renderCart();
    updateMainBtn();
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let total = 0;
    for (let id in cart) {
        let sum = cart[id].count * cart[id].price;
        total += sum;
        container.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:10px;">
            <span>${cart[id].name} x${cart[id].count}</span><span>$${sum}</span></div>`;
    }
    document.getElementById('subtotal-price').innerText = `$${total}`;
    document.getElementById('total-price').innerText = `$${total}`;
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
        currentStep = 'checkout';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('checkout-screen').style.display = 'block';
        
        // Вывод всей инфы (ФИО, Тел, Страна, Город, СДЭК, Email)
        document.getElementById('check-address').innerHTML = `
            ${document.getElementById('fio').value}<br>
            ${document.getElementById('phone').value}<br>
            ${document.getElementById('country').value}, ${document.getElementById('city').value}<br>
            ${document.getElementById('cdek-addr').value}<br>
            ${document.getElementById('email').value}
        `;
        
        let total = 0;
        let itemsHtml = '';
        for (let id in cart) {
            let sum = cart[id].count * cart[id].price;
            total += sum;
            itemsHtml += `<div>${cart[id].name} x${cart[id].count} - $${sum}</div>`;
        }
        document.getElementById('check-items').innerHTML = itemsHtml;
        document.getElementById('final-price').innerText = `$${total}`;
        tg.MainButton.setText("ОПЛАТИТЬ");
    }
});

tg.BackButton.onClick(() => {
    location.reload(); // Простой способ вернуться в начало
});
