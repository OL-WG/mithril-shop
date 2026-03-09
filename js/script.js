let tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

// Состояние корзины
let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    
    // Обновляем текст счетчика на странице
    const countElement = document.getElementById(`count-${name}`);
    if (countElement) countElement.innerText = cart[name].count;
    
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) {
        total += cart[key].count * cart[key].price;
    }

    if (total > 0) {
        tg.MainButton.text = `ПРОСМОТРЕТЬ ЗАКАЗ (${total} ₽)`;
        tg.MainButton.show();
        tg.MainButton.setParams({
            color: '#28a745', 
            text_color: '#ffffff'
        });
    } else {
        tg.MainButton.hide();
    }
}

// При нажатии на зеленую кнопку "ПРОСМОТРЕТЬ ЗАКАЗ"
tg.MainButton.onClick(() => {
    let orderItems = [];
    for (let name in cart) {
        if (cart[name].count > 0) {
            orderItems.push(`${name} x${cart[name].count}`);
        }
    }
    
    // Формируем строку заказа
    let total = Object.values(cart).reduce((a, b) => a + (b.count * b.price), 0);
    let resultString = `Заказ: ${orderItems.join(", ")}. Итого: ${total}₽`;

    // ОТПРАВКА ДАННЫХ
    tg.sendData(resultString); 
});
