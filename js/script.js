let tg = window.Telegram.WebApp;
tg.expand();

// Твои данные из скриншотов
const SUPABASE_URL = 'https://jzlrxsfbfhgfmrwrtwv.supabase.co';
const SUPABASE_KEY = 'sb_publishable_DXHDERQmtCOylso58j4AWg_sM4ymrD0';

async function loadProducts() {
    try {
        const response = await fetch(`${SUPABASE_URL}/rest/v1/products?select=*`, {
            headers: { 
                'apikey': SUPABASE_KEY, 
                'Authorization': `Bearer ${SUPABASE_KEY}` 
            }
        });
        const products = await response.json();
        
        const grid = document.getElementById('product-grid');
        grid.innerHTML = ''; 

        products.forEach(p => {
            grid.innerHTML += `
                <div class="product-item">
                    <img src="${p.image_url}">
                    <div class="product-name">${p.title}</div>
                    <div class="price">$${p.price}</div>
                    <div class="btn-group">
                        <button id="add-${p.id}" class="add-btn" onclick="addToCart(${p.id})">ДОБАВИТЬ</button>
                        <div id="ctrl-${p.id}" class="count-ctrl">
                            <button class="cnt-btn" onclick="changeQty(${p.id}, -1)">-</button>
                            <span id="qty-${p.id}" style="padding: 0 10px;">1</span>
                            <button class="cnt-btn" onclick="changeQty(${p.id}, 1)">+</button>
                        </div>
                        <button class="info-btn">ИНФО</button>
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Ошибка загрузки:", err);
    }
}

function addToCart(id) {
    document.getElementById(`add-${id}`).style.display = 'none';
    document.getElementById(`ctrl-${id}`).style.display = 'flex';
}

function changeQty(id, delta) {
    let el = document.getElementById(`qty-${id}`);
    let val = parseInt(el.innerText) + delta;
    if (val <= 0) {
        document.getElementById(`add-${id}`).style.display = 'block';
        document.getElementById(`ctrl-${id}`).style.display = 'none';
        el.innerText = 1;
    } else {
        el.innerText = val;
    }
}

loadProducts();
