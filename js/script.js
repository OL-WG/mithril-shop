let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};

function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    cart[id] = { count: 1, price: price };
    document.getElementById(`count-${id}`).innerText = "1";
    updateMainButton();
}

function changeCount(id, price, delta) {
    if (!cart[id]) return;
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        cart[id].count = 0;
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`count-${id}`).innerText = cart[id].count;
    }
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let key in cart) total += cart[key].count * cart[key].price;

    if (total > 0) {
        // Кнопка стала ЧЕРНОЙ (текст белый)
        tg.MainButton.setParams({
            text: `ПРОСМОТРЕТЬ КОРЗИНУ ($${total.toFixed(2)})`,
            color: "#000000",
            text_color: "#ffffff",
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
            let img = key === 'Handle' ? 'ruchka.webp' : 'expander.webp';
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            
            list.innerHTML += `
                <div class="cart-item">
                    <img src="${img}">
                    <div class="cart-info"><b>${name} x${cart[key].count}</b></div>
                    <div class="cart-price">$${itemTotal.toFixed(2)}</div>
                </div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `$${total.toFixed(2)}`;
    
    // Кнопка в корзине тоже ЧЕРНО-БЕЛАЯ
    tg.MainButton.setParams({
        text: "ОФОРМИТЬ ЗАКАЗ",
        color: "#ffffff",
        text_color: "#000000"
    });
    tg.BackButton.show();
}

tg.BackButton.onClick(() => {
    document.getElementById('main-screen').style.display = 'block';
    document.getElementById('cart-screen').style.display = 'none';
    tg.BackButton.hide();
    updateMainButton();
});
