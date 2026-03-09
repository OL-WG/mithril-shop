let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) {
        cart[name] = { count: 0, price: price };
    }
    
    cart[name].count += delta;
    
    if (cart[name].count < 0) cart[name].count = 0;
    
    // Обновляем число на главной странице
    let countLabel = document.getElementById(`count-${name}`);
    if (countLabel) {
        countLabel.innerText = cart[name].count;
    }

    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) {
        total += cart[key].count * cart[key].price;
    }

    if (total > 0) {
        tg.MainButton.setParams({
            text: `КОРЗИНА (${total} ₽)`,
            color: "#28a745",
            is_visible: true
        });
    } else {
        tg.MainButton.hide();
    }
}

// Клик по кнопке Telegram
tg.MainButton.onClick(() => {
    if (document.getElementById('main-screen').style.display !== 'none') {
        showCart();
    } else {
        // Если уже в корзине, отправляем данные боту
        tg.sendData(JSON.stringify(cart));
    }
});

function showCart() {
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('cart-screen').style.display = 'block';
    
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let total = 0;

    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            total += itemTotal;
            list.innerHTML += `
                <div class="cart-item">
                    <span>${key} x${cart[key].count}</span>
                    <span>${itemTotal} ₽</span>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = total + " ₽";
    
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.BackButton.show();
}

tg.BackButton.onClick(() => {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
});
