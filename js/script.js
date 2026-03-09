let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};

// Функция добавления товара
function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    
    updateMainButton();
}

// Обновление главной кнопки Telegram
function updateMainButton() {
    let total = 0;
    for (let key in cart) {
        total += cart[key].count * cart[key].price;
    }

    if (total > 0) {
        // Устанавливаем текст "Корзина"
        tg.MainButton.setParams({
            text: `КОРЗИНА (${total} ₽)`,
            color: "#28a745",
            is_visible: true
        });
    } else {
        tg.MainButton.hide();
    }
}

// ОБРАБОТЧИК КЛИКА ПО КНОПКЕ
tg.MainButton.onClick(() => {
    // Если мы на главном экране — переходим в корзину
    if (document.getElementById('main-screen').style.display !== 'none') {
        showCart();
    } else {
        // Если уже в корзине — можно отправлять заказ боту
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
                <div style="display: flex; justify-content: space-between; padding: 15px 0; border-bottom: 1px solid #222;">
                    <span>${key} (x${cart[key].count})</span>
                    <span>${itemTotal} ₽</span>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `${total} ₽`;
    
    // Меняем текст кнопки на "ОФОРМИТЬ"
    tg.MainButton.setText("ОФОРМИТЬ ЗАКАЗ");
    tg.BackButton.show(); // Показываем стрелку "Назад"
}

// Возврат назад
tg.BackButton.onClick(() => {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
});
