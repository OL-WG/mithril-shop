let tg = window.Telegram.WebApp;
tg.expand();
tg.ready();

let products = {
    item1: { name: "AXE", price: 35, desc: "Ручка AXE — универсальный инструмент для развития силы пронации и хвата." },
    item2: { name: "ЭСПАНДЕР", price: 12, desc: "Кистевой эспандер для развития взрывной силы хвата." }
};

function showInfo(id) {
    const item = products[id];

    const images = {
        item1: "ruchka.webp",
        item2: "expander.webp"
    };

    document.getElementById('modal-body').innerHTML = `
        <div class="info-card">

            <div class="info-image-box">
                <img src="${images[id]}">
            </div>

            <div class="info-content">

                <div class="info-label">ИНФОРМАЦИЯ</div>

                <h2 class="info-title">РУКОЯТКА "${item.name}"</h2>
                <div class="info-subtitle">MithrilArm Professional Series</div>

                <p class="info-desc">${item.desc}</p>

                <div class="info-bottom">
                    <div class="info-price-label">СТОИМОСТЬ</div>
                    <div class="info-price">$${item.price}.00</div>
                </div>

                <button class="info-btn" onclick="closeModal()">ПОНЯТНО</button>

            </div>

        </div>
    `;

    document.getElementById('info-modal').style.display = 'flex';
}

function closeModal() {
    document.getElementById('info-modal').style.display = 'none';
}

function addToCart(id) {
    alert("Добавлено в корзину");
}

function changeQty() {}
