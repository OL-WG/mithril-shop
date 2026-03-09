let tg = window.Telegram.WebApp;
tg.expand();
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

let cart = {};

function changeCount(name, price, delta) {
    if (!cart[name]) cart[name] = { count: 0, price: price };
    cart[name].count += delta;
    if (cart[name].count < 0) cart[name].count = 0;

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
        tg.MainButton.text = `ПРОСМОТРЕТЬ ЗАКАЗ (${total} ₽)`;
        tg.MainButton.show();
        tg.MainButton.setParams({ color: '#28a745' });
    } else {
        tg.MainButton.hide();
    }
}

tg.MainButton.onClick(() => {
    let items = [];
    let total = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            items.push(`${key} x${cart[key].count}`);
            total += cart[key].count * cart[key].price;
        }
    }
    // Отправляем данные боту
    tg.sendData(JSON.stringify({ items: items.join(", "), total: total }));
});
