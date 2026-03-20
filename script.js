let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для армрестлинга. Идеально для тренировки хвата." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Мощный эспандер для развития силы кисти. Регулируемая нагрузка." }
};

let discount = 1; // 1 = 100%, 0.85 = скидка 15%

window.addToCart = (id) => { products[id].qty = 1; updateUI(id); updateTotal(); };
window.changeQty = (id, delta) => { 
    products[id].qty += delta; 
    if (products[id].qty <= 0) { products[id].qty = 0; resetUI(id); }
    updateUI(id); updateTotal(); 
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

function applyPromo() {
    const val = document.getElementById('promo-input').value.toLowerCase();
    if (val === 'jarvis') {
        discount = 0.85;
        alert("Промокод применен! Скидка 15%");
        showCart(); // Перерисовать корзину
    }
}

function updateTotal() {
    let total = 0;
    for (let id in products) total += products[id].price * products[id].qty;
    const btn = document.getElementById('footer-btn');
    if (total > 0) {
        btn.style.display = 'block';
        if (isActive('shop-screen')) btn.innerText = `КОРЗИНА ($${total})`;
        else if (isActive('cart-screen')) btn.innerText = `К ОФОРМЛЕНИЮ`;
        else if (isActive('delivery-screen')) btn.innerText = `ПРОВЕРИТЬ ДАННЫЕ`;
        else btn.innerText = `ПОДТВЕРДИТЬ И ОПЛАТИТЬ`;
    } else btn.style.display = 'none';
}

window.handleFooterClick = () => {
    if (isActive('shop-screen')) showCart();
    else if (isActive('cart-screen')) showDelivery();
    else if (isActive('delivery-screen')) showCheckout();
    else sendOrder();
};

function showCart() {
    switchScreen('cart-screen');
    const list = document.getElementById('cart-items-list');
    list.innerHTML = '';
    let subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            subtotal += sum;
            list.innerHTML += `<div style="display:flex; justify-content:space-between; margin-bottom:10px;"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    document.getElementById('total-sum').innerText = `Сумма: $${subtotal}`;
    document.getElementById('total-final').innerText = `Итог: $${(subtotal * discount).toFixed(2)}`;
    updateTotal();
}

function showCheckout() {
    switchScreen('checkout-screen');
    let orderHtml = '';
    let total = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            total += products[id].qty * products[id].price;
            orderHtml += `<div>${products[id].name} — ${products[id].qty} шт.</div>`;
        }
    }
    document.getElementById('check-order').innerHTML = orderHtml;
    document.getElementById('check-delivery').innerHTML = `ФИО: ${v('fio')}<br>Тел: ${v('phone')}<br>Страна: ${v('country')}<br>Город: ${v('city')}<br>Пункт СДЭК: ${v('address')}<br>Email: ${v('email')}`;
    document.getElementById('final-pay-amount').innerText = `$${(total * discount).toFixed(2)}`;
    updateTotal();
}

// Модальное окно (Картинка 5)
window.showInfo = (id) => {
    const p = products[id];
    document.getElementById('modal-body').innerHTML = `<h2>${p.name}</h2><p>${p.desc}</p><p><b>Стоимость: $${p.price}</b></p>`;
    document.getElementById('info-modal').style.display = 'flex';
};
window.closeModal = () => { document.getElementById('info-modal').style.display = 'none'; };

function sendOrder() {
    let orderText = `🔥 НОВЫЙ ЗАКАЗ 🔥\n\n👤 Клиент: ${v('fio')}\n📞 Тел: ${v('phone')}\n📧 Email: ${v('email')}\n\n📦 Доставка:\n${v('country')}, ${v('city')}\n🏢 ПВЗ СДЭК: ${v('address')}\n\n🛒 Товары:`;
    for (let id in products) { if(products[id].qty > 0) orderText += `\n- ${products[id].name}: ${products[id].qty} шт.`; }
    if(discount < 1) orderText += `\n\n🎫 Промо: JARVIS`;
    orderText += `\n✅ ИТОГО: $${document.getElementById('final-pay-amount').innerText}`;
    
    tg.sendData(orderText); // Это отправит данные боту, а бот перешлет в группу
}

// Хелперы
const isActive = (id) => document.getElementById(id).classList.contains('active');
const v = (id) => document.getElementById(id).value;
function switchScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    window.scrollTo(0,0);
}
window.showShop = () => { switchScreen('shop-screen'); updateTotal(); };
window.showDelivery = () => { switchScreen('delivery-screen'); updateTotal(); };
