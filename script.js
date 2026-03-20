let tg = window.Telegram.WebApp;
tg.expand();

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0 },
    item2: { name: "Эспандер", price: 12, qty: 0 }
};

window.addToCart = function(id) {
    products[id].qty = 1;
    updateCardUI(id);
    updateTotal();
};

window.changeQty = function(id, delta) {
    products[id].qty += delta;
    if (products[id].qty <= 0) {
        products[id].qty = 0;
        resetCardUI(id);
    }
    updateCardUI(id);
    updateTotal();
};

function updateCardUI(id) {
    const card = document.getElementById(id);
    if (card) {
        card.querySelector('.add-trigger').style.display = 'none';
        card.querySelector('.counter').style.display = 'flex';
        card.querySelector('.qty').innerText = products[id].qty;
    }
}

function resetCardUI(id) {
    const card = document.getElementById(id);
    if (card) {
        card.querySelector('.add-trigger').style.display = 'block';
        card.querySelector('.counter').style.display = 'none';
    }
}

function updateTotal() {
    let total = 0;
    for (let id in products) {
        total += products[id].price * products[id].qty;
    }

    const btn = document.getElementById('footer-btn');
    if (btn) {
        if (total > 0) {
            btn.style.display = 'block';
            if (document.getElementById('shop-screen').classList.contains('active')) {
                btn.innerText = `КОРЗИНА ($${total.toFixed(2)})`;
            } else {
                btn.innerText = `К ОФОРМЛЕНИЮ`;
            }
        } else {
            btn.style.display = 'none';
        }
    }
}

window.handleFooterClick = function() {
    if (document.getElementById('shop-screen').classList.contains('active')) {
        showCart();
    } else {
        tg.showConfirm("Перейти к оформлению заказа?", (ok) => {
            if (ok) {
                // Здесь можно добавить логику завершения
                tg.close();
            }
        });
    }
};

function showCart() {
    document.getElementById('shop-screen').classList.remove('active');
    document.getElementById('cart-screen').classList.add('active');
    
    const list = document.getElementById('cart-items-list');
    list.innerHTML = '';
    let total = 0;

    for (let id in products) {
        if (products[id].qty > 0) {
            let sum = products[id].qty * products[id].price;
            total += sum;
            list.innerHTML += `
                <div class="cart-item" style="display:flex; justify-content:space-between; padding:10px 0;">
                    <span>${products[id].name} x${products[id].qty}</span>
                    <span>$${sum}</span>
                </div>`;
        }
    }
    document.getElementById('total-sum').innerText = `Сумма: $${total}`;
    document.getElementById('total-final').innerText = `Итог: $${total}`;
    updateTotal();
}

window.showShop = function() {
    document.getElementById('cart-screen').classList.remove('active');
    document.getElementById('shop-screen').classList.add('active');
    updateTotal();
};