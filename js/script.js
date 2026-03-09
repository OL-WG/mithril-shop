let tg = window.Telegram.WebApp;
let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) { total += cart[key].count * cart[key].price; }

    if (total > 0) {
        tg.MainButton.text = "ПРОСМОТРЕТЬ ЗАКАЗ";
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ НА КОРЗИНУ
tg.MainButton.onClick(() => {
    if (tg.MainButton.text.includes("ОПЛАТИТЬ")) {
        // Если уже в корзине — отправляем данные боту
        tg.sendData(JSON.stringify(cart));
    } else {
        showCart();
    }
});

function showCart() {
    document.getElementById('main-screen').style.display = 'none';
    document.getElementById('cart-screen').style.display = 'block';
    
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; // Очистка
    let total = 0;

    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            total += itemTotal;
            list.innerHTML += `
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;">
                    <span>${key} x${cart[key].count}</span>
                    <span>${itemTotal} ₽</span>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `${total} ₽`;
    
    tg.MainButton.text = `ОПЛАТИТЬ ${total} ₽`;
    tg.BackButton.show(); // Показать кнопку "Назад" в интерфейсе TG
}

tg.BackButton.onClick(() => showMain());

function showMain() {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
}
