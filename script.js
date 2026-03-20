let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let step = 'main';
let discount = 0;
let promoCode = "Нет";

function addToCart(id, price) {
    cart[id] = { count: 1, price: price };
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    updateMainBtn();
}

function changeCount(id, delta) {
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`count-${id}`).innerText = cart[id].count;
    }
    updateMainBtn();
}

function updateMainBtn() {
    let sum = 0;
    for (let id in cart) sum += cart[id].count * cart[id].price;
    if (sum > 0 && step === 'main') {
        tg.MainButton.setText(`В КОРЗИНУ ($${sum})`);
        tg.MainButton.show();
    } else if (sum === 0) {
        tg.MainButton.hide();
    }
}

function applyPromo() {
    let input = document.getElementById('promo-input').value.toUpperCase();
    let msg = document.getElementById('promo-msg');
    if (input === 'JARVIS') {
        discount = 0.1;
        promoCode = 'JARVIS';
        msg.innerText = "Скидка 10% применена!";
        msg.style.color = "#4CAF50";
    } else {
        discount = 0;
        msg.innerText = "Неверный код.";
        msg.style.color = "#FF4444";
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-list');
    list.innerHTML = '';
    let sum = 0;
    for (let id in cart) {
        let cost = cart[id].count * cart[id].price;
        sum += cost;
        list.innerHTML += `<div class="cart-item"><span>${id} x${cart[id].count}</span><span>$${cost}</span></div>`;
    }
    let total = sum * (1 - discount);
    document.getElementById('total-price').innerText = `Итого: $${total.toFixed(2)}`;
}

tg.MainButton.onClick(() => {
    if (step === 'main') {
        step = 'cart';
        document.getElementById('main-screen').classList.remove('active');
        document.getElementById('cart-screen').classList.add('active');
        renderCart();
        tg.MainButton.setText("ДАЛЕЕ");
        tg.BackButton.show();
    } else if (step === 'cart') {
        step = 'address';
        document.getElementById('cart-screen').classList.remove('active');
        document.getElementById('address-screen').classList.add('active');
        tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    } else if (step === 'address') {
        let data = {
            customer: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek').value,
                email: document.getElementById('email').value
            },
            cart: cart,
            promo: promoCode,
            total: document.getElementById('total-price').innerText
        };
        tg.sendData(JSON.stringify(data));
    }
});

tg.BackButton.onClick(() => {
    location.reload(); // Простой способ вернуться в начало
});
