let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; // main, cart, address, checkout

// База данных описаний товаров (для окна Инфо)
const productDetails = {
    'Handle': {
        title: 'JARVIS HANDLE', // Сэр, стилизовал название под Ваш вкус
        img: 'ruchka.webp',
        price: '$35.00',
        desc: 'Профессиональная ручка для армрестлинга. Уникальный хват, разработанный для максимальной изоляции мышц предплечья. Изготовлена из авиационного алюминия. Понимает контекст тренировки (шутка).'
    },
    'Expander': {
        title: 'EXPANDER MAX',
        img: 'expander.webp',
        price: '$12.00',
        desc: 'Высокотехнологичный кистевой эспандер с регулируемой нагрузкой. Идеален для разминки перед дуэлью или программированием. Работает как полноценный цифровой ассистент Вашей силы.'
    }
};

// --- Логика Окна Инфо (как на 3 скрине) ---
function showInfo(id) {
    const data = productDetails[id];
    if (!data) return;

    // Заполняем панель данными
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = data.price;

    // Открываем панель и блюрим задний фон
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
    
    // Скрываем главную кнопку TG, чтобы не мешала
    tg.MainButton.hide();
}

function closeInfo() {
    // Закрываем панель и убираем блюр
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
    
    // Возвращаем главную кнопку, если мы не на главном экране
    if (currentStep !== 'main') {
        tg.MainButton.show();
    } else {
        updateMainButton(); // Показываем кнопку корзины, если есть товары
    }
}

// Улучшение: закрытие панели по свайпу вниз
let touchStartY = 0;
const sheet = document.getElementById('info-sheet');
sheet.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
sheet.addEventListener('touchend', e => {
    const touchEndY = e.changedTouches[0].clientY;
    if (touchEndY - touchStartY > 100) { // Если свайп вниз больше 100px
        closeInfo();
    }
});


// --- Старая логика корзины (без изменений) ---
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
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;

    if (subtotal > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${subtotal.toFixed(2)})`,
            color: "#ffffff", text_color: "#000000", is_visible: true
        });
    } else if (subtotal === 0) tg.MainButton.hide();
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            subtotal += itemTotal;
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            list.innerHTML += `<div class="cart-item"><b>${name} x${cart[key].count}</b><div style="margin-left:auto">$${itemTotal.toFixed(2)}</div></div>`;
        }
    }
    document.getElementById('cart-total-price').innerText = `$${subtotal.toFixed(2)}`;
}

// --- Обновленная логика Проверки (с новыми полями Старка) ---
function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';
    
    let itemsDiv = document.getElementById('check-items');
    itemsDiv.innerHTML = '';
    for (let key in cart) {
        if (cart[key].count > 0) {
            itemsDiv.innerHTML += `<div>${key === 'Handle' ? 'Ручка Arm' : 'Эспандер'} — ${cart[key].count} шт.</div>`;
        }
    }
    
    // Собираем новые поля для отображения
    document.getElementById('check-address').innerHTML = `
        <b>ФИО:</b> ${document.getElementById('fio').value}<br>
        <b>Страна:</b> ${document.getElementById('country').value}<br>
        <b>Город:</b> ${document.getElementById('city').value}<br>
        <b>Пункт СДЭК:</b> ${document.getElementById('cdek-addr').value}<br>
        <b>Email:</b> ${document.getElementById('email').value}
    `;
    
    document.getElementById('check-total-price').innerText = document.getElementById('cart-total-price').innerText;
    tg.MainButton.setText("ПОДТВЕРДИТЬ И ОПЛАТИТЬ");
}

// --- Навигация (с валидацией новых полей) ---
tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        // Валидация новых полей (Старк, я проверяю все поля)
        const fio = document.getElementById('fio').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const cdek = document.getElementById('cdek-addr').value;
        const email = document.getElementById('email').value;

        if (!fio || !country || !city || !cdek || !email) {
            return tg.showAlert("Сэр, необходимо заполнить все поля получателя!");
        }
        // Простая проверка email
        if (!email.includes('@mail.ru')) {
            return tg.showAlert("Пожалуйста, используйте почту @mail.ru, как договаривались.");
        }

        showCheckout();
    } else if (currentStep === 'checkout') {
        // Отправка полных данных боту
        tg.sendData(JSON.stringify({
            cart,
            customer: {
                fio: document.getElementById('fio').value,
                country: document.getElementById('country').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek-addr').value,
                email: document.getElementById('email').value
            },
            total: document.getElementById('check-total-price').innerText
        }));
    }
});

tg.BackButton.onClick(() => {
    if (currentStep === 'checkout') {
        currentStep = 'address';
        document.getElementById('checkout-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
    } else if (currentStep === 'address') {
        currentStep = 'cart';
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
    } else if (currentStep === 'cart') {
        currentStep = 'main';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
    }
});
