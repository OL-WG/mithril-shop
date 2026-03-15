let tg = window.Telegram.WebApp;
tg.expand();

let cart = [];
let currentStep = 1; // 1: Витрина, 2: Корзина, 3: Адрес
let discount = 0;

// 1. Управление товарами
function addToCart(name, price) {
    cart.push({name, price});
    updateMainButton();
}

function updateMainButton() {
    let sum = cart.reduce((acc, i) => acc + i.price, 0);
    if (sum > 0 && currentStep === 1) {
        tg.MainButton.setText(`КОРЗИНА ($${sum})`);
        tg.MainButton.show();
    }
}

// 2. Окно ИНФО
function openInfo(title, price, img) {
    document.getElementById('info-title').innerText = title;
    document.getElementById('info-price').innerText = price;
    document.getElementById('info-img').src = img;
    document.getElementById('info-sheet').classList.add('active');
    document.getElementById('content-wrapper').classList.add('blur-bg');
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('active');
    document.getElementById('content-wrapper').classList.remove('blur-bg');
}

// 3. Скидки
function applyPromo() {
    let code = document.getElementById('promo-input').value.toUpperCase();
    if (code === "JARVIS") {
        discount = 0.1;
        tg.showAlert("Скидка 10% применена!");
    } else {
        discount = 0;
        tg.showAlert("Код не найден");
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-list');
    let subtotal = cart.reduce((acc, i) => acc + i.price, 0);
    list.innerHTML = cart.map(i => `<div class="cart-row"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
    let total = subtotal * (1 - discount);
    document.getElementById('total-price').innerText = `Итого: $${total.toFixed(2)}`;
    return total;
}

// 4. ГЛАВНАЯ КНОПКА (ОБРАБОТКА ШАГОВ)
tg.MainButton.onClick(() => {
    if (currentStep === 1) {
        // Переход в корзину
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setText("ОФОРМИТЬ ДОСТАВКУ");
        tg.BackButton.show();
        currentStep = 2;
    } 
    else if (currentStep === 2) {
        // Переход к адресу
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("ОТПРАВИТЬ ЗАКАЗ");
        currentStep = 3;
    } 
    else if (currentStep === 3) {
        // Финальная сборка данных
        let orderData = {
            products: cart,
            total: document.getElementById('total-price').innerText,
            customer: {
                fio: document.getElementById('u_fio').value,
                phone: document.getElementById('u_phone').value,
                city: document.getElementById('u_city').value,
                cdek: document.getElementById('u_cdek').value,
                email: document.getElementById('u_email').value
            }
        };

        if (!orderData.customer.fio || !orderData.customer.phone) {
            tg.showAlert("Сэр, заполните хотя бы ФИО и Телефон!");
            return;
        }

        tg.sendData(JSON.stringify(orderData));
    }
});

// Кнопка Назад
tg.BackButton.onClick(() => {
    if (currentStep === 2) {
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('main-screen').style.display = 'block';
        tg.BackButton.hide();
        updateMainButton();
        currentStep = 1;
    } else if (currentStep === 3) {
        document.getElementById('address-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        tg.MainButton.setText("ОФОРМИТЬ ДОСТАВКУ");
        currentStep = 2;
    }
});
