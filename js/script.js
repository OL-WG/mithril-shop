let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; 
let discountPercent = 0; 
let appliedPromo = "";

const productDetails = {
    'Handle': { title: 'JARVIS HANDLE', img: 'ruchka.webp', price: '$35.00', desc: 'Профессиональная ручка для армрестлинга. Изготовлена из авиационного алюминия.' },
    'Expander': { title: 'EXPANDER MAX', img: 'expander.webp', price: '$12.00', desc: 'Высокотехнологичный кистевой эспандер с регулируемой нагрузкой.' }
};

function showInfo(id) {
    const data = productDetails[id];
    if (!data) return;
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = data.price;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
    tg.MainButton.hide();
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
    if (currentStep !== 'main') { tg.MainButton.show(); } else { updateMainButton(); }
}

function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    cart[id] = { count: 1, price: price };
    document.getElementById(`count-${id}`).innerText = "1";
    updateMainButton();
}

function changeCount(id, price, delta) {
    if (!cart[id]) return;
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`count-${id}`).innerText = cart[id].count;
    }
    updateMainButton();
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    if (code === "JARVIS") {
        discountPercent = 0.10;
        appliedPromo = code;
        msg.innerText = "Промокод применен! Скидка 10%.";
        msg.style.color = "#4CAF50";
    } else {
        discountPercent = 0;
        appliedPromo = "";
        msg.innerText = "Неверный промокод.";
        msg.style.color = "#f44336";
    }
    renderCart();
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            color: "#ffffff",
            text_color: "#000000",
            is_visible: true
        });
    } else if (total === 0 && currentStep === 'main') {
        tg.MainButton.hide();
    }
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let key in cart) {
        let itemTotal = cart[key].count * cart[key].price;
        subtotal += itemTotal;
        let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
        list.innerHTML += `<div class="cart-item"><span><b>${name}</b> x${cart[key].count}</span><span style="margin-left:auto">$${itemTotal.toFixed(2)}</span></div>`;
    }
    let discountVal = subtotal * discountPercent;
    let finalTotal = subtotal - discountVal;
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-discount-row').style.display = discountVal > 0 ? 'flex' : 'none';
    document.getElementById('cart-discount-val').innerText = `-$${discountVal.toFixed(2)}`;
    document.getElementById('cart-total-price').innerText = `$${finalTotal.toFixed(2)}`;
}

function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';
    
    let itemsDiv = document.getElementById('check-items');
    itemsDiv.innerHTML = '';
    let subtotal = 0;
    for (let key in cart) {
        subtotal += cart[key].count * cart[key].price;
        itemsDiv.innerHTML += `<div>${key === 'Handle' ? 'Ручка Arm' : 'Эспандер'} — ${cart[key].count} шт.</div>`;
    }
    
    document.getElementById('check-address').innerHTML = `
        <b>ФИО:</b> ${document.getElementById('fio').value}<br>
        <b>Тел:</b> ${document.getElementById('phone').value}<br>
        <b>Город:</b> ${document.getElementById('city').value}<br>
        <b>СДЭК:</b> ${document.getElementById('cdek-addr').value}
    `;
    
    document.getElementById('check-total-price').innerText = document.getElementById('cart-total-price').innerText;
    tg.MainButton.setParams({ text: "ПОДТВЕРДИТЬ И ОПЛАТИТЬ", color: "#ffffff", text_color: "#000000" });
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        if (!document.getElementById('fio').value || !document.getElementById('phone').value || !document.getElementById('city').value) {
            return tg.showAlert("Сэр, заполните основные поля!");
        }
        showCheckout();
    } else if (currentStep === 'checkout') {
        const data = {
            cart: cart,
            customer: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek-addr').value
            },
            total: document.getElementById('check-total-price').innerText
        };
        tg.sendData(JSON.stringify(data));
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'checkout') {
        currentStep = 'address';
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
    } else {
        location.reload();
    }
});
