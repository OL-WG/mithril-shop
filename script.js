const tg = window.Telegram.WebApp

tg.expand()

const products = {

arm:{name:"Ручка Arm",price:35,qty:0},

expander:{name:"Эспандер",price:12,qty:0}

}

let isJarvis=false



function switchScreen(id){

document.querySelectorAll(".screen").forEach(s=>s.classList.remove("active"))

document.getElementById(id).classList.add("active")

}



function showCatalog(){

switchScreen("catalog-screen")

}



function showCart(){

switchScreen("cart-screen")

renderCart()

}



function showDelivery(){

if(getTotalQty()==0){

tg.showAlert("Корзина пустая")

return

}

switchScreen("delivery-screen")

}



function changeQty(id,val){

products[id].qty=Math.max(0,products[id].qty+val)

document.getElementById("qty-"+id).innerText=products[id].qty

updateTotal()

}



function getTotalQty(){

let t=0

for(let p in products){

t+=products[p].qty

}

return t

}



function updateTotal(){

document.getElementById("cart-count").innerText=getTotalQty()

}



function renderCart(){

let html=""

let total=0



for(let id in products){

let p=products[id]

if(p.qty>0){

let sum=p.qty*p.price

total+=sum

html+=`<div class="check-row"><span>${p.name} x${p.qty}</span><span>$${sum}</span></div>`

}

}



document.getElementById("cart-items").innerHTML=html

document.getElementById("cart-total").innerText="Сумма: $"+total

}



function applyPromo(){

let code=document.getElementById("promo-input").value

if(code==="JARVIS"){

isJarvis=true

tg.showAlert("Промокод применен")

}else{

tg.showAlert("Неверный промокод")

}

}



function v(id){

return document.getElementById(id).value

}



function showCheckout(){

if(!v("fio")||!v("phone")||!v("country")||!v("city")||!v("address")||!v("email")){

tg.showAlert("Пожалуйста заполните все поля")

return

}



switchScreen("checkout-screen")



let items=""

let sub=0



for(let id in products){

let p=products[id]

if(p.qty>0){

let sum=p.qty*p.price

sub+=sum

items+=`<div class="check-row"><span>${p.name} x${p.qty}</span><span>$${sum}</span></div>`

}

}



document.getElementById("check-order").innerHTML=`

<div class="check-title">Товары</div>

${items}

`



document.getElementById("check-delivery").innerHTML=`

<div class="check-title">Данные клиента</div>

<div class="check-row"><span>ФИО</span><span>${v("fio")}</span></div>

<div class="check-row"><span>Телефон</span><span>${v("phone")}</span></div>

<div class="check-row"><span>Страна</span><span>${v("country")}</span></div>

<div class="check-row"><span>Город</span><span>${v("city")}</span></div>

<div class="check-row"><span>Адрес СДЭК</span><span>${v("address")}</span></div>

<div class="check-row"><span>Email</span><span>${v("email")}</span></div>

`



let final=isJarvis?sub*0.85:sub

let discount=sub-final



let price=`<div class="check-row"><span>Сумма</span><span>$${sub.toFixed(2)}</span></div>`



if(isJarvis){

price+=`<div class="check-row"><span>Скидка</span><span>-$${discount.toFixed(2)}</span></div>`

}



price+=`<div class="check-total"><span>К оплате</span><span>$${final.toFixed(2)}</span></div>`



document.getElementById("final-pay-amount").innerHTML=price

}



function sendOrder(){

let order={

items:products,

customer:{

fio:v("fio"),

phone:v("phone"),

country:v("country"),

city:v("city"),

address:v("address"),

email:v("email")

}

}



tg.sendData(JSON.stringify(order))

}
