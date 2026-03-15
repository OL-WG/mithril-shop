let tg = window.Telegram.WebApp;
tg.expand();

// Устанавливаем стиль ГЛАВНОЙ НИЖНЕЙ кнопки на черно-белый
tg.MainButton.setParams({
    color: "#ffffff",
    text_color: "#000000"
});

let cart = [];
let step = 1; // 1: Магазин, 2: Корзина, 3: Доставка
let discount = 0;

function addToCart(name, price) {
    cart.push({name, price});
    updateMainButton();
}

function updateMainButton() {
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total > 0 && step === 1) {
        tg.MainButton.setText(`ПЕРЕЙТИ В КОРЗИНУ ($${total})`);
        tg.MainButton.show();
    }
}

function openInfo(title, price, img) {
    document.getElementById('info-title').innerText = title;
    document.getElementById('info-img').src = img;
    document.getElementById('info-panel').classList.add('show');
    document.getElementById('app-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-panel').classList.remove('show');
    document.getElementById('app-container').classList.remove('blur');
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.toUpperCase();
    if (code === "JARVIS") {
        discount = 0.1; // 10%
        tg.showAlert("Скидка 10% применена!");
    } else {
        discount = 0;
        tg.showAlert("Код не найден");
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items');
    let subtotal = cart.reduce((s, i) => s + i.price, 0);
    list.innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #222;"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
    let final = subtotal * (1 - discount);
    document.getElementById('total-val').innerText = `$${final.toFixed(2)}`;
}

// ЛОГИКА ГЛАВНОЙ НИЖНЕЙ КНОПКИ
tg.MainButton.onClick(() => {
    if (step === 1) {
        // Переход в корзину
        document.getElementById('screen-main').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        renderCart();
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        tg.BackButton.show();
        step = 2;
    } 
    else if (step === 2) {
        // Переход к адресу
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-address').classList.add('active');
        // Кнопка становится "К ПРОВЕРКЕ ДАННЫХ"
        tg.MainButton.setText("ОТПРАВИТЬ ЗАКАЗ");
        step = 3;
    } 
    else if (step === 3) {
        // ФИНАЛЬНЫЙ ШАГ: Сбор данных и ОТПРАВКА В БОТ
        const orderData = {
            cart: cart,
            total: document.getElementById('total-val').innerText,
            user: {
                fio: document.getElementById('user-fio').value,
                phone: document.getElementById('user-phone').value,
                country: document.getElementById('user-country').value,
                city: document.getElementById('user-city').value,
                address: document.getElementById('user-address').value,
                email: document.getElementById('user-email').value
            }
        };

        // Валидация: проверяем хотя бы ФИО и Телефон
        if (!orderData.user.fio || !orderData.user.phone) {
            tg.showAlert("Пожалуйста, заполните ФИО и Телефон!");
            return;
        }

        // ОТПРАВЛЯЕМ ДАННЫЕ В БОТ
        tg.sendData(JSON.stringify(orderData));
        tg.close(); // Закрываем Mini App
    }
});

tg.BackButton.onClick(() => {
    if (step === 2) {
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-main').classList.add('active');
        tg.BackButton.hide();
        updateMainButton();
        step = 1;
    } else if (step === 3) {
        document.getElementById('screen-address').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        step = 2;
    }
});
