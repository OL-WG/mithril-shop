let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    
    // Обновляем текст на экране товара
    let el = document.getElementById(`count-${name}`);
    if (el) el.innerText = cart[name].count;

    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) {
        total += cart[key].count * cart[key].price;
    }

    if (total > 0) {
        // Прямо указываем название КОРЗИНА
        tg.MainButton.setParams({
            text: "КОРЗИНА", 
            color: "#28a745",
            is_active: true,
            is_visible: true
        });
    } else {
        tg.MainButton.hide();
    }
}

// ГЛАВНЫЙ ОБРАБОТЧИК КЛИКА
tg.MainButton.onClick(function() {
    // Проверяем: если мы видим список товаров, то переходим в корзину
    if (document.getElementById('main-screen').style.display !== 'none') {
        showCart();
    } 
});

function showCart() {
    // Прячем витрину, показываем корзину
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
                <div style="display: flex; justify-content: space-between; padding: 10px; border-bottom: 1px solid #333;">
                    <span>${key} x${cart[key].count}</span>
                    <span>${itemTotal} ₽</span>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = total + " ₽";
    
    // В корзине меняем текст на ОФОРМИТЬ
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.BackButton.show();
}

tg.BackButton.onClick(function() {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
});
