let discount = 0;
let appliedPromo = "";

function applyPromo() {
    const code = document.getElementById('promo-input').value.trim().toUpperCase();
    // Логика: JARVIS дает 10%
    if (code === "JARVIS") {
        discount = 0.1;
        appliedPromo = code;
        document.getElementById('promo-msg').style.color = "#4CAF50";
        document.getElementById('promo-msg').innerText = "Промокод применен: Скидка 10%";
    } else {
        discount = 0;
        appliedPromo = "";
        document.getElementById('promo-msg').style.color = "#f44336";
        document.getElementById('promo-msg').innerText = "Неверный промокод";
    }
    renderCart();
}

function renderCart() {
    let list = document.getElementById('cart-items-list');
    list.innerHTML = ''; 
    let subtotal = 0;
    for (let key in cart) {
        if (cart[key].count > 0) {
            let itemTotal = cart[key].count * cart[key].price;
            subtotal += itemTotal;
            list.innerHTML += `<div class="cart-item"><b>${key} x${cart[key].count}</b><div style="margin-left:auto">$${itemTotal.toFixed(2)}</div></div>`;
        }
    }
    // Применяем скидку к итогу
    let finalTotal = subtotal * (1 - discount);
    document.getElementById('cart-total-price').innerText = `$${finalTotal.toFixed(2)}`;
}

// В навигации убрана проверка на @mail.ru
// Теперь проходят любые почты (Gmail, iCloud и т.д.)
