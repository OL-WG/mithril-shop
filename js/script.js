let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main';
let discount = 0;
let appliedPromo = "";

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
        cart[id].count = 0;
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`count-${id}`).innerText = cart[id].count;
    }
    updateMainButton();
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discount);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            color: "#ffffff", text_color: "#000000", is_visible: true
        });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    if (code === "JARVIS") {
        discount = 0.1;
        appliedPromo = code;
        msg.innerText = "Скидка 10% применена!";
        msg.style.color = "#4CAF50";
    } else {
        discount = 0;
        appliedPromo = "";
        msg.innerText = "Неверный код";
        msg.style.color = "#FF5252";
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            subtotal += itemTotal;
            let img = key === 'Handle' ? 'ruchka.webp' : 'expander.webp';
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            list.innerHTML += `<div class="cart-item"><img src="${img}"><div class="cart-info"><b>${name} x${cart[key].count}</b></div><div>$${itemTotal.toFixed(2)}</div></div>`;
        }
    }
    let total = subtotal * (1 - discount);
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    if (discount > 0) {
        document.getElementById('old-price').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('old-price').style.display = 'inline';
    } else {
        document.getElementById('old-price').style.display = 'none';
    }
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ОПЛАТЕ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    } else if (currentStep === 'address') {
        const addr = {
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            street: document.getElementById('street').value
        };
        if (!addr.country || !addr.city || !addr.street) return tg.showAlert("Заполните адрес!");
        tg.sendData(JSON.stringify({ cart, address: addr, promo: appliedPromo, total: document.getElementById('cart-total-price').innerText }));
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("К ОПЛАТЕ");
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
    }
});
