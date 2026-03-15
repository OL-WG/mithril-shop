import asyncio
import json
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command
from aiogram.types import WebAppInfo, InlineKeyboardMarkup, InlineKeyboardButton

TOKEN = '7548447935:AAEq66mRun9O9kxPwccXDv7lPYvs0bW-KmE'
bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start(message: types.Message):
    web_app = WebAppInfo(url="https://ol-wg.github.io/mithril-shop/")
    markup = InlineKeyboardMarkup(inline_keyboard=[
        [InlineKeyboardButton(text="Открыть магазин", web_app=web_app)]
    ])
    await message.answer("Нажмите на кнопку для заказа:", reply_markup=markup)

@dp.message(F.web_app_data)
async def web_app_data_handler(message: types.Message):
    try:
        data = json.loads(message.web_app_data.data)
        cart = data.get('cart', {})
        # Извлекаем расширенные данные получателя
        customer = data.get('customer', {})
        total = data.get('total', '$0.00')
        
        res = "✅ **Новый заказ подтвержден!**\n\n"
        
        # Структурируем данные о клиенте (ФИО, СДЭК, Email)
        res += f"👤 **Получатель:** {customer.get('fio', 'Не указано')}\n"
        res += f"📍 **Доставка (СДЭК):**\n"
        res += f"   Страна: {customer.get('country', '-')}\n"
        res += f"   Город: {customer.get('city', '-')}\n"
        res += f"   Пункт: {customer.get('cdek', '-')}\n"
        res += f"📧 **Email:** {customer.get('email', '-')}\n\n"
        
        res += "📦 **Товары:**\n"
        
        for name, info in cart.items():
            if info['count'] > 0:
                n = "Ручка Arm" if name == "Handle" else "Эспандер"
                res += f"• {n} x{info['count']}\n"
        
        res += f"\n💰 **Итого к оплате: {total}**"
        await message.answer(res, parse_mode="Markdown")
    except Exception as e:
        await message.answer(f"Ошибка протокола данных: {e}")

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
