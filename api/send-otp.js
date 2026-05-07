import nodemailer from 'nodemailer';

const GMAIL_USER = 'muroddadaboev07@gmail.com';
const GMAIL_APP_PASS = 'fjzxvrjzoigzffjq';

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS
  }
});

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({ error: 'Email va OTP kerak.' });
    }

    await transporter.sendMail({
      from: `"AI Kurslar" <${GMAIL_USER}>`,
      to: email,
      subject: '🔐 Tasdiqlash kodi — AI Kurslar',
      html: `
        <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #0f0f1a; border-radius: 20px; border: 1px solid #1e1e3f; color: #fff;">
          <h1 style="font-size: 24px; margin: 0 0 8px 0; color: #fff;">🔐 Tasdiqlash kodi</h1>
          <p style="color: #a0a0c0; font-size: 15px; margin: 0 0 32px 0;">AI Kurslar platformasiga kirish uchun quyidagi kodni ishlating:</p>
          <div style="background: #1a1a2e; border: 2px solid #5a6bfa; border-radius: 16px; padding: 28px; text-align: center; margin-bottom: 24px;">
            <span style="font-size: 44px; font-weight: 900; letter-spacing: 14px; color: #5a6bfa;">${otp}</span>
          </div>
          <p style="color: #a0a0c0; font-size: 13px; margin: 0;">⏱ Kod <strong style="color: #fff;">5 daqiqa</strong> ichida amal qiladi.</p>
          <p style="color: #a0a0c0; font-size: 13px; margin: 8px 0 0 0;">Agar siz bu so'rovni yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring.</p>
          <hr style="border: none; border-top: 1px solid #1e1e3f; margin: 24px 0;" />
          <p style="color: #666; font-size: 12px; margin: 0;">© AI Kurslar — murod.dev</p>
        </div>
      `
    });

    return res.status(200).json({ success: true });
  } catch (err) {
    console.error('[Email OTP Error]', err.message);
    let userMessage = 'Email yuborishda xatolik yuz berdi.';
    
    if (err.message.includes('511') || err.message.includes('chkuser') || err.message.includes('Recipient address rejected')) {
      userMessage = 'Bunday email manzili mavjud emas. Iltimos, tekshirib qaytadan yozing.';
    } else if (err.message.includes('Limit exceeded')) {
      userMessage = 'Xabar yuborish limiti tugadi. Birozdan so\'ng urinib ko\'ring.';
    }

    return res.status(500).json({ error: userMessage });
  }
}
