let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер." }
};

let isJarvis = false;

// ГЛАВНАЯ ФУНКЦИЯ КЛИКА
window.handleFooterClick = function() {
    if (isActive('shop-screen')) {
        showCart();
    } else if (isActive('cart-screen')) {
        showDelivery();
    } else if (isActive('delivery-screen')) {
        showCheckout();
    } else {
        sendOrder();
    }
};

window.addToCart = (id) => { 
    products[id].qty = 1; 
    document.getElementById(id).querySelector('.add-trigger').style.display = 'none';
    document.getElementById(id).querySelector('.counter').style.display = 'flex';
    updateTotal(); 
};

window.changeQty = (id, delta) => { 
    products[id].qty += delta; 
    if (products[id].qty <= 0) { 
        products[id].qty = 0; 
        document.getElementById(id).querySelector('.add-trigger').style.display = 'block';
        document.getElementById(id).querySelector('.counter').style.display = 'none';
    } else {
        document.getElementById(id).querySelector('.qty').innerText = products[id].qty;
    }
    updateTotal(); 
};

window.applyPromo = () => {
    const val = document.getElementById('promo-input').value.toLowerCase();
    if (val === 'jarvis') {
        isJarvis = true;
        tg.showAlert("Промокод JARVIS применен!");
        showCart(); 
    }
};

function updateTotal() {
    const footerBtn = document.getElementById('footer-btn');
    let subtotal = 0;
    for (let id in products) subtotal += products[id].price * products[id].qty;
    
    if (subtotal > 0) {
        footerBtn.style.display = 'block';
        if (isActive('shop-screen')) {
            footerBtn.innerText = `В КОРЗИНУ ($${subtotal.toFixed(2)})`;
        } else if (isActive('cart-screen')) {
            footerBtn.innerText = `К ОФОРМЛЕНИЮ`;
        } else if (isActive('delivery-screen')) {
            footerBtn.innerText = `ПРОВЕРИТЬ ДАННЫЕ`;
        } else {
            const final = isJarvis ? subtotal * 0.85 : subtotal;
            footerBtn.innerText = `ОПЛАТИТЬ $${final.toFixed(2)}`;
        }
    } else {
        footerBtn.style.display = 'none';
    }
}

function showCart() {
    switchScreen('cart-screen');
    const list = document.getElementById('cart-items-list');
    const summary = document.getElementById('cart-summary');
    list.innerHTML = '';
    let sub = 0;
    
    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            sub += sum;
            list.innerHTML += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum.toFixed(2)}</span></div>`;
        }
    }
    
    if (isJarvis) {
        let disc = sub * 0.15;
        summary.innerHTML = `
            <div class="summary-line old-price"><span>Сумма:</span><span>$${sub.toFixed(2)}</span></div>
            <div class="summary-line"><span>Скидка (15%):</span><span>-$${disc.toFixed(2)}</span></div>
            <div class="summary-line price-final"><span>Итог к оплате:</span><span>$${(sub-disc).toFixed(2)}</span></div>
        `;
    } else {
        summary.innerHTML = `<div class="summary-line price-final"><span>Сумма:</span><span>$${sub.toFixed(2)}</span></div>`;
    }
    updateTotal();
}

function showCheckout() {
    switchScreen('checkout-screen');
    let sub = 0;
    let items = "";
    for (let id in products) {
        if (products[id].qty > 0) {
            sub += products[id].qty * products[id].price;
            items += `<div>${products[id].name} — ${products[id].qty} шт.</div>`;
        }
    }
    const final = isJarvis ? sub * 0.85 : sub;
    document.getElementById('check-order').innerHTML = items;
    document.getElementById('check-delivery').innerHTML = `<b>${v('fio')}</b><br>${v('phone')}<br>${v('city')}, ${v('address')}`;
    document.getElementById('final-pay-amount').innerText = `$${final.toFixed(2)}`;
    updateTotal();
}

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
    updateTotal();
}

function isActive(id) { return document.getElementById(id).classList.contains('active'); }
function v(id) { return document.getElementById(id).value || "—"; }

window.showShop = () => switchScreen('shop-screen');
window.showDelivery = () => switchScreen('delivery-screen');
window.showCart = () => showCart();
window.closeModal = () => document.getElementById('info-modal').style.display = 'none';
window.showInfo = (id) => {
    document.getElementById('modal-body').innerHTML = `<h2>${products[id].name}</h2><p>${products[id].desc}</p>`;
    document.getElementById('info-modal').style.display = 'flex';
};

function sendOrder() {
    tg.sendData("Заказ оформлен");
}
