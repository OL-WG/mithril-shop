let tg = window.Telegram.WebApp;
tg.expand();

let cart = [];
let step = 1;
let discount = 0;

// Управление кнопками
function addToCart(name, price) {
    cart.push({name, price});
    updateMainButton();
}

function updateMainButton() {
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    if (total > 0 && step === 1) {
        tg.MainButton.setText(`КОРЗИНА ($${total})`);
        tg.MainButton.show();
    }
}

// Вкладка Инфо
function openInfo(title, price, img) {
    document.getElementById('info-title').innerText = title;
    document.getElementById('info-img').src = img;
    document.getElementById('info-panel').classList.add('show');
    document.getElementById('app-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-panel').classList.remove('show');
    document.getElementById('app-container').classList.remove('blur');
}

// Скидки
function applyPromo() {
    const code = document.getElementById('promo-input').value.toUpperCase();
    if (code === "JARVIS") {
        discount = 0.1; // 10%
        tg.showAlert("Промокод JARVIS: Скидка 10%!");
    } else {
        discount = 0;
        tg.showAlert("Код не найден");
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items');
    let subtotal = cart.reduce((s, i) => s + i.price, 0);
    list.innerHTML = cart.map(i => `<div style="display:flex; justify-content:space-between; padding:8px 0; border-bottom:1px solid #222;"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
    let final = subtotal * (1 - discount);
    document.getElementById('total-val').innerText = `$${final.toFixed(2)}`;
}

// ЛОГИКА ПЕРЕХОДОВ (Main Button)
tg.MainButton.onClick(() => {
    if (step === 1) {
        document.getElementById('screen-main').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        renderCart();
        tg.MainButton.setText("К ОФОРМЛЕНИЮ");
        tg.BackButton.show();
        step = 2;
    } 
    else if (step === 2) {
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-address').classList.add('active');
        tg.MainButton.setText("ОТПРАВИТЬ ЗАКАЗ");
        step = 3;
    } 
    else if (step === 3) {
        const orderData = {
            cart: cart,
            total: document.getElementById('total-val').innerText,
            user: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek').value,
                email: document.getElementById('email').value
            }
        };

        if (!orderData.user.fio || !orderData.user.phone) {
            tg.showAlert("Пожалуйста, заполните ФИО и Телефон");
            return;
        }

        tg.sendData(JSON.stringify(orderData));
    }
});

tg.BackButton.onClick(() => {
    if (step === 2) {
        document.getElementById('screen-cart').classList.remove('active');
        document.getElementById('screen-main').classList.add('active');
        tg.BackButton.hide();
        updateMainButton();
        step = 1;
    } else if (step === 3) {
        document.getElementById('screen-address').classList.remove('active');
        document.getElementById('screen-cart').classList.add('active');
        tg.MainButton.setText("К ОФОРМЛЕНИЮ");
        step = 2;
    }
});
