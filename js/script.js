let tg = window.Telegram.WebApp;
tg.expand();

const SUPABASE_URL = 'https://jzlrxsfbfhgfmrwrtwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DXHDERQmtCOylso58j4AWg_sM4ymrD0'; 

let cart = {};
let currentStep = 'main';
let allProducts = [];

const BOT_TOKEN = '8677453235:AAHRTKraVGyg_Kh_kByvgyMHcq_IA7x2who';
const CHAT_ID = '-1003538222198';

// 1. Загрузка товаров
async function loadProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        allProducts = await response.json();
        renderProducts(allProducts);
    } catch (e) { console.error("Ошибка:", e); }
}

// 2. Отрисовка витрины
function renderProducts(products) {
    const grid = document.getElementById('products-grid');
    grid.innerHTML = '';
    products.forEach(p => {
        grid.innerHTML += `
            <div class="product-card">
                <img src="${p.image_url}" onclick="showInfo(${p.id})">
                <h3>${p.title}</h3>
                <div class="price">$${p.price}</div>
                <div class="btn-group">
                    <button id="add-${p.id}" class="add-btn" onclick="firstAdd(${p.id}, ${p.price})">ДОБАВИТЬ</button>
                    <div id="ctrl-${p.id}" class="counter-ctrl">
                        <button class="count-btn" onclick="changeCount(${p.id}, ${p.price}, -1)">-</button>
                        <span id="count-${p.id}">1</span>
                        <button class="count-btn" onclick="changeCount(${p.id}, ${p.price}, 1)">+</button>
                    </div>
                    <button class="info-btn" onclick="showInfo(${p.id})">ИНФО</button>
                </div>
            </div>
        `;
    });
}

// 3. Логика Info Sheet
function showInfo(id) {
    const p = allProducts.find(item => item.id === id);
    if (!p) return;
    document.getElementById('sheet-title').innerText = p.title;
    document.getElementById('sheet-img').src = p.image_url;
    document.getElementById('sheet-desc').innerText = p.description;
    document.getElementById('sheet-price').innerText = `$${p.price}`;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
}

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
}

// 4. Корзина
function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    cart[id] = { count: 1, price: parseFloat(price) };
    updateMainButton();
}

function changeCount(id, price, delta) {
    cart[id].count += delta;
    if (cart[id].count <= 0) {
        delete cart[id];
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
    } else {
        document.getElementById(`count-${id}`).innerText = cart[id].count;
    }
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let id in cart) total += cart[id].count * cart[id].price;
    if (total > 0) {
        tg.MainButton.setText(`КОРЗИНА ($${total.toFixed(2)})`);
        tg.MainButton.show();
    } else { tg.MainButton.hide(); }
}

// Запуск приложения
loadProducts();
