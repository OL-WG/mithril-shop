let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; // main, cart, address, checkout
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
    } else if (total === 0) tg.MainButton.hide();
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    discount = (code === "JARVIS") ? 0.1 : 0;
    appliedPromo = (discount > 0) ? code : "";
    document.getElementById('promo-msg').innerText = discount > 0 ? "Скидка 10%!" : "Неверный код";
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            subtotal += itemTotal;
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            list.innerHTML += `<div class="cart-item"><b>${name} x${cart[key].count}</b><div style="margin-left:auto">$${itemTotal.toFixed(2)}</div></div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `$${(subtotal * (1 - discount)).toFixed(2)}`;
}

function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';
    
    // Заполняем данные для проверки
    let itemsDiv = document.getElementById('check-items');
    itemsDiv.innerHTML = '';
    for (let key in cart) {
        if (cart[key].count > 0) {
            itemsDiv.innerHTML += `<div>${key === 'Handle' ? 'Ручка Arm' : 'Эспандер'} — ${cart[key].count} шт.</div>`;
        }
    }
    
    document.getElementById('check-address').innerHTML = `
        ${document.getElementById('country').value}<br>
        ${document.getElementById('city').value}<br>
        ${document.getElementById('street').value}
    `;
    
    document.getElementById('check-total-price').innerText = document.getElementById('cart-total-price').innerText;
    tg.MainButton.setText("ПОДТВЕРДИТЬ И ОПЛАТИТЬ");
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К АДРЕСУ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        if (!document.getElementById('country').value || !document.getElementById('city').value) return tg.showAlert("Заполните адрес!");
        showCheckout();
    } else if (currentStep === 'checkout') {
        tg.sendData(JSON.stringify({
            cart,
            address: {
                country: document.getElementById('country').value,
                city: document.getElementById('city').value,
                street: document.getElementById('street').value
            },
            promo: appliedPromo,
            total: document.getElementById('check-total-price').innerText
        }));
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
        tg.MainButton.setText("К АДРЕСУ");
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
    }
});
