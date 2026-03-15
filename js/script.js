let tg = window.Telegram.WebApp;
let cart = [];
let step = 1; // 1: Витрина, 2: Корзина, 3: Данные

tg.expand();
tg.MainButton.textColor = "#000000";
tg.MainButton.color = "#ffffff";

function addToCart(name, price) {
    cart.push({name, price});
    updateButton();
}

function updateButton() {
    let sum = cart.reduce((acc, item) => acc + item.price, 0);
    if (sum > 0) {
        tg.MainButton.setText(`ПРОСМОТРЕТЬ КОРЗИНУ ($${sum})`);
        tg.MainButton.show();
    }
}

tg.MainButton.onClick(() => {
    if (step === 1) {
        // Переход в корзину
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        
        let list = document.getElementById('cart-list');
        list.innerHTML = cart.map(i => `<div class="cart-item"><span>${i.name}</span><span>$${i.price}</span></div>`).join('');
        
        let sum = cart.reduce((acc, item) => acc + item.price, 0);
        document.getElementById('total-price').innerText = `$${sum}`;
        
        tg.MainButton.setText("К ДАННЫМ ДОСТАВКИ");
        step = 2;
    } 
    else if (step === 2) {
        // Переход к форме данных
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setText("К ПРОВЕРКЕ");
        step = 3;
    } 
    else if (step === 3) {
        // Сбор данных и отправка в бот (ФИНАЛЬНЫЙ ШАГ)
        const data = {
            order: cart,
            total: cart.reduce((acc, item) => acc + item.price, 0),
            user: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek').value,
                email: document.getElementById('email').value
            }
        };

        // Проверка заполнения
        if (!data.user.fio || !data.user.phone || !data.user.email) {
            tg.showAlert("Пожалуйста, заполните основные поля!");
            return;
        }

        // ОТПРАВКА ДАННЫХ В БОТ
        tg.sendData(JSON.stringify(data));
        tg.close(); // Закрываем мини-апп после отправки
    }
});
