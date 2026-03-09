let tg = window.Telegram.WebApp;
tg.expand();

// Принудительная покраска интерфейса Telegram в черный
tg.setHeaderColor('#000000');
tg.setBackgroundColor('#000000');

let cart = [];

function addToCart(name, price) {
    cart.push({name, price});
    updateCartUI();
}

function updateCartUI() {
    const cartStatus = document.getElementById('cart-status');
    const cartText = document.getElementById('cart-text');
    const totalPrice = document.getElementById('total-price');
    
    if (cart.length > 0) {
        cartStatus.style.display = 'flex';
        let total = cart.reduce((sum, item) => sum + item.price, 0);
        cartText.innerText = `Выбрано товаров: ${cart.length}`;
        totalPrice.innerText = total;
    }
}

function sendOrder() {
    if (cart.length === 0) return;
    
    let items = cart.map(item => item.name).join(", ");
    let total = cart.reduce((sum, item) => sum + item.price, 0);
    
    // Отправляем данные в бота
    tg.sendData(`🛒 Заказ: ${items} на сумму ${total}₽`);
    tg.close();
}
