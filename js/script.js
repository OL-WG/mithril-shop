// --- Навигация ---
tg.MainButton.onClick(() => {
    if (currentStep === 'main') {
        currentStep = 'cart';
        document.getElementById('main-screen').style.display = 'none';
        document.getElementById('cart-screen').style.display = 'block';
        renderCart();
        tg.MainButton.setParams({ text: "К ДАННЫМ ДОСТАВКИ", color: "#000000", text_color: "#ffffff" });
        tg.BackButton.show();
    } else if (currentStep === 'cart') {
        currentStep = 'address';
        document.getElementById('cart-screen').style.display = 'none';
        document.getElementById('address-screen').style.display = 'block';
        tg.MainButton.setParams({ text: "К ПРОВЕРКЕ", color: "#000000", text_color: "#ffffff" });
    } else if (currentStep === 'address') {
        // Валидация полей
        const fields = ['fio', 'phone', 'country', 'city', 'cdek-addr', 'email'];
        if (fields.some(id => !document.getElementById(id).value)) {
            return tg.showAlert("Сэр, необходимо заполнить все поля получателя!");
        }
        showCheckout();
    } else if (currentStep === 'checkout') {
        // --- ФИНАЛЬНЫЙ ШАГ: ОТПРАВКА ---
        
        // Считаем сумму товаров без скидки для отчета
        let subtotalVal = 0;
        for (let key in cart) {
            subtotalVal += cart[key].count * cart[key].price;
        }
        
        // Собираем полный объект данных
        const finalOrder = {
            cart: cart,
            customer: {
                fio: document.getElementById('fio').value,
                phone: document.getElementById('phone').value,
                country: document.getElementById('country').value,
                city: document.getElementById('city').value,
                cdek: document.getElementById('cdek-addr').value,
                email: document.getElementById('email').value
            },
            promo: appliedPromo || "Нет",
            subtotal: `$${subtotalVal.toFixed(2)}`,
            total: document.getElementById('check-total-price').innerText // Берем уже посчитанную строку с ценой
        };

        // Отправляем данные боту (этот метод закроет приложение и вызовет web_app_data в Python)
        tg.sendData(JSON.stringify(finalOrder));
        
        // На всякий случай закрываем вручную через небольшую задержку
        setTimeout(() => {
            tg.close();
        }, 100);
    }
});
