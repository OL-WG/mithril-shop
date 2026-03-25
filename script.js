let tg = window.Telegram.WebApp;

// Инициализация
tg.expand();
tg.ready();

tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

// Данные о товарах
let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для тренировок." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер для силы хвата." }
};

let isJarvis = false;

// Обработчик нажатия на главную кнопку Telegram
tg.onEvent('mainButtonClicked', function () {
    if (isActive('shop-screen')) {
        showCart();
    }
    else if (isActive('cart-screen')) {
        showDelivery();
    }
    else if (isActive('delivery-screen')) {
        showCheckout();
    }
    else if (isActive('checkout-screen')) {
        sendOrder();
    }
});

// Добавление в корзину
function addToCart(id) {
    let card = document.getElementById(id);
    products[id].qty = 1;
    card.querySelector('.add-trigger').style.display = 'none';
    card.querySelector('.counter').style.display = 'flex';
    card.querySelector('.qty').innerText = 1;
    updateTotal();
}

// Изменение количества
function changeQty(id, delta) {
    let card = document.getElementById(id);
    products[id].qty += delta;
    if (products[id].qty <= 0) {
        products[id].qty = 0;
        card.querySelector('.add-trigger').style.display = 'block';
        card.querySelector('.counter').style.display = 'none';
    }
    else {
        card.querySelector('.qty').innerText = products[id].qty;
    }
    updateTotal();
}

// Применение промокода
function applyPromo() {
    let val = document.getElementById('promo-input').value.toLowerCase().trim();
    if (val === "jarvis") {
        isJarvis = true;
        tg.showAlert("Промокод JARVIS применен!");
        showCart(); // Перерисовываем корзину с учетом скидки
    } else {
        tg.showAlert("Неверный промокод");
    }
}

// Обновление состояния главной кнопки
function updateTotal() {
    let subtotal = 0;
    for (let id in products) {
        subtotal += products[id].price * products[id].qty;
    }

    if (subtotal > 0) {
        tg.MainButton.enable(); // Активируем кнопку, чтобы она была кликабельной
        
        if (isActive('shop-screen')) {
            tg.MainButton.setText(`В КОРЗИНУ $${subtotal.toFixed(2)}`);
        }
        else if (isActive('cart-screen')) {
            tg.MainButton.setText("К ОФОРМЛЕНИЮ");
        }
        else if (isActive('delivery-screen')) {
            tg.MainButton.setText("ПРОВЕРИТЬ ДАННЫЕ");
        }
        else if (isActive('checkout-screen')) {
            let final = isJarvis ? subtotal * 0.85 : subtotal;
            tg.MainButton.setText(`ОПЛАТИТЬ $${final.toFixed(2)}`);
        }
        tg.MainButton.show();
    }
    else {
        tg.MainButton.hide();
    }
}

// Экран корзины
function showCart() {
    switchScreen('cart-screen');
    let list = document.getElementById('cart-items-list');
    let summary = document.getElementById('cart-summary');
    list.innerHTML = '';
    let sub = 0;

    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            sub += sum;
            list.innerHTML += `<div class="cart-item">
                <span>${products[id].name} x${products[id].qty}</span>
                <span>$${sum.toFixed(2)}</span>
            </div>`;
        }
    }

    if (isJarvis) {
        let disc = sub * 0.15;
        summary.innerHTML = `
            <div>Сумма: $${sub.toFixed(2)}</div>
            <div>Скидка: -$${disc.toFixed(2)} (Промокод: JARVIS)</div>
            <b>Итого: $${(sub - disc).toFixed(2)}</b>
        `;
    }
    else {
        summary.innerHTML = `<b>Сумма: $${sub.toFixed(2)}</b>`;
    }
    updateTotal();
}

// Экран проверки заказа
function showCheckout() {
    // Валидация: проверяем, что все поля заполнены
    if (!v('fio') || !v('phone') || !v('country') || !v('city') || !v('address') || !v('email')) {
        tg.showAlert("Пожалуйста заполните все поля");
        return;
    }

    switchScreen('checkout-screen');

    let sub = 0;
    let items = "";

    for (let id in products) {
        if (products[id].qty > 0) {
            sub += products[id].price * products[id].qty;
            items += `<div>${products[id].name} x${products[id].qty} — $${(products[id].price * products[id].qty).toFixed(2)}</div>`;
        }
    }

    let final = isJarvis ? sub * 0.85 : sub;

    document.getElementById('check-order').innerHTML = `<b>Ваш заказ:</b><br>${items}`;

    // Текстовый вывод БЕЗ смайликов
    document.getElementById('check-delivery').innerHTML = `
        <b>Данные доставки:</b><br>
        ФИО: ${v('fio')}<br>
        Телефон: ${v('phone')}<br>
        Страна: ${v('country')}<br>
        Город: ${v('city')}<br>
        Адрес: ${v('address')}<br>
        Email: ${v('email')}
    `;
    
    // Показываем информацию о промокоде, если он есть
    let promoBlock = document.getElementById('check-promo-info');
    if (promoBlock) {
        promoBlock.innerText = isJarvis ? "Промокод: JARVIS (Скидка 15%)" : "";
    }

    document.getElementById('final-pay-amount').innerText = `К оплате: $${final.toFixed(2)}`;
    updateTotal();
}

// Отправка данных боту
function sendOrder() {
    let cart = {};
    let subtotal = 0;

    for (let id in products) {
        if (products[id].qty > 0) {
            cart[id] = {
                name: products[id].name,
                price: products[id].price,
                count: products[id].qty
            };
            subtotal += products[id].price * products[id].qty;
        }
    }

    let final = isJarvis ? subtotal * 0.85 : subtotal;

    let order = {
        customer: {
            fio: v('fio'),
            phone: v('phone'),
            country: v('country'),
            city: v('city'),
            cdek: v('address'),
            email: v('email')
        },
        cart: cart,
        promo: isJarvis ? "JARVIS" : "нет",
        total: final.toFixed(2)
    };

    tg.sendData(JSON.stringify(order));
    tg.MainButton.hide();
}

// Вспомогательные функции
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0, 0); // Прокрутка вверх при смене экрана
    updateTotal();
}

function isActive(id) {
    return document.getElementById(id).classList.contains('active');
}

function v(id) {
    return document.getElementById(id).value.trim() || "";
}

function showShop() { switchScreen('shop-screen'); }
function showDelivery() { switchScreen('delivery-screen'); }
function closeModal() { document.getElementById('info-modal').style.display = 'none'; }

function showInfo(id) {
    document.getElementById('modal-body').innerHTML = `<h2>${products[id].name}</h2><p>${products[id].desc}</p>`;
    document.getElementById('info-modal').style.display = 'flex';
}
