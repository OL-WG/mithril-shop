let tg = window.Telegram.WebApp;
tg.expand();

// Настройка стиля главной кнопки: Черный фон, Белые буквы
tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

let products = {
    item1: {
        id: 'item1',
        name: 'Рукоятка "AXE"',
        price: 35,
        qty: 0,
        img: 'ruchka.webp',
        desc: 'Для силы пронации и силы подъема.',
        fullDesc: 'Рукоятка "AXE" — это универсальный тренировочный инструмент, специально разработанный для развития силы пронации и силы подъема. Инновационная конструкция обеспечивает точное задействование мышц, что делает ее идеальной для армрестлеров, стремящихся к совершенствованию техники и развитию взрывной силы.'
    },
    item2: {
        id: 'item2',
        name: 'Эспандер',
        price: 12,
        qty: 0,
        img: 'expander.webp',
        desc: 'Для развития силы хвата.',
        fullDesc: 'Профессиональный кистевой эспандер MithrilArm. Разработан для тренировки связок и мышц предплечья. Высокая надежность и долговечность.'
    }
};

let isJarvis = false;

// Отрисовка товаров
function renderProducts() {
    const list = document.querySelector('.products-list');
    list.innerHTML = '';
    for (let id in products) {
        const p = products[id];
        list.innerHTML += `
            <div class="product-card">
                <div class="image-box">
                    <div class="badge badge-new">+ NEW</div>
                    <div class="badge badge-stock">В НАЛИЧИИ</div>
                    <img src="${p.img}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="description">${p.desc}</p>
                    <div class="price-row">
                        <div class="price-val">$${p.price}.00</div>
                        <div class="controls">
                            <button class="btn-info-small" onclick="showInfo('${p.id}')">ИНФО</button>
                            <button class="btn-add-main" id="add-btn-${p.id}" onclick="addToCart('${p.id}')" ${p.qty > 0 ? 'style="display:none"' : ''}>ДОБАВИТЬ</button>
                            <div class="quantity-control ${p.qty > 0 ? 'show' : ''}" id="qty-ctrl-${p.id}">
                                <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
                                <span class="qty" id="qty-val-${p.id}">${p.qty}</span>
                                <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>`;
    }
}

// Навигация
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    updateMainButton();
}

function showShop() { showScreen('shop-screen'); }
function showCart() { renderCart(); showScreen('cart-screen'); }
function showDelivery() { showScreen('delivery-screen'); }
function showCheckout() { renderCheckout(); showScreen('checkout-screen'); }

// Логика корзины
function addToCart(id) {
    products[id].qty = 1;
    renderProducts();
    updateMainButton();
}

function changeQty(id, delta) {
    products[id].qty += delta;
    if (products[id].qty < 0) products[id].qty = 0;
    renderProducts();
    updateMainButton();
}

// Рендеринг корзины
function renderCart() {
    let html = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            let p = products[id];
            subtotal += p.price * p.qty;
            html += `<div class="cart-item"><span>${p.name} x${p.qty}</span><span>$${p.price * p.qty}</span></div>`;
        }
    }
    document.getElementById('cart-items-list').innerHTML = html || '<p style="text-align:center; padding:20px;">Корзина пуста</p>';
    document.getElementById('cart-summary').innerHTML = `Итого: <b>$${subtotal}</b>`;
}

// Рендеринг финальной проверки
function renderCheckout() {
    let subtotal = 0;
    let orderHTML = '';
    for (let id in products) {
        if (products[id].qty > 0) {
            let p = products[id];
            let sum = p.price * p.qty;
            subtotal += sum;
            orderHTML += `<div>${p.name} x${p.qty} — $${sum}</div>`;
        }
    }
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const final = subtotal - discount;

    document.getElementById('check-order').innerHTML = orderHTML;
    document.getElementById('check-delivery').innerHTML = `
        <br><b>Получатель:</b> ${document.getElementById('fio').value}<br>
        <b>Адрес:</b> ${document.getElementById('city').value}, ${document.getElementById('address').value}`;
    document.getElementById('final-pay-amount').innerHTML = `<div class="summary">К оплате: <b>$${final}</b></div>`;
}

// Главная кнопка TG
function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) {
            tg.MainButton.setText(`🛒 В КОРЗИНУ (${count})`);
            tg.MainButton.show();
        } else tg.MainButton.hide();
    } else if (active === 'cart-screen') {
        tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ');
    } else if (active === 'delivery-screen') {
        tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ');
    } else if (active === 'checkout-screen') {
        tg.MainButton.setText('💳 ПОДТВЕРДИТЬ И ОПЛАТИТЬ');
    }
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showCart();
    else if (active === 'cart-screen') showDelivery();
    else if (active === 'delivery-screen') {
        if (document.getElementById('fio').value.length < 3) alert('Заполните данные доставки');
        else showCheckout();
    }
    else if (active === 'checkout-screen') sendOrder();
});

// Работа с заказом
function sendOrder() {
    let orderData = {
        cart: products,
        customer: { fio: document.getElementById('fio').value, phone: document.getElementById('phone').value },
        total: document.getElementById('final-pay-amount').innerText
    };
    tg.sendData(JSON.stringify(orderData));
}

// Модалка
function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.fullDesc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}
function closeModal() { document.getElementById('info-modal').style.display = 'none'; }

function applyPromo() {
    if (document.getElementById('promo-input').value.toUpperCase() === 'JARVIS') {
        isJarvis = true;
        alert('Скидка 15% применена!');
        renderCart();
    }
}

window.onload = () => { renderProducts(); tg.ready(); };
