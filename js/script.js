let tg = window.Telegram.WebApp;
tg.expand();

// --- НАСТРОЙКИ SUPABASE ---
const SUPABASE_URL = 'https://jzlrxsfbfhgfmrwrtwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DXHDERQmtCOylso58j4AWg_sM4ymrD0'; //

let cart = {};
let currentStep = 'main';
let discountPercent = 0;
let appliedPromo = "";
let allProducts = []; 

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
        console.error("Ошибка загрузки:", err);
    }
}

// Рендер карточек (восстанавливаем кнопки ИНФО и логику счетчиков)
function renderMainPage(products) {
    const container = document.querySelector('.products-grid') || document.getElementById('products-grid'); 
    if (!container) return;
    
    container.innerHTML = '';
    products.forEach(p => {
        container.innerHTML += `
            <div class="product-card">
                <img src="${p.image_url}" alt="${p.title}">
                <h3>${p.title}</h3>
                <p class="price">$${p.price}</p>
                
                <div id="ctrl-${p.id}" class="counter-ctrl" style="display:none">
                    <button class="count-btn" onclick="changeCount(${p.id}, ${p.price}, -1)">-</button>
                    <span id="count-${p.id}" class="count-num">0</span>
                    <button class="count-btn" onclick="changeCount(${p.id}, ${p.price}, 1)">+</button>
                </div>
                
                <button id="add-${p.id}" class="add-btn" onclick="firstAdd(${p.id}, ${p.price})">ДОБАВИТЬ</button>
                <button class="info-btn" onclick="showInfo(${p.id})">ИНФО</button>
            </div>
        `;
    });
}

// --- Логика Инфо ---
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

function closeInfo() {
    document.getElementById('info-sheet').classList.remove('open');
    document.getElementById('main-container').classList.remove('blur');
    updateMainButton();
}

// --- Логика Корзины ---
function firstAdd(id, price) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
    cart[id] = { count: 1, price: parseFloat(price) };
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
    for (let id in cart) subtotal += cart[id].count * cart[id].price;
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

// Рендер предметов в корзине (исправлено под базу)
function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let id in cart) {
        const product = allProducts.find(p => p.id == id);
        if (cart[id].count > 0 && product) {
            let itemTotal = cart[id].count * cart[id].price;
            subtotal += itemTotal;
            list.innerHTML += `
                <div class="cart-item">
                    <span><b>${product.title}</b> x${cart[id].count}</span>
                    <span style="margin-left:auto">$${itemTotal.toFixed(2)}</span>
                </div>`;
        }
    }
    
    let discountVal = subtotal * discountPercent;
    let finalTotal = subtotal - discountVal;
    document.getElementById('cart-subtotal').innerText = `$${subtotal.toFixed(2)}`;
    document.getElementById('cart-total-price').innerText = `$${finalTotal.toFixed(2)}`;
}

// Запуск
loadProducts();
