let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; // main, cart, address

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
    let total = 0;
    for (let key in cart) total += cart[key].count * cart[key].price;

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `ПРОСМОТРЕТЬ КОРЗИНУ ($${total.toFixed(2)})`,
            color: "#ffffff",
            text_color: "#000000",
            is_visible: true
        });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        showCart();
    } else if (currentStep === 'cart') {
        showAddress();
    } else if (currentStep === 'address') {
        sendFinalOrder();
    }
});

function showCart() {
    currentStep = 'cart';
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('cart-screen').style.display = 'block';
    document.getElementById('address-screen').style.display = 'none';

    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let total = 0;

    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            total += itemTotal;
            let img = key === 'Handle' ? 'ruchka.webp' : 'expander.webp';
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            list.innerHTML += `
                <div class="cart-item">
                    <img src="${img}">
                    <div class="cart-info"><b>${name} x${cart[key].count}</b></div>
                    <div class="cart-price">$${itemTotal.toFixed(2)}</div>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    tg.MainButton.setParams({ text: "ПЕРЕЙТИ К ОПЛАТЕ", color: "#ffffff", text_color: "#000000" });
    tg.BackButton.show();
}

function showAddress() {
    currentStep = 'address';
    document.getElementById('cart-screen').style.display = 'none';
    document.getElementById('address-screen').style.display = 'block';
    tg.MainButton.setParams({ text: "ОФОРМИТЬ ЗАКАЗ", color: "#ffffff", text_color: "#000000" });
}

function sendFinalOrder() {
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const street = document.getElementById('street').value;

    if (!country || !city || !street) {
        tg.showAlert("Пожалуйста, заполните все поля адреса!");
        return;
    }

    const finalData = {
        cart: cart,
        address: {
            country: country,
            city: city,
            street: street
        }
    };
    tg.sendData(JSON.stringify(finalData));
}

tg.BackButton.onClick(() => {
    if (currentStep === 'address') {
        showCart();
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('main-screen').style.display = 'block';
        document.getElementById('cart-screen').style.display = 'none';
        tg.BackButton.hide();
        updateMainButton();
    }
});
