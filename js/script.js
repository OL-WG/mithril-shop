let tg = window.Telegram.WebApp;
tg.expand();

// --- НАСТРОЙКИ SUPABASE ---
const SUPABASE_URL = 'https://jzlrxsfbfhgfmrwrtwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DXHDERQmtCOylso58j4AWg_sM4ymrD0NON_KEY'; // Тот самый Publishable Key

let cart = {};
let currentStep = 'main';
let discountPercent = 0;
let appliedPromo = "";
let allProducts = []; // Тут будут храниться товары из базы

const BOT_TOKEN = '8677453235:AAHRTKraVGyg_Kh_kByvgyMHcq_IA7x2who';
const CHAT_ID = '-1003538222198';

// --- ЗАГРУЗКА ИЗ БАЗЫ ---
async function loadProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        allProducts = await response.json();
        renderMainPage(allProducts);
    } catch (err) {
        console.error("Ошибка загрузки товаров:", err);
    }
}

// Рисуем карточки товаров на главной
function renderMainPage(products) {
    const container = document.getElementById('products-grid'); // Убедись, что в HTML есть такой ID
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <div class="info-icon" onclick="showInfo(${p.id})">i</div>
                <img src="${p.image_url}" alt="${p.title}">
                <h3>${p.title}</h3>
                <p class="price">$${p.price}</p>
                <button id="add-${p.id}" class="add-btn" onclick="firstAdd(${p.id}, '${p.price}')">ADD</button>
                <div id="ctrl-${p.id}" class="counter-ctrl" style="display:none">
                    <button onclick="changeCount(${p.id}, '${p.price}', -1)">-</button>
                    <span id="count-${p.id}">0</span>
                    <button onclick="changeCount(${p.id}, '${p.price}', 1)">+</button>
                </div>
            </div>
        `;
    });
}

// --- Логика Окна Инфо (теперь из базы) ---
function showInfo(id) {
    const data = allProducts.find(p => p.id === id);
    if (!data) return;
    document.getElementById('sheet-title').innerText = data.title;
    document.getElementById('sheet-img').src = data.image_url;
    document.getElementById('sheet-desc').innerText = data.description;
    document.getElementById('sheet-price').innerText = `$${data.price}`;
    document.getElementById('info-sheet').classList.add('open');
    document.getElementById('main-container').classList.add('blur');
}

// --- Остальная логика (корзина и кнопки) ---
function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    let numPrice = parseFloat(price);
    cart[id] = { count: 1, price: numPrice, title: allProducts.find(p => p.id === id).title };
    document.getElementById(`count-${id}`).innerText = "1";
    updateMainButton();
}

function changeCount(id, price, delta) {
    if (!cart[id]) return;
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
    let subtotal = 0;
    for (let key in cart) subtotal += cart[key].count * cart[key].price;
    let total = subtotal * (1 - discountPercent);

    if (total > 0 && currentStep === 'main') {
        tg.MainButton.setParams({
            text: `КОРЗИНА ($${total.toFixed(2)})`,
            color: "#000000",
            is_visible: true
        });
    } else if (total === 0) {
        tg.MainButton.hide();
    }
}

// Не забудь вызвать загрузку при старте страницы!
loadProducts();

// ... (функции closeInfo, renderCart, showCheckout и отправка в ТГ остаются почти такими же)
