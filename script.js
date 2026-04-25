function showInfo(id) {
    const item = products[id];

    const images = {
        item1: "ruchka.webp",
        item2: "expander.webp"
    };

    document.getElementById('modal-body').innerHTML = `
        <div class="info-card">

            <div class="info-image-box">
                <img src="${images[id]}" alt="${item.name}">
            </div>

            <div class="info-content">
                <div class="info-label">ИНФОРМАЦИЯ</div>

                <h2 class="info-title">РУКОЯТКА "${item.name.toUpperCase()}"</h2>
                <div class="info-subtitle">MithrilArm Professional Series</div>

                <p class="info-desc">
                    ${item.desc} Это универсальный тренировочный инструмент,
                    разработанный для развития силы пронации и подъёма.
                    Подходит как новичкам, так и профессионалам.
                </p>

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
