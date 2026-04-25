let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setParams({
    color: '#ffffff',
    text_color: '#000000'
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

// ГЛАВНАЯ ФУНКЦИЯ ПЕРЕКЛЮЧЕНИЯ
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    
    // Авто-обновление при входе на экран
    if (id === 'cart-screen') updateCart();
    if (id === 'checkout-screen') updateCheckout();
    
    updateMainButton();
}

function updateProductUI(id) {
    const card = document.getElementById(id);
    const qty = products[id].qty;
    const addBtn = card.querySelector('.add-trigger');
    const qtyCtrl = card.querySelector('.quantity-control');
    const qtySpan = card.querySelector('.qty');

    if (qty > 0) {
        addBtn.style.display = 'none';
        qtyCtrl.classList.add('show');
        qtySpan.innerText = qty;
    } else {
        addBtn.style.display = 'block';
        qtyCtrl.classList.remove('show');
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

// КОРЗИНА
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

// ЭКРАН ПРОВЕРКИ (CHECKOUT)
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
    document.getElementById('final-pay-amount').innerHTML = `
        <div style="padding: 20px; background: #111; border-radius: 15px; margin-top: 10px;">
            <h2 style="margin:0;">К оплате: $${total}</h2>
        </div>
    `;
}

// ТЕЛЕГРАМ КНОПКИ
function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
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
    else if (active === 'delivery-screen') showScreen('checkout-screen');
    else if (active === 'checkout-screen') {
        // Сбор данных для бота
        const orderData = {
            fio: document.getElementById('fio').value,
            phone: document.getElementById('phone').value,
            address: `${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('address').value}`,
            email: document.getElementById('email').value,
            items: Object.values(products).filter(p => p.qty > 0).map(p => `${p.name} x${p.qty}`),
            promo: isJarvis ? "JARVIS" : "Нет",
            total: document.getElementById('final-pay-amount').innerText
        };
        tg.sendData(JSON.stringify(orderData)); // Отправка в бот
    }
});

function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.desc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('info-modal').style.display = 'none'; }
function showShop() { showScreen('shop-screen'); }
function showCart() { showScreen('cart-screen'); }
function showDelivery() { showScreen('delivery-screen'); }

window.onload = () => { tg.ready(); updateMainButton(); };
