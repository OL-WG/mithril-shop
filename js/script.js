let tg = window.Telegram.WebApp;
tg.expand();

// Настройка темы под твой "Total Black"
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

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
        tg.MainButton.text = `ОФОРМИТЬ ЗАКАЗ (${total} ₽)`;
        tg.MainButton.show();
        tg.MainButton.setParams({
            color: '#28a745', // Зеленая кнопка как в Durger King
            text_color: '#ffffff'
        });
    } else {
        tg.MainButton.hide();
    }
}

// Слушаем нажатие на главную кнопку Telegram
tg.MainButton.onClick(() => {
    let orderItems = [];
    for (let name in cart) {
        if (cart[name].count > 0) {
            orderItems.push(`${name} x${cart[name].count}`);
        }
    }
    
    const data = JSON.stringify({
        items: orderItems.join(", "),
        total: Object.values(cart).reduce((a, b) => a + (b.count * b.price), 0)
    });

    tg.sendData(data); // Это отправит данные боту и закроет приложение
});
