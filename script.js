let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для тренировок." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер для силы хвата." }
};

let isJarvis = false;

function v(id) { 
    return (document.getElementById(id) || {}).value ? document.getElementById(id).value.trim() : ''; 
}

// Проверка, все ли поля доставки заполнены
function isDeliveryFormValid() {
    const fields = ['fio', 'phone', 'country', 'city', 'address', 'email'];
    for (let field of fields) {
        if (!v(field)) {
            return false;
        }
    }
    return true;
}

// Показать предупреждение о незаполненных полях
function showDeliveryWarning() {
    alert("⚠️ Пожалуйста, заполните все поля доставки:\n\n• ФИО\n• Телефон\n• Страна\n• Город\n• Адрес СДЭК\n• Email");
}

function isActive(screen) {
    return document.getElementById(screen).classList.contains('active');
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    updateMainButton();
}

function updateProductCard(id) {
    const card = document.getElementById(id);
    if (!card) return;
    const addBtn = card.querySelector('.add-trigger');
    const counter = card.querySelector('.counter');
    const qtySpan = counter ? counter.querySelector('.qty') : null;
    const qty = products[id].qty;

    if (qty > 0) {
        addBtn.style.display = 'none';
        counter.style.display = 'flex';
        if (qtySpan) qtySpan.textContent = qty;
    } else {
        addBtn.style.display = 'block';
        counter.style.display = 'none';
    }
}

function addToCart(id) {
    products[id].qty = 1;
    updateProductCard(id);
}

function changeQty(id, delta) {
    let qty = products[id].qty + delta;
    if (qty < 0) qty = 0;
    products[id].qty = qty;
    updateProductCard(id);
    if (isActive('cart-screen')) updateCart();
}

function updateCart() {
    let html = '';
    let subtotal = 0;

    for (let id in products) {
        if (products[id].qty > 0) {
            const item = products[id];
            const sum = item.price * item.qty;
            subtotal += sum;
            html += `
                <div class="cart-item">
                    <div><strong>${item.name}</strong><br>${item.qty} шт. × $${item.price}</div>
                    <div>$${sum}</div>
                </div>`;
        }
    }

    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;

    let summaryHTML = `<p>Итого без скидки: <strong>$${subtotal}</strong></p>`;

    if (isJarvis && discount > 0) {
        summaryHTML += `
            <p style="color: #ff4444; font-weight: bold; margin: 8px 0;">
                −$${discount} (скидка 15% по промокоду JARVIS)
            </p>`;
    }

    summaryHTML += `<p style="font-size: 18px; margin-top: 12px;">К оплате: <strong>$${total}</strong></p>`;

    document.getElementById('cart-items-list').innerHTML = html || '<p style="text-align:center; padding:20px;">Корзина пуста</p>';
    document.getElementById('cart-summary').innerHTML = summaryHTML;
}

function showShop() { showScreen('shop-screen'); }
function showCart() { updateCart(); showScreen('cart-screen'); }

function showDelivery() {
    showScreen('delivery-screen');
}

function showCheckout() {
    if (!isDeliveryFormValid()) {
        showDeliveryWarning();
        return;                    // ← НЕ пускаем дальше!
    }

    let subtotal = 0;
    let orderHTML = '';
    for (let id in products) {
        if (products[id].qty > 0) {
            const item = products[id];
            const sum = item.price * item.qty;
            subtotal += sum;
            orderHTML += `<div>${item.name} × ${item.qty} — $${sum}</div>`;
        }
    }

    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;

    document.getElementById('check-order').innerHTML = orderHTML || 'Нет товаров';
    document.getElementById('check-delivery').innerHTML = `
        ФИО: ${v('fio')}<br>
        Телефон: ${v('phone')}<br>
        Страна: ${v('country')}<br>
        Город: ${v('city')}<br>
        Адрес СДЭК: ${v('address')}<br>
        Email: ${v('email')}
    `;

    let checkoutHTML = `<p>Итого без скидки: <strong>$${subtotal}</strong></p>`;
    if (isJarvis && discount > 0) {
        checkoutHTML += `<p style="color: #ff4444; font-weight: bold;">−$${discount} (скидка 15% по промокоду JARVIS)</p>`;
    }
    checkoutHTML += `<h3 style="margin-top: 15px;">К оплате: <strong>$${total}</strong></h3>`;

    document.getElementById('final-pay-amount').innerHTML = checkoutHTML;
    document.getElementById('check-promo-info').innerHTML = isJarvis ? '🎟 Промокод JARVIS применён' : '';

    showScreen('checkout-screen');
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    if (code === 'JARVIS') {
        isJarvis = true;
        alert('✅ Промокод JARVIS применён! Скидка 15%');
    } else {
        isJarvis = false;
        alert('❌ Неправильный промокод');
    }
    if (isActive('cart-screen')) updateCart();
}

function showInfo(id) {
    const item = products[id];
    document.getElementById('modal-body').innerHTML = `
        <h3>${item.name}</h3>
        <p>${item.desc}</p>
        <p><strong>Цена: $${item.price}</strong></p>
    `;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('info-modal').style.display = 'none';
}

function sendOrder() {
    const orderData = {
        customer: {
            fio: v('fio'),
            phone: v('phone'),
            country: v('country'),
            city: v('city'),
            cdek: v('address'),
            email: v('email')
        },
        cart: {},
        promo: isJarvis ? "JARVIS" : "нет",
        total: 0
    };

    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            orderData.cart[id] = {
                name: products[id].name,
                price: products[id].price,
                count: products[id].qty
            };
            subtotal += products[id].price * products[id].qty;
        }
    }

    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    orderData.total = subtotal - discount;

    tg.sendData(JSON.stringify(orderData));
    setTimeout(() => tg.close(), 500);
}

// Обработка нажатия Главной кнопки Telegram
tg.MainButton.onClick(() => {
    if (isActive('shop-screen')) {
        showCart();
    }
    else if (isActive('cart-screen')) {
        showDelivery();
    }
    else if (isActive('delivery-screen')) {
        showCheckout();           // здесь происходит проверка
    }
    else if (isActive('checkout-screen')) {
        sendOrder();
    }
});

function updateMainButton() {
    if (isActive('shop-screen')) {
        tg.MainButton.setText('🛒 Перейти в корзину');
    } else if (isActive('cart-screen')) {
        tg.MainButton.setText('🚚 Далее: Доставка');
    } else if (isActive('delivery-screen')) {
        tg.MainButton.setText('✅ Проверить заказ');
    } else if (isActive('checkout-screen')) {
        tg.MainButton.setText('💳 ОФОРМИТЬ ЗАКАЗ');
    }
    tg.MainButton.show();
}

function initProducts() {
    for (let id in products) updateProductCard(id);
}

window.onload = () => {
    initProducts();
    updateMainButton();
};
