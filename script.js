let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setParams({
    color: '#000000', // Черный фон кнопки
    text_color: '#ffffff' // Белые буквы
});

let products = {
    item1: { 
        name: "РУЧКА ARM", 
        price: 35, 
        qty: 0, 
        img: 'ruchka.webp',
        desc: "Профессиональный инструмент для развития силы пронации и подъема." 
    },
    item2: { 
        name: "ЭСПАНДЕР", 
        price: 12, 
        qty: 0, 
        img: 'expander.webp',
        desc: "Кистевой эспандер для развития взрывной силы хвата." 
    }
};

let isJarvis = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    if (id === 'cart-screen') updateCart();
    if (id === 'checkout-screen') updateCheckout();
    
    updateMainButton();
}

// 1. ИСПРАВЛЕНИЕ СМЕЩЕНИЯ КНОПКИ ИНФО (через фиксацию структуры в UI)
function updateProductUI(id) {
    const card = document.getElementById(id);
    const qty = products[id].qty;
    const addBtn = card.querySelector('.add-trigger');
    const qtyCtrl = card.querySelector('.quantity-control');
    const qtySpan = card.querySelector('.qty');

    if (qty > 0) {
        addBtn.style.display = 'none';
        qtyCtrl.style.display = 'flex'; // Показываем контроллер вместо кнопки добавить
        qtySpan.innerText = qty;
    } else {
        addBtn.style.display = 'block';
        qtyCtrl.style.display = 'none';
    }
    updateMainButton();
}

function addToCart(id) {
    products[id].qty = 1;
    updateProductUI(id);
}

function changeQty(id, delta) {
    products[id].qty = Math.max(0, products[id].qty + delta);
    updateProductUI(id);
}

function updateCart() {
    let html = '';
    let subtotal = 0;
    let hasItems = false;

    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum;
            hasItems = true;
            html += `
                <div class="cart-item">
                    <span>${products[id].name} x${products[id].qty}</span>
                    <span>$${sum}</span>
                </div>`;
        }
    }

    if (!hasItems) {
        document.getElementById('cart-items-list').innerHTML = '<p style="text-align:center; padding:20px; color:#888;">Корзина пуста</p>';
        document.getElementById('cart-summary').innerHTML = '';
        return;
    }

    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    
    document.getElementById('cart-items-list').innerHTML = html;
    document.getElementById('cart-summary').innerHTML = `
        <div style="padding: 20px; border-top: 1px solid #222;">
            <p>Сумма: $${subtotal}</p>
            ${isJarvis ? `<p style="color:#30d1a9">Скидка (JARVIS): -$${discount}</p>` : ''}
            <h3 style="font-size: 24px;">Итого: $${total}</h3>
        </div>
    `;
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    isJarvis = (code === 'JARVIS');
    if (isJarvis) alert('✅ Скидка 15% применена!');
    else alert('❌ Код не найден');
    updateCart();
}

// 3. ОТОБРАЖЕНИЕ ПРОМОКОДА И ЗАЧЕРКНУТОЙ ЦЕНЫ
function updateCheckout() {
    let itemsHtml = '<h3>Ваш заказ:</h3>';
    let subtotal = 0;
    
    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum;
            itemsHtml += `<p>${products[id].name} x${products[id].qty} — $${sum}</p>`;
        }
    }
    
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;

    const deliveryHtml = `
        <h3>Доставка:</h3>
        <p><b>Получатель:</b> ${document.getElementById('fio').value}</p>
        <p><b>Телефон:</b> ${document.getElementById('phone').value}</p>
        <p><b>Адрес:</b> ${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('address').value}</p>
    `;

    document.getElementById('check-order').innerHTML = itemsHtml;
    document.getElementById('check-delivery').innerHTML = deliveryHtml;
    
    // Блок цены с зачеркиванием
    let priceBlock = '';
    if (isJarvis) {
        priceBlock = `
            <div style="padding: 20px; background: #111; border-radius: 15px; margin-top: 10px;">
                <p style="margin:0; color:#888; font-size:14px;">Промокод: JARVIS</p>
                <p style="margin:5px 0; text-decoration: line-through; color: #ff4d4d; font-size:18px;">$${subtotal}</p>
                <h2 style="margin:0; color:#fff;">К оплате: $${total}</h2>
            </div>
        `;
    } else {
        priceBlock = `
            <div style="padding: 20px; background: #111; border-radius: 15px; margin-top: 10px;">
                <h2 style="margin:0;">К оплате: $${subtotal}</h2>
            </div>
        `;
    }
    document.getElementById('final-pay-amount').innerHTML = priceBlock;
}

// 2. ПРОВЕРКА ЗАПОЛНЕНИЯ ПОЛЕЙ
function validateDelivery() {
    const fields = ['fio', 'phone', 'country', 'city', 'address'];
    for (let id of fields) {
        if (!document.getElementById(id).value.trim()) {
            return false;
        }
    }
    return true;
}

function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    // 4. КНОПКИ: ЧЕРНЫЙ ФОН, БЕЛЫЕ БУКВЫ (задано в параметрах tg.MainButton)
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) {
            tg.MainButton.setText(`🛒 КОРЗИНА (${count})`).show();
        } else tg.MainButton.hide();
    } else if (active === 'cart-screen') {
        tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ').show();
    } else if (active === 'delivery-screen') {
        tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ').show();
    } else if (active === 'checkout-screen') {
        tg.MainButton.setText('📤 ОТПРАВИТЬ ЗАКАЗ').show();
    }
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showScreen('cart-screen');
    else if (active === 'cart-screen') showScreen('delivery-screen');
    else if (active === 'delivery-screen') {
        // Проверка перед переходом
        if (validateDelivery()) {
            showScreen('checkout-screen');
        } else {
            tg.showAlert('⚠️ Пожалуйста, заполните все поля доставки!');
        }
    }
    else if (active === 'checkout-screen') {
        const orderData = {
            fio: document.getElementById('fio').value,
            phone: document.getElementById('phone').value,
            address: `${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('address').value}`,
            items: Object.values(products).filter(p => p.qty > 0).map(p => `${p.name} x${p.qty}`),
            promo: isJarvis ? "JARVIS" : "Нет",
            total: document.getElementById('final-pay-amount').innerText
        };
        tg.sendData(JSON.stringify(orderData));
    }
});
