let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

let products = {
    item1: { 
        name: "РУЧКА ARM", 
        price: 35, 
        qty: 0, 
        img: 'ruchka.webp',
        desc: "Профессиональный инструмент для развития силы пронации и подъема. Инновационная конструкция обеспечивает точное задействование мышц." 
    },
    item2: { 
        name: "ЭСПАНДЕР", 
        price: 12, 
        qty: 0, 
        img: 'expander.webp',
        desc: "Кистевой эспандер для развития взрывной силы хвата. Идеально подходит для подготовки к соревнованиям." 
    }
};

let isJarvis = false;

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
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

function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.desc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('info-modal').style.display = 'none';
}

function updateCart() {
    let html = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum;
            html += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    
    document.getElementById('cart-items-list').innerHTML = html || '<p style="text-align:center; padding:20px;">Корзина пуста</p>';
    document.getElementById('cart-summary').innerHTML = `
        <p>Сумма: $${subtotal}</p>
        ${isJarvis ? `<p style="color:#30d1a9">Скидка: -$${discount}</p>` : ''}
        <h3>Итого: $${total}</h3>
    `;
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    if (code === 'JARVIS') {
        isJarvis = true;
        alert('✅ Промокод применен!');
    } else {
        isJarvis = false;
        alert('❌ Неверный код');
    }
    updateCart();
}

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
        tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ');
        tg.MainButton.show();
    } else if (active === 'checkout-screen') {
        tg.MainButton.setText('💳 ОПЛАТИТЬ');
        tg.MainButton.show();
    }
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showScreen('cart-screen');
    else if (active === 'cart-screen') showScreen('delivery-screen');
    else if (active === 'delivery-screen') showScreen('checkout-screen');
    else if (active === 'checkout-screen') {
        // Здесь логика отправки в бот
        tg.sendData(JSON.stringify({order: "data"}));
    }
});

function showShop() { showScreen('shop-screen'); }
function showCart() { updateCart(); showScreen('cart-screen'); }
function showDelivery() { showScreen('delivery-screen'); }

window.onload = () => { tg.ready(); updateMainButton(); };
