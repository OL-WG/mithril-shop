let tg = window.Telegram.WebApp;

tg.expand();
tg.ready();

tg.MainButton.setParams({
    color: '#000000',
    text_color: '#ffffff'
});

let products = {
    item1: { name: "Ручка Arm", price: 35, qty: 0, desc: "Профессиональная ручка для тренировок." },
    item2: { name: "Эспандер", price: 12, qty: 0, desc: "Кистевой эспандер для силы хвата." }
};

let isJarvis = false;

tg.MainButton.onClick(function () {

    if (isActive('shop-screen')) {
        showCart();
    }
    else if (isActive('cart-screen')) {
        showDelivery();
    }
    else if (isActive('delivery-screen')) {
        showCheckout();
    }
    else if (isActive('checkout-screen')) {
        sendOrder();
    }

});


function sendOrder() {

    let cart = {};
    let subtotal = 0;

    for (let id in products) {

        if (products[id].qty > 0) {

            cart[id] = {
                name: products[id].name,
                price: products[id].price,
                count: products[id].qty
            };

            subtotal += products[id].price * products[id].qty;

        }
    }

    let orderData = {

        customer: {
            fio: v('fio'),
            phone: v('phone'),
            country: v('country'),
            city: v('city'),
            cdek: v('address'),
            email: v('email')
        },

        cart: cart,

        promo: isJarvis ? "JARVIS" : "нет",

        total: (isJarvis ? subtotal * 0.85 : subtotal)

    };

    tg.sendData(JSON.stringify(orderData));

    setTimeout(() => {

        tg.close();

    }, 500);

}
