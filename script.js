let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: {
        id: 'item1',
        name: 'Рукоятка "AXE"',
        price: 35,
        qty: 0,
        img: 'ruchka.webp',
        desc: 'Развитие силы пронации и подъема.',
        fullDesc: 'Рукоятка "AXE" — это универсальный тренировочный инструмент, специально разработанный для развития силы пронации и силы подъема. Инновационная конструкция обеспечивает точное задействование мышц, что делает ее идеальной для армрестлеров, стремящихся к совершенствованию техники.'
    },
    item2: {
        id: 'item2',
        name: 'Эспандер',
        price: 12,
        qty: 0,
        img: 'expander.webp',
        desc: 'Сила хвата и выносливость.',
        fullDesc: 'Профессиональный кистевой эспандер для развития взрывной силы хвата. Идеально подходит для подготовки к соревнованиям.'
    }
};

function renderProducts() {
    const container = document.querySelector('.products-list');
    container.innerHTML = '';
    for (let id in products) {
        let p = products[id];
        container.innerHTML += `
            <div class="product-card" id="${p.id}">
                <div class="image-box">
                    <div class="badge badge-new">+ NEW</div>
                    <div class="badge badge-stock">В НАЛИЧИИ</div>
                    <img src="${p.img}" alt="${p.name}">
                </div>
                <div class="product-info">
                    <h3>${p.name}</h3>
                    <p class="description">${p.desc}</p>
                    <div class="price-row">
                        <div class="price-val">$${p.price}.00</div>
                        <div class="controls">
                            <button class="btn-info-small" onclick="showInfo('${p.id}')">ИНФО</button>
                            <button class="btn-add-main add-trigger" id="add-btn-${p.id}" onclick="addToCart('${p.id}')">ДОБАВИТЬ</button>
                            <div class="quantity-control" id="qty-ctrl-${p.id}">
                                <button class="qty-btn" onclick="changeQty('${p.id}', -1)">−</button>
                                <span class="qty" id="qty-val-${p.id}">0</span>
                                <button class="qty-btn" onclick="changeQty('${p.id}', 1)">+</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }
}

function showInfo(id) {
    const p = products[id];
    document.getElementById('modal-product-img').src = p.img;
    document.getElementById('modal-product-title').innerText = p.name;
    document.getElementById('modal-product-desc').innerText = p.fullDesc;
    document.getElementById('modal-product-price').innerText = `$${p.price}.00`;
    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() { document.getElementById('info-modal').style.display = 'none'; }

function addToCart(id) {
    products[id].qty = 1;
    updateUI(id);
}

function changeQty(id, delta) {
    products[id].qty += delta;
    if (products[id].qty < 0) products[id].qty = 0;
    updateUI(id);
}

function updateUI(id) {
    const p = products[id];
    const addBtn = document.getElementById(`add-btn-${id}`);
    const qtyCtrl = document.getElementById(`qty-ctrl-${id}`);
    const qtyVal = document.getElementById(`qty-val-${id}`);

    if (p.qty > 0) {
        addBtn.style.display = 'none';
        qtyCtrl.classList.add('show');
        qtyVal.innerText = p.qty;
    } else {
        addBtn.style.display = 'block';
        qtyCtrl.classList.remove('show');
    }
    updateMainButton();
}

function updateMainButton() {
    let total = 0;
    for (let id in products) total += products[id].qty;
    if (total > 0) {
        tg.MainButton.setText(`🛒 КОРЗИНА (${total})`);
        tg.MainButton.show();
    } else tg.MainButton.hide();
}

// Экраны и навигация
function showScreen(id) {
    document.querySelectorAll('.screen').forEach(s => s.classList.remove('active'));
    document.getElementById(id).classList.add('active');
}
function showShop() { showScreen('shop-screen'); }
function showCart() { renderCart(); showScreen('cart-screen'); }
// Добавь остальные функции (renderCart, applyPromo и т.д.) из своего старого кода

window.onload = () => {
    renderProducts();
    tg.ready();
};
