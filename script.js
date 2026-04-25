let tg = window.Telegram.WebApp;
tg.expand();

// Настройка главной кнопки
tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

let products = {
    item1: { name: "РУЧКА ARM", price: 35, qty: 0, desc: "Профессиональная ручка для развития силы пронации и подъема." },
    item2: { name: "ЭСПАНДЕР", price: 12, qty: 0, desc: "Кистевой эспандер для развития взрывной силы хвата." }
};

let isJarvis = false;

// 2. ИСПРАВЛЕННАЯ ФУНКЦИЯ НАЗАД
tg.BackButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'cart-screen') showScreen('shop-screen');
    else if (active === 'delivery-screen') showScreen('cart-screen');
    else if (active === 'checkout-screen') showScreen('delivery-screen');
    else if (active === 'shop-screen') showScreen('welcome-screen');
});

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Показываем кнопку назад везде, кроме главного экрана
    if (id === 'welcome-screen') tg.BackButton.hide();
    else tg.BackButton.show();

    if (id === 'cart-screen') updateCart();
    if (id === 'checkout-screen') updateCheckout();
    
    updateMainButton();
}

// 1. ИСПРАВЛЕННАЯ ФУНКЦИЯ ИНФО (Через нативный попап)
function showInfo(id) {
    tg.showPopup({
        title: products[id].name,
        message: products[id].desc + "\n\nЦена: $" + products[id].price,
        buttons: [{type: 'ok', text: 'Понятно'}]
    });
}

function addToCart(id) {
    products[id].qty = 1;
    updateProductUI(id);
}

function changeQty(id, delta) {
    products[id].qty = Math.max(0, products[id].qty + delta);
    updateProductUI(id);
}

function updateProductUI(id) {
    const card = document.getElementById(id);
    const qty = products[id].qty;
    const addBtn = card.querySelector('.add-trigger');
    const qtyCtrl = card.querySelector('.quantity-control');
    const qtySpan = card.querySelector('.qty');

    if (qty > 0) {
        addBtn.style.display = 'none';
        qtyCtrl.style.display = 'flex';
        qtySpan.innerText = qty;
    } else {
        addBtn.style.display = 'block';
        qtyCtrl.style.display = 'none';
    }
    updateMainButton();
}

function updateCart() {
    let html = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].price * products[id].qty;
            subtotal += sum;
            html += `<div style="display:flex; justify-content:space-between; padding:10px 0; border-bottom:1px solid #222;">
                <span>${products[id].name} x${products[id].qty}</span>
                <span>$${sum}</span>
            </div>`;
        }
    }
    document.getElementById('cart-items-list').innerHTML = html || '<p>Корзина пуста</p>';
    
    let discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    document.getElementById('cart-summary').innerHTML = `
        <div style="text-align:right; margin-top:20px;">
            <p>Сумма: $${subtotal}</p>
            ${isJarvis ? `<p style="color:#30d1a9">Скидка: -$${discount}</p>` : ''}
            <h3>Итого: $${subtotal - discount}</h3>
        </div>
    `;
}

function applyPromo() {
    if (document.getElementById('promo-input').value.toLowerCase() === 'jarvis') {
        isJarvis = true;
        tg.showAlert('Промокод применен!');
        updateCart();
    } else tg.showAlert('Неверный код');
}

function updateCheckout() {
    let subtotal = 0;
    for (let id in products) { if(products[id].qty > 0) subtotal += products[id].price * products[id].qty; }
    let total = isJarvis ? subtotal * 0.85 : subtotal;

    document.getElementById('check-order').innerHTML = `<h3>Товары:</h3>` + 
        Object.values(products).filter(p => p.qty > 0).map(p => `<p>${p.name} x${p.qty}</p>`).join('');
    
    document.getElementById('check-delivery').innerHTML = `<h3>Доставка:</h3>
        <p>${document.getElementById('fio').value}</p>
        <p>${document.getElementById('phone').value}</p>
        <p>${document.getElementById('address').value}</p>`;

    document.getElementById('final-pay-amount').innerHTML = `
        <div style="background:#111; padding:15px; border-radius:15px;">
            ${isJarvis ? `<p style="text-decoration:line-through; color:red;">$${subtotal}</p>` : ''}
            <h2>К оплате: $${total}</h2>
        </div>`;
}

function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) tg.MainButton.setText(`🛒 КОРЗИНА (${count})`).show();
        else tg.MainButton.hide();
    } 
    else if (active === 'cart-screen') tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ').show();
    else if (active === 'delivery-screen') tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ').show();
    else if (active === 'checkout-screen') tg.MainButton.setText('💳 ОПЛАТИТЬ').show();
    else tg.MainButton.hide();
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showScreen('cart-screen');
    else if (active === 'cart-screen') showScreen('delivery-screen');
    else if (active === 'delivery-screen') {
        if (document.getElementById('fio').value && document.getElementById('phone').value) showScreen('checkout-screen');
        else tg.showAlert('Заполните данные доставки!');
    }
    else if (active === 'checkout-screen') {
        tg.sendData(JSON.stringify({order: "success"}));
    }
});
