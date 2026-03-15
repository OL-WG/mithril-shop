let tg = window.Telegram.WebApp;
tg.expand();

let cart = {};
let currentStep = 'main'; // main, cart, address, checkout
let discountPercent = 0; // Процент скидки (напр. 0.1 для 10%)
let appliedPromo = "";

// ТВОИ ДАННЫЕ ДЛЯ ОТПРАВКИ
const BOT_TOKEN = '8677453235:AAHRTKraVGyg_Kh_kByvgyMHcq_IA7x2who';
const CHAT_ID = '-1003538222198';

// База данных описаний товаров (Строго с твоими $)
const productDetails = {
    'Handle': { title: 'JARVIS HANDLE', img: 'ruchka.webp', price: '$35.00', desc: 'Профессиональная ручка для армрестлинга. Изготовлена из авиационного алюминия.' },
    'Expander': { title: 'EXPANDER MAX', img: 'expander.webp', price: '$12.00', desc: 'Высокотехнологичный кистевой эспандер с регулируемой нагрузкой.' }
};

// --- Логика Окна Инфо ---
function showInfo(id) {
    const data = productDetails[id];
    if (!data) return;
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.img;
    document.getElementById('sheet-desc').innerText = data.desc;
    document.getElementById('sheet-price').innerText = data.price;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
    tg.MainButton.hide();
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
    if (currentStep !== 'main') { tg.MainButton.show(); } else { updateMainButton(); }
}

// Закрытие по свайпу
let touchStartY = 0;
const sheet = document.getElementById('info-sheet');
if (sheet) {
    sheet.addEventListener('touchstart', e => touchStartY = e.touches[0].clientY);
    sheet.addEventListener('touchend', e => {
        if (e.changedTouches[0].clientY - touchStartY > 100) { closeInfo(); }
    });
}

// --- Логика корзины ---
function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    // Очищаем цену от $ для расчетов
    let numPrice = typeof price === 'string' ? parseFloat(price.replace('$', '')) : price;
    cart[id] = { count: 1, price: numPrice };
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

// --- СИСТЕМА СКИДОК ---
function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const msg = document.getElementById('promo-msg');
    
    if (code === "JARVIS") {
        discountPercent = 0.10; 
        appliedPromo = code;
        msg.innerText = "Промокод применен! Скидка 10%.";
        msg.style.color = "#4CAF50"; 
    } else {
        discountPercent = 0;
        appliedPromo = "";
        msg.innerText = "Неверный промокод.";
        msg.style.color = "#f44336"; 
    }
    renderCart(); 
}

function updateMainButton() {
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            color: "#000000",
            text_color: "#ffffff",
            is_visible: true
        });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            subtotal += itemTotal;
            let name = key === 'Handle' ? 'Ручка Arm' : 'Эспандер';
            list.innerHTML += `<div class="cart-item"><span><b>${name}</b> x${cart[key].count}</span><span style="margin-left:auto">$${itemTotal.toFixed(2)}</span></div>`;
        }
    }
    
    let discountVal = subtotal * discountPercent;
    let finalTotal = subtotal - discountVal;

    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    
    if (discountVal > 0) {
        document.getElementById('cart-discount-row').style.display = 'flex';
        document.getElementById('cart-discount-val').innerText = `-$${discountVal.toFixed(2)}`;
    } else {
        document.getElementById('cart-discount-row').style.display = 'none';
    }
    
    document.getElementById('cart-total-price').innerText = `$${finalTotal.toFixed(2)}`;
}

// --- Логика Проверки ---
function showCheckout() {
    currentStep = 'checkout';
    document.getElementById('address-screen').style.display = 'none';
    document.getElementById('checkout-screen').style.display = 'block';
    
    let itemsDiv = document.getElementById('check-items');
    itemsDiv.innerHTML = '';
    let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            subtotal += cart[key].count * cart[key].price;
            itemsDiv.innerHTML += `<div>${key === 'Handle' ? 'Ручка Arm' : 'Эспандер'} — ${cart[key].count} шт.</div>`;
        }
    }
    
    const fio = document.getElementById('fio').value;
    const phone = document.getElementById('phone').value;
    const country = document.getElementById('country').value;
    const city = document.getElementById('city').value;
    const cdek = document.getElementById('cdek-addr').value;
    const email = document.getElementById('email').value;

    document.getElementById('check-address').innerHTML = `
        <b>ФИО:</b> ${fio}<br>
        <b>Тел:</b> ${phone}<br>
        <b>Страна:</b> ${country}<br>
        <b>Город:</b> ${city}<br>
        <b>Пункт СДЭК:</b> ${cdek}<br>
        <b>Email:</b> ${email}
    `;
    
    const finalTotalStr = document.getElementById('cart-total-price').innerText;
    document.getElementById('check-total-price').innerText = finalTotalStr;
    
    if (discountPercent > 0) {
        document.getElementById('check-old-price').innerText = `$${subtotal.toFixed(2)}`;
        document.getElementById('check-old-price').style.display = 'block';
    } else {
        document.getElementById('check-old-price').style.display = 'none';
    }
    
    tg.MainButton.setParams({ text: "ПОДТВЕРДИТЬ И ОПЛАТИТЬ", color: "#000000", text_color: "#ffffff" });
}

// --- Обработчик Главной кнопки ---
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
        const fields = ['fio', 'phone', 'country', 'city', 'cdek-addr', 'email'];
        if (fields.some(id => !document.getElementById(id).value)) {
            return tg.showAlert("Сэр, необходимо заполнить все поля получателя!");
        }
        showCheckout();
    } else if (currentStep === 'checkout') {
        tg.MainButton.showProgress();

        const fio = document.getElementById('fio').value;
        const phone = document.getElementById('phone').value;
        const country = document.getElementById('country').value;
        const city = document.getElementById('city').value;
        const cdek = document.getElementById('cdek-addr').value;
        const email = document.getElementById('email').value;
        const finalTotal = document.getElementById('check-total-price').innerText;

        let itemsText = "";
        for (let key in cart) {
            if (cart[key].count > 0) {
                itemsText += `- ${key === 'Handle' ? 'Ручка Arm' : 'Эспандер'}: ${cart[key].count} шт.\n`;
            }
        }

        const message = "🔥 НОВЫЙ ЗАКАЗ 🔥\n\n" +
                        "👤 Клиент: " + fio + "\n" +
                        "📞 Тел: " + phone + "\n" +
                        "📧 Email: " + email + "\n\n" +
                        "📦 Доставка:\n" + country + ", " + city + "\n" +
                        "🏢 ПВЗ СДЭК: " + cdek + "\n\n" +
                        "🛒 Товары:\n" + itemsText + "\n" +
                        "🎫 Промо: " + (appliedPromo || "Нет") + "\n" +
                        "✅ ИТОГО: " + finalTotal;

        // Отправка запроса
        fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                chat_id: CHAT_ID,
                text: message
            })
        })
        .then(response => {
            if (response.ok) {
                const orderData = { cart, customer: { fio, phone, country, city, cdek, email }, promo: appliedPromo, total: finalTotal };
                tg.sendData(JSON.stringify(orderData));
                setTimeout(() => tg.close(), 150);
            } else {
                tg.hideProgress();
                tg.showAlert("Ошибка отправки. Проверьте, добавлен ли бот в группу.");
            }
        })
        .catch(err => {
            tg.hideProgress();
            tg.showAlert("Ошибка соединения.");
        });
    }
});

// Назад
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
