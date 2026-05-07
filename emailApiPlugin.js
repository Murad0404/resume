// Vite server middleware plugin — handles /api/send-otp in dev mode
// In production (Vercel), use api/send-otp.js serverless function instead.
import nodemailer from 'nodemailer';

const GMAIL_USER = 'muroddadaboev07@gmail.com';
const GMAIL_APP_PASS = 'fjzxvrjzoigzffjq'; // App password without spaces

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: GMAIL_USER,
    pass: GMAIL_APP_PASS
  }
});

export function emailApiPlugin() {
  return {
    name: 'email-api',
    configureServer(server) {
      server.middlewares.use('/api/send-otp', async (req, res) => {
        if (req.method !== 'POST') {
          res.writeHead(405);
          res.end('Method Not Allowed');
          return;
        }

        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', async () => {
          try {
            const { email, otp } = JSON.parse(body);

            if (!email || !otp) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ error: 'Email va OTP kerak.' }));
              return;
            }

            await transporter.sendMail({
              from: `"AI Kurslar" <${GMAIL_USER}>`,
              to: email,
              subject: '🔐 Tasdiqlash kodi — AI Kurslar',
              html: `
                <div style="font-family: 'Inter', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 32px; background: #0f0f1a; border-radius: 20px; border: 1px solid #1e1e3f; color: #fff;">
                  <h1 style="font-size: 24px; margin: 0 0 8px 0;">🔐 Tasdiqlash kodi</h1>
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

            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: true }));
          } catch (err) {
            console.error('[Email OTP Error]', err.message);
            let userMessage = 'Email yuborishda xatolik yuz berdi.';
            
            if (err.message.includes('511') || err.message.includes('chkuser')) {
              userMessage = 'Bunday email manzili mavjud emas. Iltimos, tekshirib qaytadan yozing.';
            } else if (err.message.includes('Limit exceeded')) {
              userMessage = 'Xabar yuborish limiti tugadi. Birozdan so\'ng urinib ko\'ring.';
            }

            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: userMessage }));
          }
        });
      });
    }
  };
}
