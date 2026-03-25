let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для армрестлинга." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер с регулируемой нагрузкой." }
};

let isJarvis = false;

// Слушаем клик на главную кнопку
const footerBtn = document.getElementById('footer-btn');
footerBtn.addEventListener('click', () => {
    if (isActive('shop-screen')) showCart();
    else if (isActive('cart-screen')) showDelivery();
    else if (isActive('delivery-screen')) showCheckout();
    else sendOrder();
});

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

// Применение промокода и перерисовка цен
window.applyPromo = () => {
    const input = document.getElementById('promo-input').value;
    if (input.toLowerCase() === 'jarvis') {
        isJarvis = true;
        // Оставляем стандартное уведомление Telegram
        tg.showAlert("Промокод JARVIS применен!");
        showCart(); // Перерисовываем корзину с новой детализацией
    } else {
        tg.showAlert("Неверный промокод");
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
    
    // ЛОГИКА ОТОБРАЖЕНИЯ ЦЕН (справа)
    if (isJarvis) {
        const discountVal = subtotal * 0.15;
        const finalAmount = subtotal - discountVal;
        
        // Новая детализация: Исходная -> Снято -> Итог
        summary.innerHTML = `
            <span class="price-line price-old">Исходная сумма: $${subtotal.toFixed(2)}</span>
            <span class="price-line price-discount">Скидка (15%): -$${discountVal.toFixed(2)}</span>
            <span class="price-final">Итог к оплате: $${finalAmount.toFixed(2)}</span>
        `;
    } else {
        // Обычное отображение без скидки
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
}

window.showInfo = (id) => {
    document.getElementById('modal-body').innerHTML = `
        <h1 style="font-size:28px; margin-bottom:15px;">ИНФОРМАЦИЯ</h1>
        <h2 style="font-size:20px;">${products[id].name.toUpperCase()}</h2>
        <p style="color:#888; line-height:1.5; font-size:15px; margin:20px 0;">${products[id].desc}</p>
        <div style="margin-top:20px; font-size:18px; font-weight:bold;">СТОИМОСТЬ: ${products[id].price} $</div>
    `;
    document.getElementById('info-modal').style.display = 'flex';
};

window.closeModal = () => { document.getElementById('info-modal').style.display = 'none'; };

function sendOrder() {
    let subtotal = 0;
    let itemsText = "";
    for (let id in products) { 
        if(products[id].qty > 0) {
            subtotal += products[id].qty * products[id].price;
            itemsText += `\n- ${products[id].name}: ${products[id].qty} шт.`;
        }
    }
    const final = isJarvis ? subtotal * 0.85 : subtotal;
    let message = `🔥 НОВЫЙ ЗАКАЗ 🔥\n\n👤 Клиент: ${v('fio')}\n📞 Тел: ${v('phone')}\n\n📦 СДЭК: ${v('city')}, ${v('address')}\n🛒 Товары:${itemsText}\n\n${isJarvis ? '🎫 Промо: JARVIS (-15%)\n' : ''}✅ ИТОГО: $${final.toFixed(2)}`;
    tg.sendData(message);
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
