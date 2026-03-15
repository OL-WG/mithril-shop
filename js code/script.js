let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let cart = {};
let currentStep = 'main';
let discountPercent = 0;

// Цвета для главной кнопки Telegram (Черный фон, белый текст)
const MAIN_BUTTON_STYLE = {
    color: "#000000",
    text_color: "#ffffff"
};

function addToCart(id, name, price) {
    if (!cart[id]) {
        cart[id] = { name: name, price: price, count: 1 };
    }
    renderControls(id);
    updateMainButton();
}

function changeCount(id, delta) {
    if (cart[id]) {
        cart[id].count += delta;
        if (cart[id].count <= 0) delete cart[id];
    }
    renderControls(id);
    if (currentStep === 'cart') renderCart();
    updateMainButton();
}

function renderControls(id) {
    const container = document.getElementById(`controls-${id}`);
    if (cart[id]) {
        container.innerHTML = `
            <div style="display:flex; align-items:center; justify-content:space-between; background:#000; border: 1px solid #333; border-radius:8px; padding:5px; margin-top:5px;">
                <button onclick="changeCount('${id}', -1)" style="background:none; border:none; color:#fff; font-size:18px; width:30px; cursor:pointer;">-</button>
                <span style="color:#fff;">${cart[id].count}</span>
                <button onclick="changeCount('${id}', 1)" style="background:none; border:none; color:#fff; font-size:18px; width:30px; cursor:pointer;">+</button>
            </div>
        `;
    } else {
        const name = id === 'ruchka' ? 'Ручка Arm' : 'Эспандер';
        const price = id === 'ruchka' ? 35 : 12;
        container.innerHTML = `<button class="add-btn" onclick="addToCart('${id}', '${name}', ${price})">ДОБАВИТЬ</button>`;
    }
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            ...MAIN_BUTTON_STYLE,
            is_visible: true
        });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

function renderCart() {
    const container = document.getElementById('cart-items');
    container.innerHTML = '';
    let subtotal = 0;

    for (let key in cart) {
        const item = cart[key];
        const itemTotal = item.count * item.price;
        subtotal += itemTotal;
        container.innerHTML += `
            <div style="display:flex; justify-content:space-between; margin-bottom:10px;">
                <span>${item.name} x${item.count}</span>
                <span>$${itemTotal.toFixed(2)}</span>
            </div>
        `;
    }

    document.getElementById('subtotal-price').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('total-price').innerText = `$${(subtotal * (1 - discountPercent)).toFixed(2)}`;
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.toLowerCase();
    if (code === 'morozov') {
        discountPercent = 0.1;
        tg.showAlert("Скидка 10% применена!");
    } else {
        discountPercent = 0;
        tg.showAlert("Код не найден");
    }
    renderCart();
}

function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';

    const checkItems = document.getElementById('check-items');
    checkItems.innerHTML = '';
    let total = 0;

    for (let key in cart) {
        const itemTotal = cart[key].count * cart[key].price;
        total += itemTotal;
        checkItems.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:5px;"><span>${cart[key].name} x${cart[key].count}</span><span>$${itemTotal.toFixed(2)}</span></div>`;
    }

    // Вывод всей информации о доставке
    document.getElementById('check-address').innerHTML = `
        <b>ФИО:</b> ${document.getElementById('fio').value}<br>
        <b>Тел:</b> ${document.getElementById('phone').value}<br>
        <b>Адрес:</b> ${document.getElementById('country').value}, ${document.getElementById('city').value}<br>
        <b>СДЭК:</b> ${document.getElementById('cdek-addr').value}<br>
        <b>Email:</b> ${document.getElementById('email').value}
    `;

    document.getElementById('final-price').innerText = `$${(total * (1 - discountPercent)).toFixed(2)}`;

    tg.MainButton.setParams({
        text: "ОПЛАТИТЬ",
        ...MAIN_BUTTON_STYLE
    });
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setParams({ text: "К ОФОРМЛЕНИЮ", ...MAIN_BUTTON_STYLE });
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setParams({ text: "ПРОВЕРИТЬ ДАННЫЕ", ...MAIN_BUTTON_STYLE });
    } else if (currentStep === 'address') {
        if (document.getElementById('fio').value.length < 2) {
            tg.showAlert("Пожалуйста, заполните данные доставки");
            return;
        }
        showCheckout();
    } else if (currentStep === 'checkout') {
        tg.sendData(JSON.stringify({cart: cart, info: "Заказ подтвержден"}));
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'checkout') {
        currentStep = 'address';
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("ПРОВЕРИТЬ ДАННЫЕ");
    } else if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("К ОФОРМЛЕНИЮ");
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
    }
});
