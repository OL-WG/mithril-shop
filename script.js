let tg = window.Telegram.WebApp;

tg.expand();

tg.ready();


tg.MainButton.setParams({

color:'#000000',

text_color:'#ffffff'

});


let products={

item1:{name:"Ручка Arm",price:35,qty:0,desc:"Профессиональная ручка для тренировок."},

item2:{name:"Эспандер",price:12,qty:0,desc:"Кистевой эспандер для силы хвата."}

};


let isJarvis=false;


tg.onEvent('mainButtonClicked',function(){

if(isActive('shop-screen')){

showCart()

}

else if(isActive('cart-screen')){

showDelivery()

}

else if(isActive('delivery-screen')){

showCheckout()

}

else{

sendOrder()

}

})


function addToCart(id){

let card=document.getElementById(id)

products[id].qty=1

card.querySelector('.add-trigger').style.display='none'

card.querySelector('.counter').style.display='flex'

card.querySelector('.qty').innerText=1

updateTotal()

}



function changeQty(id,delta){

let card=document.getElementById(id)

products[id].qty+=delta

if(products[id].qty<=0){

products[id].qty=0

card.querySelector('.add-trigger').style.display='block'

card.querySelector('.counter').style.display='none'

}

else{

card.querySelector('.qty').innerText=products[id].qty

}

updateTotal()

}



function applyPromo(){

let val=document.getElementById('promo-input').value.toLowerCase()

if(val==="jarvis"){

isJarvis=true

tg.showAlert("Промокод применен")

showCart()

}

}



function updateTotal(){

let subtotal=0

for(let id in products){

subtotal+=products[id].price*products[id].qty

}


if(subtotal>0){

if(isActive('shop-screen')){

tg.MainButton.setText(`В КОРЗИНУ $${subtotal.toFixed(2)}`)

}

else if(isActive('cart-screen')){

tg.MainButton.setText("К ОФОРМЛЕНИЮ")

}

else if(isActive('delivery-screen')){

tg.MainButton.setText("ПРОВЕРИТЬ ДАННЫЕ")

}

else{

let final=isJarvis?subtotal*0.85:subtotal

tg.MainButton.setText(`ОПЛАТИТЬ $${final.toFixed(2)}`)

}

tg.MainButton.show()

}

else{

tg.MainButton.hide()

}

}



function showCart(){

switchScreen('cart-screen')

let list=document.getElementById('cart-items-list')

let summary=document.getElementById('cart-summary')

list.innerHTML=''

let sub=0


for(let id in products){

if(products[id].qty>0){

let sum=products[id].qty*products[id].price

sub+=sum

list.innerHTML+=`<div class="cart-item"><span>${products[id].name} x${products[id].qty}</span><span>$${sum.toFixed(2)}</span></div>`

}

}


if(isJarvis){

let disc=sub*0.15

summary.innerHTML=`

<div>Сумма: $${sub.toFixed(2)}</div>

<div>Скидка: -$${disc.toFixed(2)}</div>

<b>Итого: $${(sub-disc).toFixed(2)}</b>

`

}

else{

summary.innerHTML=`<b>Сумма: $${sub.toFixed(2)}</b>`

}

updateTotal()

}



function showCheckout(){


if(!v('fio')||!v('phone')||!v('country')||!v('city')||!v('address')||!v('email')){

tg.showAlert("Пожалуйста заполните все поля")

return

}


switchScreen('checkout-screen')


let sub=0

let items=""


for(let id in products){

if(products[id].qty>0){

sub+=products[id].price*products[id].qty

items+=`<div>${products[id].name} x${products[id].qty}</div>`

}

}


let final=isJarvis?sub*0.85:sub


document.getElementById('check-order').innerHTML=items


document.getElementById('check-delivery').innerHTML=

`

<b>${v('fio')}</b><br>

📞 ${v('phone')}<br>

🌍 ${v('country')}<br>

🏙 ${v('city')}<br>

📦 ${v('address')}<br>

📧 ${v('email')}

`


document.getElementById('final-pay-amount').innerText=`К оплате: $${final.toFixed(2)}`


updateTotal()

}



function sendOrder(){


let cart={}

let subtotal=0


for(let id in products){

if(products[id].qty>0){

cart[id]={

name:products[id].name,

price:products[id].price,

count:products[id].qty

}

subtotal+=products[id].price*products[id].qty

}

}


let final=isJarvis?subtotal*0.85:subtotal


let order={

customer:{

fio:v('fio'),

phone:v('phone'),

country:v('country'),

city:v('city'),

cdek:v('address'),

email:v('email')

},

cart:cart,

promo:isJarvis?"JARVIS":"нет",

total:final.toFixed(2)

}


tg.sendData(JSON.stringify(order))

tg.MainButton.hide()

}



function switchScreen(id){

document.querySelectorAll('.screen').forEach(s=>s.classList.remove('active'))

document.getElementById(id).classList.add('active')

updateTotal()

}



function isActive(id){

return document.getElementById(id).classList.contains('active')

}



function v(id){

return document.getElementById(id).value||""

}



function showShop(){

switchScreen('shop-screen')

}



function showDelivery(){

switchScreen('delivery-screen')

}



function closeModal(){

document.getElementById('info-modal').style.display='none'

}



function showInfo(id){

document.getElementById('modal-body').innerHTML=`<h2>${products[id].name}</h2><p>${products[id].desc}</p>`

document.getElementById('info-modal').style.display='flex'

}
