let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setParams({ color: '#000000', text_color: '#ffffff' });

// ===== КОНФИГУРАЦИЯ СТРАН =====
const COUNTRIES = [
    { code: '+7',   flag: '🇷🇺', name: 'Россия',         maxLen: 10 },
    { code: '+7',   flag: '🇰🇿', name: 'Казахстан',      maxLen: 10 },
    { code: '+375', flag: '🇧🇾', name: 'Беларусь',       maxLen: 9  },
    { code: '+380', flag: '🇺🇦', name: 'Украина',        maxLen: 9  },
    { code: '+998', flag: '🇺🇿', name: 'Узбекистан',     maxLen: 9  },
    { code: '+992', flag: '🇹🇯', name: 'Таджикистан',    maxLen: 9  },
    { code: '+996', flag: '🇰🇬', name: 'Кыргызстан',     maxLen: 9  },
    { code: '+993', flag: '🇹🇲', name: 'Туркменистан',   maxLen: 8  },
    { code: '+994', flag: '🇦🇿', name: 'Азербайджан',    maxLen: 9  },
    { code: '+374', flag: '🇦🇲', name: 'Армения',        maxLen: 8  },
    { code: '+995', flag: '🇬🇪', name: 'Грузия',         maxLen: 9  },
    { code: '+1',   flag: '🇺🇸', name: 'США',            maxLen: 10 },
    { code: '+1',   flag: '🇨🇦', name: 'Канада',         maxLen: 10 },
    { code: '+44',  flag: '🇬🇧', name: 'Великобритания', maxLen: 10 },
    { code: '+49',  flag: '🇩🇪', name: 'Германия',       maxLen: 11 },
    { code: '+33',  flag: '🇫🇷', name: 'Франция',        maxLen: 9  },
    { code: '+39',  flag: '🇮🇹', name: 'Италия',         maxLen: 10 },
    { code: '+34',  flag: '🇪🇸', name: 'Испания',        maxLen: 9  },
    { code: '+90',  flag: '🇹🇷', name: 'Турция',         maxLen: 10 },
    { code: '+971', flag: '🇦🇪', name: 'ОАЭ',            maxLen: 9  },
    { code: '+86',  flag: '🇨🇳', name: 'Китай',          maxLen: 11 },
    { code: '+81',  flag: '🇯🇵', name: 'Япония',         maxLen: 10 },
    { code: '+82',  flag: '🇰🇷', name: 'Корея',          maxLen: 10 },
    { code: '+91',  flag: '🇮🇳', name: 'Индия',           maxLen: 10 },
];

let selectedCountry = COUNTRIES[0]; 
let products = {
    item1: { name: "РУЧКА ARM", price: 35, qty: 0, img: 'ruchka.webp', desc: "Профессиональный инструмент." },
    item2: { name: "ЭСПАНДЕР", price: 12, qty: 0, img: 'expander.webp', desc: "Для развития силы хвата." }
};
let isJarvis = false;

// ===== ФУНКЦИИ ИНТЕРФЕЙСА =====
function initPhoneUI() {
    updateFlagUI();
    document.addEventListener('click', (e) => {
        if (!e.target.closest('.phone-wrapper') && !e.target.closest('.country-dropdown')) {
            closeCountryDropdown();
        }
    });
}

function updateFlagUI() {
    document.getElementById('phone-flag').innerText = selectedCountry.flag;
    document.getElementById('phone-code').innerText = selectedCountry.code;
}

function selectCountry(index) {
    selectedCountry = COUNTRIES[index];
    updateFlagUI();
    closeCountryDropdown();
    document.getElementById('phone').value = '';
}

function handlePhoneInput(input) {
    let digits = input.value.replace(/\D/g, '').substring(0, selectedCountry.maxLen);
    input.value = digits;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'cart-screen') updateCart();
    if (id === 'checkout-screen') updateCheckout();
    updateMainButton();
}

function addToCart(id) { products[id].qty = 1; updateProductUI(id); }
function changeQty(id, delta) { products[id].qty = Math.max(0, products[id].qty + delta); updateProductUI(id); }

function updateProductUI(id) {
    const card = document.getElementById(id);
    const qty = products[id].qty;
    const addBtn = card.querySelector('.add-trigger');
    const qtyCtrl = card.querySelector('.quantity-control');
    if (qty > 0) { addBtn.style.display = 'none'; qtyCtrl.classList.add('show'); card.querySelector('.qty').innerText = qty; }
    else { addBtn.style.display = 'block'; qtyCtrl.classList.remove('show'); }
    updateMainButton();
}

function updateCart() {
    let html = '', subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum;
            html += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    document.getElementById('cart-items-list').innerHTML = html || '<p>Корзина пуста</p>';
    document.getElementById('cart-summary').innerHTML = `<h3>Итого: $${subtotal - discount}</h3>`;
}

function applyPromo() {
    isJarvis = (document.getElementById('promo-input').value.trim().toUpperCase() === 'JARVIS');
    updateCart();
}

function updateCheckout() {
    let subtotal = 0, itemsHtml = '';
    for (let id in products) {
        if (products[id].qty > 0) {
            subtotal += products[id].price * products[id].qty;
            itemsHtml += `<p>${products[id].name} x${products[id].qty}</p>`;
        }
    }
    const total = subtotal - (isJarvis ? Math.round(subtotal * 0.15) : 0);
    document.getElementById('check-order').innerHTML = itemsHtml;
    document.getElementById('final-pay-amount').innerText = `К оплате: $${total}`;
}

function validateDelivery() {
    const fields = ['fio', 'city', 'address'];
    let valid = true;
    fields.forEach(id => {
        const el = document.getElementById(id);
        if (!el.value.trim()) { el.classList.add('error'); valid = false; }
        else el.classList.remove('error');
    });
    return valid;
}

function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) tg.MainButton.setText(`🛒 КОРЗИНА (${count})`).show();
        else tg.MainButton.hide();
    } 
    else if (active === 'cart-screen') tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ').show();
    else if (active === 'delivery-screen') tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ').show();
    else if (active === 'checkout-screen') tg.MainButton.setText('📤 ОТПРАВИТЬ ЗАКАЗ').show();
}

// ===== ОБРАБОТЧИК НАЖАТИЯ КНОПКИ (ИСПРАВЛЕН) =====
tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showScreen('cart-screen');
    else if (active === 'cart-screen') showScreen('delivery-screen');
    else if (active === 'delivery-screen') { if (validateDelivery()) showScreen('checkout-screen'); }
    else if (active === 'checkout-screen') {
        let subtotal = 0;
        let itemsList = [];
        for (let id in products) {
            if (products[id].qty > 0) {
                subtotal += products[id].price * products[id].qty;
                itemsList.push(`${products[id].name} x${products[id].qty}`);
            }
        }
        const total = subtotal - (isJarvis ? Math.round(subtotal * 0.15) : 0);

        const orderData = {
            fio: document.getElementById('fio').value,
            phone: selectedCountry.code + ' ' + document.getElementById('phone').value,
            address: `${document.getElementById('city').value}, ${document.getElementById('address').value}`,
            items: itemsList,
            total: total,
            promo: isJarvis ? "JARVIS" : "Нет"
        };
        tg.sendData(JSON.stringify(orderData));
    }
});

window.onload = () => { tg.ready(); initPhoneUI(); updateMainButton(); };
