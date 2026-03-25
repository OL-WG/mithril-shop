let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для армрестлинга." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер с регулируемой нагрузкой." }
};

let isJarvis = false;

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

// Работа с промокодом и отображение цен
window.applyPromo = () => {
    const input = document.getElementById('promo-input').value;
    if (input.toLowerCase() === 'jarvis') {
        isJarvis = true;
        tg.showAlert("Промокод JARVIS применен!");
        showCart(); 
    } else {
        tg.showAlert("Неверный промокод");
    }
};

function updateTotal() {
    let subtotal = 0;
    for (let id in products) subtotal += products[id].price * products[id].qty;
    
    const btn = document.getElementById('footer-btn');
    if (subtotal > 0) {
        btn.style.display = 'block';
        // Назначаем обработчик клика программно для надежности
        btn.onclick = handleFooterClick; 

        if (isActive('shop-screen')) {
            btn.innerText = `В КОРЗИНУ ($${subtotal.toFixed(2)})`;
        } else if (isActive('cart-screen')) {
            btn.innerText = `К ОФОРМЛЕНИЮ`;
        } else if (isActive('delivery-screen')) {
            btn.innerText = `ПРОВЕРИТЬ ДАННЫЕ`;
        } else {
            btn.innerText = `ПОДТВЕРДИТЬ И ОПЛАТИТЬ`;
        }
    } else {
        btn.style.display = 'none';
    }
}

function handleFooterClick() {
    if (isActive('shop-screen')) showCart();
    else if (isActive('cart-screen')) showDelivery();
    else if (isActive('delivery-screen')) showCheckout();
    else sendOrder();
}

function showCart() {
    switchScreen('cart-screen');
    const list = document.getElementById('cart-items-list');
    list.innerHTML = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            subtotal += sum;
            list.innerHTML += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    
    const sumEl = document.getElementById('total-sum');
    const finalEl = document.getElementById('total-final');

    if (isJarvis) {
        const discounted = subtotal * 0.85;
        sumEl.innerHTML = `<span class="old-price">Сумма: $${subtotal}</span>`;
        finalEl.style.display = 'block';
        finalEl.innerHTML = `<span class="new-price">Итог: $${discounted.toFixed(2)}</span>`;
    } else {
        sumEl.innerText = `Сумма: $${subtotal}`;
        finalEl.style.display = 'none';
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
    document.getElementById('check-delivery').innerHTML = `<b>ФИО:</b> ${v('fio')}<br><b>Тел:</b> ${v('phone')}<br><b>Город:</b> ${v('city')}<br><b>СДЭК:</b> ${v('address')}`;
    document.getElementById('final-pay-amount').innerText = `$${final.toFixed(2)}`;
    updateTotal();
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
    let message = `🔥 НОВЫЙ ЗАКАЗ 🔥\n\n👤 Клиент: ${v('fio')}\n📞 Тел: ${v('phone')}\n\n📦 СДЭК: ${v('city')}, ${v('address')}\n🛒 Товары:${itemsText}\n\n✅ ИТОГО: $${final.toFixed(2)}`;
    tg.sendData(message);
}

const isActive = (id) => document.getElementById(id).classList.contains('active');
const v = (id) => document.getElementById(id).value || "—";

function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}

window.showShop = () => { switchScreen('shop-screen'); updateTotal(); };
window.showDelivery = () => { switchScreen('delivery-screen'); updateTotal(); };
window.showCart = () => { showCart(); };
