let tg = window.Telegram.WebApp;
tg.expand();
tg.MainButton.setParams({ color: '#ffffff', text_color: '#000000' }); // Черно-белая кнопка

const SUPABASE_URL = 'https://jzlrxsfbfhgfmrwrtwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DXHDERQmtCOylso58j4AWg_sM4ymrD0';

let allProducts = [];
let cart = {};
let currentScreen = 'main';

// Загрузка товаров
async function loadProducts() {
    const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
        headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
    });
    allProducts = await response.json();
    renderProducts();
}

function renderProducts() {
    const grid = document.getElementById('product-grid');
    grid.innerHTML = '';
    allProducts.forEach(p => {
        grid.innerHTML += `
            <div class="product-item">
                <img src="${p.image_url}">
                <div class="product-name">${p.title}</div>
                <div class="price">$${p.price}</div>
                <div class="btn-group">
                    <button id="add-${p.id}" class="add-btn" onclick="addToCart(${p.id}, ${p.price})">ДОБАВИТЬ</button>
                    <div id="ctrl-${p.id}" class="count-ctrl">
                        <button class="cnt-btn" onclick="updateCount(${p.id}, -1)">-</button>
                        <span id="cnt-${p.id}">1</span>
                        <button class="cnt-btn" onclick="updateCount(${p.id}, 1)">+</button>
                    </div>
                    <button class="info-btn">ИНФО</button>
                </div>
            </div>`;
    });
}

function addToCart(id, price) {
    cart[id] = { count: 1, price: price };
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    updateMainButton();
}

function updateCount(id, delta) {
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`cnt-${id}`).innerText = cart[id].count;
    }
    updateMainButton();
}

function updateMainButton() {
    let total = Object.values(cart).reduce((sum, item) => sum + (item.count * item.price), 0);
    if (total > 0) {
        tg.MainButton.setText(`КОРЗИНА ($${total})`);
        tg.MainButton.show();
    } else {
        tg.MainButton.hide();
    }
}

// Переключение экранов
tg.onEvent('mainButtonClicked', () => {
    if (currentScreen === 'main') {
        showScreen('cart');
        tg.MainButton.setText('ОФОРМИТЬ ЗАКАЗ');
    } else if (currentScreen === 'cart') {
        showScreen('address');
        tg.MainButton.setText('ПОДТВЕРДИТЬ');
    }
});

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById('screen-' + screenId).classList.add('active');
    currentScreen = screenId;
}

loadProducts();
