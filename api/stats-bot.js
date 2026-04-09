/**
 * Telegram Bot Statistics Backend (Vercel/Netlify Function)
 * 
 * Bu skript Telegram botingizdan kelgan buyruqlarni qayta ishlaydi.
 * Supabase bazasidan kunlik, haftalik, oylik va yillik statistikani oladi.
 */

import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY // Backend uchun Service Role Key ishlatiladi
);

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;

// ADMIN_CHAT_ID - faqat sizga javob berishi uchun (BotFather'dan yoki getID botlaridan olish mumkin)
const ADMIN_CHAT_ID = 635476813; 

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).send('Method Not Allowed');

  const { message } = req.body;
  if (!message || !message.text) return res.status(200).send('OK');

  const chatId = message.chat.id;
  const text = message.text.toLowerCase();

  // Faqat adminga ruxsat beramiz
  if (chatId !== ADMIN_CHAT_ID) {
    await sendTelegramMessage(chatId, "Kechirasiz, ushbu bot faqat admin uchun.");
    return res.status(200).send('OK');
  }

  if (text === '/start') {
    await sendTelegramMessage(chatId, "👋 Salom Murod! Men saytingiz statistikasi botiman.\n\nHisobotlarni ko'rish uchun /stats buyrug'ini yozing.");
  } else if (text === '/help') {
    await sendTelegramMessage(chatId, "📌 **Buyruqlar:**\n\n/stats - Barcha statistikani ko'rish\n/start - Botni ishga tushirish\n/help - Yordam");
  } else if (text === '/stats' || text === 'statistika' || text === 'stats') {
    try {
      const now = new Date();
      
      // 1. Kunlik (Bugun 00:00 dan boshlab)
      const todayStart = new Date(now.setHours(0,0,0,0)).toISOString();
      const { count: daily } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', todayStart);

      // 2. Haftalik (Oxirgi 7 kun)
      const weekAgo = new Date(new Date().setDate(now.getDate() - 7)).toISOString();
      const { count: weekly } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', weekAgo);

      // 3. Oylik (Shu oy boshi)
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const { count: monthly } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart);

      // 4. Yillik (Shu yil boshi)
      const yearStart = new Date(now.getFullYear(), 0, 1).toISOString();
      const { count: yearly } = await supabase
        .from('visits')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', yearStart);

      const responseText = `
📊 **Sayt Statistikasi (murod.site)**

📅 **Bugun:** ${daily || 0} ta tashrif
📅 **Oxirgi 7 kunda:** ${weekly || 0} ta tashrif
📅 **Shu oyda:** ${monthly || 0} ta tashrif
📅 **Shu yilda:** ${yearly || 0} ta tashrif

🚀 Olg'a, Murod! Saytingiz rivojlanmoqda!
      `;

      await sendTelegramMessage(chatId, responseText);

    } catch (err) {
      console.error('Stats fetch error:', err);
      await sendTelegramMessage(chatId, "❌ Xatolik yuz berdi: " + err.message);
    }
  }

  res.status(200).send('OK');
}

async function sendTelegramMessage(chatId, text) {
  try {
    await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: text,
        parse_mode: 'Markdown'
      })
    });
  } catch (err) {
    console.error('Telegram send error:', err);
  }
}
