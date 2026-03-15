import json
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command

# ТВОИ ДАННЫЕ
TOKEN = '8677453235:AAG3NhS-yeH6oHZ4VXsTWKygXO9DqVD4l-k'
WEB_APP_URL = 'https://ol-wg.github.io/mithril-shop/'

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def start_cmd(message: types.Message):
    # Кнопка для открытия магазина
    kb = [
        [types.InlineKeyboardButton(text="Открыть MithrilARM 🛒", web_app=types.WebAppInfo(url=WEB_APP_URL))]
    ]
    await message.answer(
        "Привет! Нажми на кнопку, чтобы зайти в магазин.",
        reply_markup=types.InlineKeyboardMarkup(inline_keyboard=kb)
    )

# ЭТОТ ХЕНДЛЕР СЛУШАЕТ ДАННЫЕ ИЗ МИНИ-АППА
@dp.message(F.web_app_data)
async def web_app_data_receive(message: types.Message):
    # Парсим JSON, который пришел из tg.sendData()
    data = json.loads(message.web_app_data.data)
    user = data['user']
    
    report = (
        f"📦 **НОВЫЙ ЗАКАЗ**\n\n"
        f"👤 Клиент: {user['fio']}\n"
        f"📞 Телефон: {user['phone']}\n"
        f"📍 Адрес: {user['city']}, {user['address']}\n"
        f"📧 Email: {user['email']}\n"
        f"--------------------------\n"
        f"💰 **ИТОГО: {data['total']}**"
    )
    
    await message.answer(report, parse_mode="Markdown")

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    try:
        asyncio.run(main())
    except KeyboardInterrupt:
        print("Бот выключен")
