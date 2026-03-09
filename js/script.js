let tg = window.Telegram.WebApp;
tg.expand();

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
    let items = [];
    for (let key in cart) {
        if (cart[key].count > 0) {
            total += cart[key].count * cart[key].price;
            items.push(`${key} (x${cart[key].count})`);
        }
    }

    if (total > 0) {
        tg.MainButton.text = `ПРОСМОТРЕТЬ ЗАКАЗ (${total} ₽)`;
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// ФУНКЦИЯ ДЛЯ ВЫЗОВА CHECKOUT
tg.MainButton.onClick(() => {
    let items = [];
    let total = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            items.push(`${key} x${cart[key].count}`);
            total += cart[key].count * cart[key].price;
        }
    }

    const order = {
        title: "Ваш заказ в MithrilARM",
        description: items.join(", "),
        total: total
    };

    tg.sendData(JSON.stringify(order));
});
