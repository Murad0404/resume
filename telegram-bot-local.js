/**
 * LOCAL TELEGRAM BOT SCRIPT (Polling Method)
 * 
 * Bu skript webhooksiz ishlaydi. Shunchaki 'node telegram-bot-local.js' deb ishga tushirasiz.
 * U har 2 soniyada Telegram-dan yangi xabarlarni tekshirib turadi.
 */

import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// .env faylidan o'zgaruvchilarni yuklaymiz
dotenv.config();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY; // Backend key
const BOT_TOKEN = "8694533172:AAHtmqh_OxY6o0C-kEv-CEs3K7AkdcsGGXs";
const ADMIN_CHAT_ID = 635476813;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("❌ Xatolik: .env faylida SUPABASE_URL yoki SUPABASE_SERVICE_ROLE_KEY topilmadi.");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

console.log("🚀 Bot ishga tushmoqda... (Polling)");

let lastUpdateId = 0;

async function checkUpdates() {
  try {
    const response = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?offset=${lastUpdateId + 1}&timeout=30`);
    const data = await response.json();

    if (data.ok && data.result.length > 0) {
      for (const update of data.result) {
        lastUpdateId = update.update_id;
        if (update.message) {
          await handleMessage(update.message);
        }
      }
    }
  } catch (err) {
    console.error("⚠️ Ulanishda xatolik:", err.message);
  }
  
  // Keyingi tekshiruv
  setTimeout(checkUpdates, 1000);
}

async function handleMessage(message) {
  const chatId = message.chat.id;
  const text = (message.text || "").toLowerCase();

  // Faqat adminga javob beramiz
  if (chatId !== ADMIN_CHAT_ID) {
    await sendMessage(chatId, "🔒 Kechirasiz, bu bot faqat admin uchun.");
    return;
  }

  if (text === "/start") {
    await sendMessage(chatId, "👋 Salom Murod! Men saytingiz statistikasi botiman.\n\nHisobot ko'rish uchun /stats yozing.");
  } else if (text === "/stats" || text === "statistika") {
    await sendStats(chatId);
  } else {
    await sendMessage(chatId, "❓ Noma'lum buyruq. /stats deb yozib ko'ring.");
  }
}

async function sendStats(chatId) {
  try {
    const now = new Date();
    console.log("📊 Statistika so'raldi, Supabase bilan bog'lanilmoqda...");
    
    // Kunlik
    const todayStart = new Date(now.setHours(0,0,0,0)).toISOString();
    const { count: daily, error: err1 } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', todayStart);
    if (err1) console.error("❌ Kunlik stats xatosi:", err1.message);

    // Haftalik
    const weekAgo = new Date(new Date().setDate(now.getDate() - 7)).toISOString();
    const { count: weekly, error: err2 } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', weekAgo);
    if (err2) console.error("❌ Haftalik stats xatosi:", err2.message);

    // Oylik
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const { count: monthly, error: err3 } = await supabase.from('visits').select('*', { count: 'exact', head: true }).gte('created_at', monthStart);
    if (err3) console.error("❌ Oylik stats xatosi:", err3.message);

    console.log(`✅ Natijalar: Kunlik=${daily}, Haftalik=${weekly}, Oylik=${monthly}`);

    const statsMsg = `
📊 **Sayt Statistikasi**

📅 **Bugun:** ${daily ?? 0} ta tashrif
📅 **Oxirgi 7 kun:** ${weekly ?? 0} ta tashrif
📅 **Shu oyda:** ${monthly ?? 0} ta tashrif

🚀 Olg'a, Murod!
    `;
    await sendMessage(chatId, statsMsg);
  } catch (err) {
    console.error("❌ Kutilmagan xatolik:", err.message);
    await sendMessage(chatId, "❌ Kutilmagan xatolik: " + err.message);
  }
}

async function sendMessage(chatId, text) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "Markdown" })
  });
}

checkUpdates();
