let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; 
let discountPercent = 0; 
let appliedPromo = "";

const productDetails = {
    'Handle': { title: 'JARVIS HANDLE', img: 'ruchka.webp', price: 35.00, desc: 'Профессиональная ручка для армрестлинга.' },
    'Expander': { title: 'EXPANDER MAX', img: 'expander.webp', price: 12.00, desc: 'Высокотехнологичный кистевой эспандер.' }
};

function showInfo(id) {
    const data = productDetails[id];
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = `$${data.price.toFixed(2)}`;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
    updateMainButton();
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
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    if (code === "JARVIS") {
        discountPercent = 0.10;
        msg.innerText = "Скидка 10% применена!";
        msg.style.color = "#4CAF50";
    } else {
        discountPercent = 0;
        msg.innerText = "Код не найден";
        msg.style.color = "#f44336";
    }
    renderCart();
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({ text: `КОРЗИНА ($${total.toFixed(2)})`, color: "#fff", text_color: "#000", is_visible: true });
    } else if (total === 0 && currentStep === 'main') {
        tg.MainButton.hide();
    }
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let key in cart) {
        let cost = cart[key].count * cart[key].price;
        subtotal += cost;
        list.innerHTML += `<div class="cart-item"><span>${key === 'Handle' ? 'Ручка' : 'Эспандер'} x${cart[key].count}</span><span>$${cost.toFixed(2)}</span></div>`;
    }
    let total = subtotal * (1 - discountPercent);
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    document.getElementById('cart-discount-row').style.display = discountPercent > 0 ? 'flex' : 'none';
}

function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';
    
    document.getElementById('check-items').innerHTML = '';
    for (let key in cart) {
        document.getElementById('check-items').innerHTML += `<div>${key} x${cart[key].count}</div>`;
    }
    
    document.getElementById('check-address').innerHTML = `
        ${document.getElementById('fio').value}<br>
        ${document.getElementById('phone').value}<br>
        ${document.getElementById('country').value}, ${document.getElementById('city').value}<br>
        СДЭК: ${document.getElementById('cdek-addr').value}
    `;
    document.getElementById('check-total-price').innerText = document.getElementById('cart-total-price').innerText;
    tg.MainButton.setText("ОПЛАТИТЬ И ОТПРАВИТЬ");
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ДОСТАВКЕ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("ПРОВЕРИТЬ");
    } else if (currentStep === 'address') {
        if (!document.getElementById('fio').value || !document.getElementById('phone').value) return tg.showAlert("Заполните ФИО и телефон!");
        showCheckout();
    } else if (currentStep === 'checkout') {
        const data = {
            cart: cart,
            customer: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek-addr').value,
                email: document.getElementById('email').value
            },
            total: document.getElementById('check-total-price').innerText
        };
        tg.sendData(JSON.stringify(data));
        tg.close();
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'checkout') {
        currentStep = 'address';
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
    } else if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
    } else {
        location.reload();
    }
});
