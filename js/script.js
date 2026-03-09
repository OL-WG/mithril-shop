let tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;
    
    // Обновляем цифру в карточке
    document.getElementById(`count-${name}`).innerText = cart[name].count;
    
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    let itemsCount = 0;

    for (let key in cart) {
        total += cart[key].count * cart[key].price;
        itemsCount += cart[key].count;
    }

    if (total > 0) {
        tg.MainButton.text = `ПОСМОТРЕТЬ ЗАКАЗ (${total} ₽)`;
        tg.MainButton.show();
        tg.MainButton.setParams({ color: '#28a745' }); // Зеленая кнопка как в Durger King
    } else {
        tg.MainButton.hide();
    }
}

// Отправка данных при клике на главную кнопку
tg.MainButton.onClick(() => {
    let orderData = Object.entries(cart)
        .filter(([_, data]) => data.count > 0)
        .map(([name, data]) => `${name} (x${data.count})`)
        .join(", ");
    
    let total = Object.values(cart).reduce((sum, data) => sum + (data.count * data.price), 0);
    
    tg.sendData(`🛒 Заказ: ${orderData} на сумму ${total}₽`);
    tg.close();
});
