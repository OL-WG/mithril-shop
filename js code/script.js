let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let cart = {};
let currentStep = 'main';
let discountPercent = 0;

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
            <div class="counter">
                <button onclick="changeCount('${id}', -1)">-</button>
                <span>${cart[id].count}</span>
                <button onclick="changeCount('${id}', 1)">+</button>
            </div>
        `;
    } else {
        const name = id === 'ruchka' ? 'Ручка' : 'Эспандер';
        const price = id === 'ruchka' ? 35 : 12;
        container.innerHTML = `<button class="add-btn" onclick="addToCart('${id}', '${name}', ${price})">ДОБАВИТЬ</button>`;
    }
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0) {
        if (currentStep === 'main') {
            tg.MainButton.setParams({
                text: `КОРЗИНА ($${total.toFixed(2)})`,
                color: "#000000",
                text_color: "#ffffff",
                is_visible: true
            });
        }
    } else {
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
            <div class="cart-item">
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
        tg.showAlert("Промокод применен! Скидка 10%");
    } else {
        discountPercent = 0;
        tg.showAlert("Неверный промокод");
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
        checkItems.innerHTML += `<div class="cart-item"><span>${cart[key].name} x${cart[key].count}</span><span>$${itemTotal.toFixed(2)}</span></div>`;
    }

    // Собираем ВСЮ информацию для отображения
    const info = {
        fio: document.getElementById('fio').value,
        phone: document.getElementById('phone').value,
        country: document.getElementById('country').value,
        city: document.getElementById('city').value,
        cdek: document.getElementById('cdek-addr').value,
        email: document.getElementById('email').value
    };

    document.getElementById('check-address').innerHTML = `
        <b>ФИО:</b> ${info.fio}<br>
        <b>Тел:</b> ${info.phone}<br>
        <b>Город:</b> ${info.country}, ${info.city}<br>
        <b>СДЭК:</b> ${info.cdek}<br>
        <b>Email:</b> ${info.email}
    `;

    document.getElementById('final-price').innerText = `$${(total * (1 - discountPercent)).toFixed(2)}`;

    tg.MainButton.setParams({
        text: "ОПЛАТИТЬ",
        color: "#000000",
        text_color: "#ffffff"
    });
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setParams({ text: "К ОФОРМЛЕНИЮ", color: "#000000", text_color: "#ffffff" });
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setParams({ text: "ПРОВЕРИТЬ ДАННЫЕ", color: "#000000", text_color: "#ffffff" });
    } else if (currentStep === 'address') {
        if (document.getElementById('fio').value.length < 2) {
            tg.showAlert("Пожалуйста, заполните данные доставки");
            return;
        }
        showCheckout();
    } else if (currentStep === 'checkout') {
        let orderData = {
            items: cart,
            customer: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                address: `${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('cdek-addr').value}`
            }
        };
        tg.sendData(JSON.stringify(orderData));
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
