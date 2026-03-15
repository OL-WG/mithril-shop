let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main';
let discount = 0;

const productDetails = {
    'Handle': { title: 'РУЧКА ARM', img: 'ruchka.webp', price: '$35.00', desc: 'Профессиональное оборудование для тренировок. Улучшает хват и силу предплечья.' },
    'Expander': { title: 'ЭСПАНДЕР', img: 'expander.webp', price: '$12.00', desc: 'Компактный тренажер с регулируемой нагрузкой для ежедневного использования.' }
};

// --- ИНФО ---
function showInfo(id) {
    const data = productDetails[id];
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = data.price;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
}

// --- КОРЗИНА ---
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

// --- СКИДКИ ---
function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    if (code === "JARVIS") {
        discount = 0.15; // 15% скидка
        msg.innerText = "Скидка 15% применена!";
        msg.style.color = "#4CAF50";
    } else {
        discount = 0;
        msg.innerText = "Промокод не найден";
        msg.style.color = "#f44336";
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let id in cart) {
        let cost = cart[id].count * cart[id].price;
        subtotal += cost;
        list.innerHTML += `<div class="cart-item"><span>${id} x${cart[id].count}</span><span style="margin-left:auto">$${cost.toFixed(2)}</span></div>`;
    }
    let total = subtotal * (1 - discount);
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    return total;
}

function updateMainButton() {
    let subtotal = 0;
    for (let id in cart) subtotal += cart[id].count * cart[id].price;
    if (subtotal > 0 && currentStep === 'main') {
        tg.MainButton.setParams({ text: `ПРОСМОТРЕТЬ КОРЗИНУ ($${subtotal.toFixed(2)})`, is_visible: true, color: "#000000" });
    } else if (subtotal === 0) tg.MainButton.hide();
}

// --- НАВИГАЦИЯ ---
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
        // Проверка заполнения (убрана жесткая привязка к mail.ru)
        const fields = ['fio', 'phone', 'country', 'city', 'cdek-addr', 'email'];
        if (fields.some(id => !document.getElementById(id).value)) {
            return tg.showAlert("Сэр, заполните все данные для логистики!");
        }
        
        tg.sendData(JSON.stringify({
            cart: cart,
            customer: fields.reduce((acc, id) => ({...acc, [id]: document.getElementById(id).value}), {}),
            total: document.getElementById('cart-total-price').innerText
        }));
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
    }
});
