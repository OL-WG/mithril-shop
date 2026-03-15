let tg = window.Telegram.WebApp;
tg.expand();

let cart = [];
let step = 1;
let discount = 0;

// Функции магазина
function addToCart(name, price) {
    cart.push({name, price});
    updateMainButton();
}

function updateMainButton() {
    let sum = cart.reduce((acc, item) => acc + item.price, 0);
    if (sum > 0 && step === 1) {
        tg.MainButton.setText(`ПРОСМОТРЕТЬ КОРЗИНУ ($${sum})`);
        tg.MainButton.show();
    }
}

// Система скидок
function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    const status = document.getElementById('promo-status');
    if (code === "JARVIS") {
        discount = 0.1; // 10%
        status.innerText = "Промокод применен: -10%";
        status.style.color = "#4CAF50";
    } else {
        discount = 0;
        status.innerText = "Неверный код";
        status.style.color = "#f44336";
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-list');
    let subtotal = cart.reduce((acc, item) => acc + item.price, 0);
    list.innerHTML = cart.map(i => `<div class="cart-row"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
    
    let finalTotal = subtotal * (1 - discount);
    document.getElementById('total-display').innerText = `Итого: $${finalTotal.toFixed(2)}`;
    return finalTotal;
}

// ЛОГИКА ГЛАВНОЙ КНОПКИ (Исправлено)
tg.MainButton.onClick(() => {
    if (step === 1) {
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        tg.BackButton.show();
        step = 2;
    } 
    else if (step === 2) {
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
        step = 3;
    } 
    else if (step === 3) {
        // Сбор данных
        const userData = {
            fio: document.getElementById('fio').value,
            phone: document.getElementById('phone').value,
            country: document.getElementById('country').value,
            city: document.getElementById('city').value,
            cdek: document.getElementById('cdek').value,
            email: document.getElementById('email').value,
            total: document.getElementById('total-display').innerText
        };

        if (!userData.fio || !userData.phone || !userData.email) {
            tg.showAlert("Сэр, заполните контактные данные!");
            return;
        }

        // Финальная отправка в бот
        tg.sendData(JSON.stringify({order: cart, customer: userData}));
    }
});

tg.BackButton.onClick(() => {
    if (step === 3) {
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        step = 2;
    } else if (step === 2) {
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
        step = 1;
    }
});
