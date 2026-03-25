let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для армрестлинга." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер с регулируемой нагрузкой." }
};

let isJarvis = false;

// Инициализация кнопки один раз
const footerBtn = document.getElementById('footer-btn');

footerBtn.onclick = function(e) {
    e.preventDefault(); // Защита от двойного срабатывания
    if (isActive('shop-screen')) showCart();
    else if (isActive('cart-screen')) showDelivery();
    else if (isActive('delivery-screen')) showCheckout();
    else sendOrder();
};

window.addToCart = (id) => { 
    products[id].qty = 1; 
    updateUI(id); 
    updateTotal(); 
};

window.changeQty = (id, delta) => { 
    products[id].qty += delta; 
    if (products[id].qty <= 0) { 
        products[id].qty = 0; 
        resetUI(id); 
    }
    updateUI(id); 
    updateTotal(); 
};

function updateUI(id) {
    const card = document.getElementById(id);
    card.querySelector('.add-trigger').style.display = 'none';
    card.querySelector('.counter').style.display = 'flex';
    card.querySelector('.qty').innerText = products[id].qty;
}

function resetUI(id) {
    const card = document.getElementById(id);
    card.querySelector('.add-trigger').style.display = 'block';
    card.querySelector('.counter').style.display = 'none';
}

window.applyPromo = () => {
    const val = document.getElementById('promo-input').value.toLowerCase();
    if (val === 'jarvis') {
        isJarvis = true;
        tg.showAlert("Промокод JARVIS применен!");
        showCart(); 
    }
};

function updateTotal() {
    let subtotal = 0;
    for (let id in products) subtotal += products[id].price * products[id].qty;
    
    if (subtotal > 0) {
        footerBtn.style.display = 'block';
        if (isActive('shop-screen')) footerBtn.innerText = `В КОРЗИНУ ($${subtotal.toFixed(2)})`;
        else if (isActive('cart-screen')) footerBtn.innerText = `К ОФОРМЛЕНИЮ`;
        else if (isActive('delivery-screen')) footerBtn.innerText = `ПРОВЕРИТЬ ДАННЫЕ`;
        else footerBtn.innerText = `ПОДТВЕРДИТЬ И ОПЛАТИТЬ`;
    } else {
        footerBtn.style.display = 'none';
    }
}

function showCart() {
    switchScreen('cart-screen');
    const list = document.getElementById('cart-items-list');
    const summary = document.getElementById('cart-summary');
    list.innerHTML = '';
    let subtotal = 0;
    
    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            subtotal += sum;
            list.innerHTML += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    
    if (isJarvis) {
        let disc = subtotal * 0.15;
        summary.innerHTML = `
            <span class="price-old">Исходная сумма: $${subtotal.toFixed(2)}</span>
            <span class="price-discount">Скидка (15%): -$${disc.toFixed(2)}</span>
            <span class="price-final">Итог к оплате: $${(subtotal - disc).toFixed(2)}</span>
        `;
    } else {
        summary.innerHTML = `<span class="price-final">Сумма: $${subtotal.toFixed(2)}</span>`;
    }
    updateTotal();
}

function showCheckout() {
    switchScreen('checkout-screen');
    let orderHtml = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            subtotal += products[id].qty * products[id].price;
            orderHtml += `<div>${products[id].name} — ${products[id].qty} шт.</div>`;
        }
    }
    const final = isJarvis ? subtotal * 0.85 : subtotal;
    document.getElementById('check-order').innerHTML = orderHtml;
    document.getElementById('check-delivery').innerHTML = `<b>Клиент:</b> ${v('fio')}<br><b>Тел:</b> ${v('phone')}<br><b>СДЭК:</b> ${v('city')}, ${v('address')}`;
    document.getElementById('final-pay-amount').innerText = `$${final.toFixed(2)}`;
    updateTotal();
}

window.showInfo = (id) => {
    document.getElementById('modal-body').innerHTML = `
        <h2 style="font-size:20px;">${products[id].name.toUpperCase()}</h2>
        <p style="color:#888; margin:20px 0;">${products[id].desc}</p>
        <div style="font-size:18px; font-weight:bold;">ЦЕНА: ${products[id].price} $</div>
    `;
    document.getElementById('info-modal').style.display = 'flex';
};

window.closeModal = () => { document.getElementById('info-modal').style.display = 'none'; };

function sendOrder() {
    let subtotal = 0;
    let items = "";
    for (let id in products) { 
        if(products[id].qty > 0) {
            subtotal += products[id].qty * products[id].price;
            items += `\n- ${products[id].name}: ${products[id].qty} шт.`;
        }
    }
    const final = isJarvis ? subtotal * 0.85 : subtotal;
    let msg = `🔥 НОВЫЙ ЗАКАЗ 🔥\n👤 ${v('fio')}\n📞 ${v('phone')}\n📦 ${v('city')}, ${v('address')}\n🛒 Товары:${items}\n✅ ИТОГО: $${final.toFixed(2)}`;
    tg.sendData(msg);
}

function isActive(id) { return document.getElementById(id).classList.contains('active'); }
function v(id) { return document.getElementById(id).value || "—"; }

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}

window.showShop = () => { switchScreen('shop-screen'); updateTotal(); };
window.showDelivery = () => { switchScreen('delivery-screen'); updateTotal(); };
window.showCart = () => { showCart(); };
