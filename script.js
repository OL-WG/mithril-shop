let tg = window.Telegram.WebApp;
tg.expand();

// Настройка MainButton: Черный фон, Белые буквы
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
        desc: 'Развитие силы пронации и подъема.',
        fullDesc: 'Рукоятка "AXE" — это универсальный тренировочный инструмент, специально разработанный для развития силы пронации и силы подъема. Инновационная конструкция обеспечивает точное задействование мышц.'
    },
    item2: {
        id: 'item2',
        name: 'Эспандер',
        price: 12,
        qty: 0,
        img: 'expander.webp',
        desc: 'Сила хвата и выносливость.',
        fullDesc: 'Профессиональный кистевой эспандер для развития взрывной силы хвата. Идеально подходит для подготовки к соревнованиям.'
    }
};

function renderProducts() {
    const list = document.querySelector('.products-list');
    list.innerHTML = '';
    for (let id in products) {
        const p = products[id];
        list.innerHTML += `
            <div class="product-card">
                <div class="image-box">
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

function renderCart() {
    let html = '';
    let total = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            let p = products[id];
            total += p.price * p.qty;
            html += `<div class="cart-item"><span>${p.name} x${p.qty}</span><span>$${p.price * p.qty}</span></div>`;
        }
    }
    document.getElementById('cart-items-list').innerHTML = html || '<p style="text-align:center; padding:20px;">Корзина пуста</p>';
    document.getElementById('cart-summary').innerHTML = `Итого: <b>$${total}</b>`;
}

function renderCheckout() {
    let subtotal = 0;
    let orderHTML = '';
    for (let id in products) {
        if (products[id].qty > 0) {
            subtotal += products[id].price * products[id].qty;
            orderHTML += `<div>${products[id].name} x${products[id].qty}</div>`;
        }
    }
    document.getElementById('check-order').innerHTML = `<b>Заказ:</b><br>${orderHTML}`;
    document.getElementById('check-delivery').innerHTML = `<b>Доставка:</b><br>${document.getElementById('city').value}, ${document.getElementById('address').value}`;
    document.getElementById('final-pay-amount').innerHTML = `<div class="summary">К оплате: <b>$${subtotal}</b></div>`;
}

// Логика MainButton
function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) {
            tg.MainButton.setText(`🛒 КОРЗИНА (${count})`);
            tg.MainButton.show();
        } else tg.MainButton.hide();
    } else if (active === 'cart-screen') {
        tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ');
        tg.MainButton.show();
    } else if (active === 'delivery-screen') {
        tg.MainButton.setText('✅ ПРОВЕРИТЬ ДАННЫЕ');
        tg.MainButton.show();
    } else if (active === 'checkout-screen') {
        tg.MainButton.setText('💳 ОПЛАТИТЬ');
        tg.MainButton.show();
    }
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showCart();
    else if (active === 'cart-screen') showDelivery();
    else if (active === 'delivery-screen') {
        if (document.getElementById('fio').value.length < 2) alert('Введите ФИО');
        else showCheckout();
    }
    else if (active === 'checkout-screen') tg.close();
});

// Модальное окно
function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.fullDesc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('info-modal').style.display = 'none';
}

window.onload = () => { renderProducts(); tg.ready(); };
