import json
import asyncio
from aiogram import Bot, Dispatcher, types, F
from aiogram.filters import Command

# Твои данные
TOKEN = '8677453235:AAG3NhS-yeH6oHZ4VXsTWKygXO9DqVD4l-k'
APP_URL = 'https://ol-wg.github.io/mithril-shop/'

bot = Bot(token=TOKEN)
dp = Dispatcher()

@dp.message(Command("start"))
async def cmd_start(message: types.Message):
    markup = types.InlineKeyboardMarkup(inline_keyboard=[[
        types.InlineKeyboardButton(text="Открыть Магазин 🛒", web_app=types.WebAppInfo(url=APP_URL))
    ]])
    await message.answer("Добро пожаловать в MithrilARM! Нажмите кнопку ниже для заказа:", reply_markup=markup)

@dp.message(F.web_app_data)
async def handle_data(message: types.Message):
    # Получаем и парсим JSON от Mini App
    raw_data = json.loads(message.web_app_data.data)
    user = raw_data['user']
    
    msg_text = (
        f"🚨 **НОВЫЙ ЗАКАЗ**\n\n"
        f"👤 **Покупатель:** {user['fio']}\n"
        f"📞 **Телефон:** {user['phone']}\n"
        f"📍 **Город:** {user['city']}\n"
        f"🏢 **СДЭК:** {user['cdek']}\n"
        f"📧 **Email:** {user['email']}\n\n"
        f"💰 **Сумма к оплате: {raw_data['total']}**"
    )
    
    await message.answer(msg_text, parse_mode="Markdown")

async def main():
    await dp.start_polling(bot)

if __name__ == '__main__':
    asyncio.run(main())
