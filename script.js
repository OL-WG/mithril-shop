let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main';
let discountPercent = 0;

const productDetails = {
    'Handle': { title: 'JARVIS HANDLE', img: 'ruchka.webp', price: 35, desc: 'Профессиональная ручка из авиационного алюминия.' },
    'Expander': { title: 'EXPANDER MAX', img: 'expander.webp', price: 12, desc: 'Эспандер с регулируемой нагрузкой.' }
};

function showInfo(id) {
    const data = productDetails[id];
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = `$${data.price}`;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
}

function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    cart[id] = { count: 1, price: price };
    updateMainButton();
}

function changeCount(id, price, delta) {
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
    const code = document.getElementById('promo-input').value.toUpperCase();
    if (code === "JARVIS") {
        discountPercent = 0.1;
        document.getElementById('promo-msg').innerText = "Скидка 10% применена!";
        document.getElementById('promo-msg').style.color = "#4CAF50";
    }
    renderCart();
}

function updateMainButton() {
    let total = 0;
    for (let id in cart) total += cart[id].count * cart[id].price;
    total = total * (1 - discountPercent);

    if (total > 0) {
        tg.MainButton.setText(`КОРЗИНА ($${total.toFixed(2)})`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = '';
    let total = 0;
    for (let id in cart) {
        let sum = cart[id].count * cart[id].price;
        total += sum;
        list.innerHTML += `<div style="display:flex; justify-content:space-between; padding:10px 15px; border-bottom:1px solid #222;">
            <span>${id === 'Handle' ? 'Ручка' : 'Эспандер'} x${cart[id].count}</span>
            <span>$${sum.toFixed(2)}</span>
        </div>`;
    }
    total = total * (1 - discountPercent);
    document.getElementById('cart-total-price').innerText = `Итого: $${total.toFixed(2)}`;
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("ОФОРМИТЬ ДОСТАВКУ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        const fields = ['fio', 'phone', 'city'];
        if (fields.some(f => !document.getElementById(f).value)) return tg.showAlert("Заполните основные поля!");
        currentStep = 'checkout';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('checkout-screen').style.display = 'block';
        document.getElementById('check-address').innerText = document.getElementById('city').value + ", " + document.getElementById('fio').value;
        tg.MainButton.setText("ПОДТВЕРДИТЬ И ОПЛАТИТЬ");
    } else {
        tg.sendData(JSON.stringify({ cart, customer: { fio: document.getElementById('fio').value, phone: document.getElementById('phone').value } }));
    }
});

tg.BackButton.onClick(() => {
    location.reload(); // Простой способ вернуться в начало
});