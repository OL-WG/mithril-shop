let tg = window.Telegram.WebApp;
tg.expand();

let cart = [];
let step = 1;
let discount = 0;

// Добавление в корзину
function addItem(name, price) {
    cart.push({name, price});
    updateMainBtn();
}

function updateMainBtn() {
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total > 0 && step === 1) {
        tg.MainButton.setText(`ПЕРЕЙТИ В КОРЗИНУ ($${total})`);
        tg.MainButton.show();
    }
}

// Модалка ИНФО
function openInfo(title, price, img) {
    document.getElementById('modal-title').innerText = title;
    document.getElementById('modal-img').src = img;
    document.getElementById('modal-info').classList.add('active');
}
function closeInfo() {
    document.getElementById('modal-info').classList.remove('active');
}

// Промокоды
function applyPromo() {
    let code = document.getElementById('promo-field').value.toUpperCase();
    if (code === "JARVIS") {
        discount = 0.1; // 10%
        tg.showAlert("Промокод применен!");
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-content');
    let subtotal = cart.reduce((s, i) => s + i.price, 0);
    list.innerHTML = cart.map(i => `<div style="display:flex;justify-content:space-between;padding:10px 0;border-bottom:1px solid #222;"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
    let final = subtotal * (1 - discount);
    document.getElementById('total-price').innerText = `$${final.toFixed(2)}`;
}

// ГЛАВНЫЙ ОБРАБОТЧИК КНОПКИ ТЕЛЕГРАМА
tg.MainButton.onClick(function() {
    if (step === 1) {
        document.getElementById('screen-main').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        renderCart();
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        tg.BackButton.show();
        step = 2;
    } 
    else if (step === 2) {
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-delivery').classList.add('active');
        tg.MainButton.setText("К ПРОВЕРКЕ");
        step = 3;
    } 
    else if (step === 3) {
        // СБОР ДАННЫХ И ОТПРАВКА
        let data = {
            order: cart,
            total: document.getElementById('total-price').innerText,
            user: {
                fio: document.getElementById('user-fio').value,
                phone: document.getElementById('user-phone').value,
                address: document.getElementById('user-address').value,
                city: document.getElementById('user-city').value,
                email: document.getElementById('user-email').value
            }
        };

        if (!data.user.fio || !data.user.phone) {
            tg.showAlert("Заполните имя и телефон!");
            return;
        }

        // КРИТИЧЕСКИЙ МОМЕНТ: Отправляем JSON строку боту
        tg.sendData(JSON.stringify(data));
    }
});

tg.BackButton.onClick(function() {
    if (step === 2) {
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-main').classList.add('active');
        tg.BackButton.hide();
        updateMainBtn();
        step = 1;
    } else if (step === 3) {
        document.getElementById('screen-delivery').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        step = 2;
    }
});
