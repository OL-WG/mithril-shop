let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    
    let label = document.getElementById(`count-${name}`);
    if (label) label.innerText = cart[name].count;
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) total += cart[key].count * cart[key].price;

    if (total > 0) {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            color: "#28a745",
            is_visible: true
        });
    } else {
        tg.MainButton.hide();
    }
}

tg.MainButton.onClick(() => {
    if (document.getElementById('main-screen').style.display !== 'none') {
        showCart();
    } else {
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
            
            // Находим картинку товара по его ID (или названию)
            let imgSource = key.includes('Ручка') ? 'ruchka.webp' : 'expander.webp';
            
            list.innerHTML += `
                <div class="cart-item">
                    <img src="${imgSource}">
                    <div class="cart-item-info">
                        <b>${key} x${cart[key].count}</b>
                    </div>
                    <div class="cart-item-price">$${itemTotal.toFixed(2)}</div>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.BackButton.show();
}

tg.BackButton.onClick(() => {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
});
