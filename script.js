let tg = window.Telegram.WebApp;
tg.expand();

tg.MainButton.setParams({ color: '#000000', text_color: '#ffffff' });

// ===== СТРАНЫ =====
const COUNTRIES = [
    { code: '+7',   flag: '🇷🇺', name: 'Россия',        maxLen: 10 },
    { code: '+7',   flag: '🇰🇿', name: 'Казахстан',     maxLen: 10 },
    { code: '+375', flag: '🇧🇾', name: 'Беларусь',      maxLen: 9  },
    { code: '+380', flag: '🇺🇦', name: 'Украина',       maxLen: 9  },
    { code: '+998', flag: '🇺🇿', name: 'Узбекистан',    maxLen: 9  },
    { code: '+992', flag: '🇹🇯', name: 'Таджикистан',   maxLen: 9  },
    { code: '+996', flag: '🇰🇬', name: 'Кыргызстан',    maxLen: 9  },
    { code: '+993', flag: '🇹🇲', name: 'Туркменистан',  maxLen: 8  },
    { code: '+994', flag: '🇦🇿', name: 'Азербайджан',   maxLen: 9  },
    { code: '+374', flag: '🇦🇲', name: 'Армения',       maxLen: 8  },
    { code: '+995', flag: '🇬🇪', name: 'Грузия',        maxLen: 9  },
    { code: '+1',   flag: '🇺🇸', name: 'США',           maxLen: 10 },
    { code: '+1',   flag: '🇨🇦', name: 'Канада',        maxLen: 10 },
    { code: '+44',  flag: '🇬🇧', name: 'Великобритания',maxLen: 10 },
    { code: '+49',  flag: '🇩🇪', name: 'Германия',      maxLen: 11 },
    { code: '+33',  flag: '🇫🇷', name: 'Франция',       maxLen: 9  },
    { code: '+39',  flag: '🇮🇹', name: 'Италия',        maxLen: 10 },
    { code: '+34',  flag: '🇪🇸', name: 'Испания',       maxLen: 9  },
    { code: '+90',  flag: '🇹🇷', name: 'Турция',        maxLen: 10 },
    { code: '+971', flag: '🇦🇪', name: 'ОАЭ',           maxLen: 9  },
    { code: '+86',  flag: '🇨🇳', name: 'Китай',         maxLen: 11 },
    { code: '+81',  flag: '🇯🇵', name: 'Япония',        maxLen: 10 },
    { code: '+82',  flag: '🇰🇷', name: 'Корея',         maxLen: 10 },
    { code: '+91',  flag: '🇮🇳', name: 'Индия',         maxLen: 10 },
];

// Префиксы для автоопределения (+7 казахские номера начинаются с 70х, 71х, 72х, 76х, 77х)
const KZ_PREFIXES = ['700','701','702','705','706','707','708','709','710','711','712','713','714','715','716','717','718','719','720','721','722','723','724','725','726','727','728','729','760','761','762','763','764','765','766','767','768','769','770','771','772','773','774','775','776','777','778','779'];

let selectedCountry = COUNTRIES[0]; // Россия по умолчанию

function initPhoneUI() {
    renderCountryList(COUNTRIES);
    updateFlagUI();

    // Закрыть дропдаун при клике вне
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

function renderCountryList(list) {
    const container = document.getElementById('country-list');
    container.innerHTML = list.map((c, i) => `
        <div class="country-item" onclick="selectCountry(${COUNTRIES.indexOf(c)})">
            <span class="ci-flag">${c.flag}</span>
            <span class="ci-name">${c.name}</span>
            <span class="ci-code">${c.code}</span>
        </div>
    `).join('');
}

function filterCountries(q) {
    const filtered = COUNTRIES.filter(c =>
        c.name.toLowerCase().includes(q.toLowerCase()) || c.code.includes(q)
    );
    renderCountryList(filtered);
}

function toggleCountryDropdown() {
    const dd = document.getElementById('country-dropdown');
    dd.classList.toggle('open');
    if (dd.classList.contains('open')) {
        document.getElementById('country-search').value = '';
        renderCountryList(COUNTRIES);
        setTimeout(() => document.getElementById('country-search').focus(), 100);

        // Позиционируем дропдаун под полем телефона
        const wrapper = document.querySelector('.phone-wrapper');
        const rect = wrapper.getBoundingClientRect();
        dd.style.top = (rect.bottom + window.scrollY + 6) + 'px';
    }
}

function closeCountryDropdown() {
    document.getElementById('country-dropdown').classList.remove('open');
}

function selectCountry(index) {
    selectedCountry = COUNTRIES[index];
    updateFlagUI();
    closeCountryDropdown();
    // Сбросить поле
    document.getElementById('phone').value = '';
    document.getElementById('phone').focus();
}

// Автоопределение страны по введённым цифрам
function detectCountryByNumber(digits) {
    if (!digits) return;

    // +7: Казахстан или Россия
    if (digits.startsWith('7') || digits.startsWith('8')) {
        const prefix3 = digits.substring(0, 3);
        if (KZ_PREFIXES.includes(prefix3)) {
            selectedCountry = COUNTRIES.find(c => c.name === 'Казахстан');
        } else if (digits.length >= 1) {
            selectedCountry = COUNTRIES.find(c => c.name === 'Россия');
        }
        updateFlagUI(); return;
    }
    if (digits.startsWith('375')) { selectedCountry = COUNTRIES.find(c => c.name === 'Беларусь'); updateFlagUI(); return; }
    if (digits.startsWith('380')) { selectedCountry = COUNTRIES.find(c => c.name === 'Украина'); updateFlagUI(); return; }
    if (digits.startsWith('998')) { selectedCountry = COUNTRIES.find(c => c.name === 'Узбекистан'); updateFlagUI(); return; }
    if (digits.startsWith('992')) { selectedCountry = COUNTRIES.find(c => c.name === 'Таджикистан'); updateFlagUI(); return; }
    if (digits.startsWith('996')) { selectedCountry = COUNTRIES.find(c => c.name === 'Кыргызстан'); updateFlagUI(); return; }
    if (digits.startsWith('993')) { selectedCountry = COUNTRIES.find(c => c.name === 'Туркменистан'); updateFlagUI(); return; }
    if (digits.startsWith('994')) { selectedCountry = COUNTRIES.find(c => c.name === 'Азербайджан'); updateFlagUI(); return; }
    if (digits.startsWith('374')) { selectedCountry = COUNTRIES.find(c => c.name === 'Армения'); updateFlagUI(); return; }
    if (digits.startsWith('995')) { selectedCountry = COUNTRIES.find(c => c.name === 'Грузия'); updateFlagUI(); return; }
    if (digits.startsWith('971')) { selectedCountry = COUNTRIES.find(c => c.name === 'ОАЭ'); updateFlagUI(); return; }
    if (digits.startsWith('90'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Турция'); updateFlagUI(); return; }
    if (digits.startsWith('49'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Германия'); updateFlagUI(); return; }
    if (digits.startsWith('44'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Великобритания'); updateFlagUI(); return; }
    if (digits.startsWith('33'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Франция'); updateFlagUI(); return; }
    if (digits.startsWith('39'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Италия'); updateFlagUI(); return; }
    if (digits.startsWith('34'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Испания'); updateFlagUI(); return; }
    if (digits.startsWith('86'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Китай'); updateFlagUI(); return; }
    if (digits.startsWith('81'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Япония'); updateFlagUI(); return; }
    if (digits.startsWith('82'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Корея'); updateFlagUI(); return; }
    if (digits.startsWith('91'))  { selectedCountry = COUNTRIES.find(c => c.name === 'Индия'); updateFlagUI(); return; }
    if (digits.startsWith('1'))   { selectedCountry = COUNTRIES.find(c => c.name === 'США'); updateFlagUI(); return; }
}

function blockBadKeys(e) {
    // Блокируем: - ( ) пробел и буквы
    const blocked = ['-', '(', ')', ' ', '+'];
    if (blocked.includes(e.key)) { e.preventDefault(); return; }
    // Разрешаем: цифры, backspace, delete, стрелки
    if (!/^\d$/.test(e.key) && !['Backspace','Delete','ArrowLeft','ArrowRight','Tab'].includes(e.key)) {
        e.preventDefault();
    }
}

function handlePhoneInput(input) {
    // Убираем всё кроме цифр
    let digits = input.value.replace(/\D/g, '');

    // Убираем ведущий + если вставили
    if (digits.startsWith('00')) digits = digits.substring(2);

    // Автоопределение страны
    detectCountryByNumber(digits);

    // Ограничиваем длину
    digits = digits.substring(0, selectedCountry.maxLen);

    input.value = digits;
}

// ===== ПРОДУКТЫ =====
let products = {
    item1: { name: "РУЧКА ARM", price: 35, qty: 0, img: 'ruchka.webp', desc: "Профессиональный инструмент для развития силы пронации и подъема." },
    item2: { name: "ЭСПАНДЕР", price: 12, qty: 0, img: 'expander.webp', desc: "Кистевой эспандер для развития взрывной силы хвата." }
};

let isJarvis = false;

function showToast(msg, type = '') {
    const toast = document.getElementById('toast');
    toast.innerText = msg;
    toast.className = 'toast show ' + (type ? type + '-toast' : '');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => toast.classList.remove('show'), 3000);
}

function validateDelivery() {
    const textFields = ['fio', 'country', 'city', 'address', 'email'];
    let valid = true;

    textFields.forEach(id => {
        const input = document.getElementById(id);
        if (!input.value.trim()) { input.classList.add('error'); valid = false; }
        else input.classList.remove('error');
    });

    // Валидация телефона
    const phoneInput = document.getElementById('phone');
    const phoneDigits = phoneInput.value.replace(/\D/g, '');
    const phoneWrapper = document.querySelector('.phone-wrapper');

    if (phoneDigits.length < 7) {
        phoneWrapper.classList.add('error');
        valid = false;
    } else {
        phoneWrapper.classList.remove('error');
    }

    if (!valid) showToast('⚠️ Заполните все поля!', 'error');
    return valid;
}

function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
    if (id === 'cart-screen') updateCart();
    if (id === 'checkout-screen') updateCheckout();
    updateMainButton();
}

function updateProductUI(id) {
    const card = document.getElementById(id);
    const qty = products[id].qty;
    const addBtn = card.querySelector('.add-trigger');
    const qtyCtrl = card.querySelector('.quantity-control');
    const qtySpan = card.querySelector('.qty');
    if (qty > 0) { addBtn.style.display = 'none'; qtyCtrl.classList.add('show'); qtySpan.innerText = qty; }
    else { addBtn.style.display = 'block'; qtyCtrl.classList.remove('show'); }
    updateMainButton();
}

function addToCart(id) { products[id].qty = 1; updateProductUI(id); }
function changeQty(id, delta) { products[id].qty = Math.max(0, products[id].qty + delta); updateProductUI(id); }

function updateCart() {
    let html = '', subtotal = 0, hasItems = false;
    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum; hasItems = true;
            html += `<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum}</span></div>`;
        }
    }
    if (!hasItems) {
        document.getElementById('cart-items-list').innerHTML = '<p style="text-align:center;padding:20px;color:#888;">Корзина пуста</p>';
        document.getElementById('cart-summary').innerHTML = ''; return;
    }
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    document.getElementById('cart-items-list').innerHTML = html;
    document.getElementById('cart-summary').innerHTML = `
        <div style="padding:20px;border-top:1px solid #222;">
            <p>Сумма: $${subtotal}</p>
            ${isJarvis ? `<p style="color:#30d1a9">Скидка (JARVIS): -$${discount}</p>` : ''}
            <h3 style="font-size:24px;">Итого: $${total}</h3>
        </div>`;
}

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    isJarvis = (code === 'JARVIS');
    if (isJarvis) showToast('✅ Скидка 15% применена!', 'success');
    else showToast('❌ Промокод не найден', 'error');
    updateCart();
}

function updateCheckout() {
    let itemsHtml = '<h3>Ваш заказ:</h3>', subtotal = 0;
    for (let id in products) {
        if (products[id].qty > 0) {
            const sum = products[id].price * products[id].qty;
            subtotal += sum;
            itemsHtml += `<p>${products[id].name} x${products[id].qty} — $${sum}</p>`;
        }
    }
    const discount = isJarvis ? Math.round(subtotal * 0.15) : 0;
    const total = subtotal - discount;
    const fullPhone = selectedCountry.code + ' ' + document.getElementById('phone').value;
    document.getElementById('check-order').innerHTML = itemsHtml;
    document.getElementById('check-delivery').innerHTML = `
        <h3>Доставка:</h3>
        <p><b>Получатель:</b> ${document.getElementById('fio').value}</p>
        <p><b>Телефон:</b> ${fullPhone}</p>
        <p><b>Адрес:</b> ${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('address').value}</p>`;
    document.getElementById('final-pay-amount').innerHTML = `
        <div style="padding:20px;background:#111;border-radius:15px;margin-top:10px;">
            <h2 style="margin:0;">К оплате: $${total}</h2>
        </div>`;
}

function updateMainButton() {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') {
        let count = Object.values(products).reduce((a, b) => a + b.qty, 0);
        if (count > 0) tg.MainButton.setText(`🛒 КОРЗИНА (${count})`).show();
        else tg.MainButton.hide();
    } else if (active === 'cart-screen') tg.MainButton.setText('🚚 ОФОРМИТЬ ДОСТАВКУ').show();
    else if (active === 'delivery-screen') tg.MainButton.setText('✅ ПРОВЕРИТЬ ЗАКАЗ').show();
    else if (active === 'checkout-screen') tg.MainButton.setText('📤 ОТПРАВИТЬ ЗАКАЗ').show();
}

tg.MainButton.onClick(() => {
    const active = document.querySelector('.screen.active').id;
    if (active === 'shop-screen') showScreen('cart-screen');
    else if (active === 'cart-screen') showScreen('delivery-screen');
    else if (active === 'delivery-screen') { if (validateDelivery()) showScreen('checkout-screen'); }
    else if (active === 'checkout-screen') {
        const fullPhone = selectedCountry.flag + ' ' + selectedCountry.code + ' ' + document.getElementById('phone').value;
        const orderData = {
            fio: document.getElementById('fio').value,
            phone: fullPhone,
            address: `${document.getElementById('country').value}, ${document.getElementById('city').value}, ${document.getElementById('address').value}`,
            email: document.getElementById('email').value,
            items: Object.values(products).filter(p => p.qty > 0).map(p => `${p.name} x${p.qty}`),
            promo: isJarvis ? "JARVIS" : "Нет",
            total: document.getElementById('final-pay-amount').innerText
        };
        tg.sendData(JSON.stringify(orderData));
    }
});

function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.desc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('info-modal').style.display = 'none'; }
function showShop() { showScreen('shop-screen'); }
function showCart() { showScreen('cart-screen'); }
function showDelivery() { showScreen('delivery-screen'); }

window.onload = () => { tg.ready(); initPhoneUI(); updateMainButton(); };
