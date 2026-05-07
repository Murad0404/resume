// OTP Service — Email (Gmail SMTP via local API) & Telegram OTP
const BOT_TOKEN = '8697069079:AAHKkQ6FDAQ4q5hSx6UKoCUmoQjvPZl5d74';
const BOT_USERNAME = 'murod_yordambot';
const OTP_TTL = 5 * 60 * 1000; // 5 minutes
const SESSION_TTL = 6 * 30 * 24 * 60 * 60 * 1000; // 6 months in milliseconds

export const otpService = {
  generateOTP() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  },

  storeOTP(contact, otp) {
    localStorage.setItem(`otp_${contact}`, JSON.stringify({
      code: otp,
      expires: Date.now() + OTP_TTL
    }));
  },

  verifyOTP(contact, enteredCode) {
    const stored = localStorage.getItem(`otp_${contact}`);
    if (!stored) return false;
    const { code, expires } = JSON.parse(stored);
    if (Date.now() > expires) {
      localStorage.removeItem(`otp_${contact}`);
      return false;
    }
    return code === enteredCode;
  },

  clearOTP(contact) {
    localStorage.removeItem(`otp_${contact}`);
  },

  saveSession(contact, name = '') {
    const session = { contact, name, loginTime: Date.now() };
    localStorage.setItem('user_session', JSON.stringify(session));
    this.registerUser(contact, name); // Save to registered users list
  },

  getSession() {
    const s = localStorage.getItem('user_session');
    if (!s) return null;
    const session = JSON.parse(s);
    if (Date.now() - session.loginTime > SESSION_TTL) {
      this.clearSession(); // Expired after 6 months
      return null;
    }
    return session;
  },

  clearSession() {
    localStorage.removeItem('user_session');
  },

  getRegisteredUsers() {
    const users = localStorage.getItem('registered_users');
    return users ? JSON.parse(users) : {};
  },

  registerUser(contact, name) {
    const users = this.getRegisteredUsers();
    if (name) {
      users[contact] = name;
      localStorage.setItem('registered_users', JSON.stringify(users));
    }
  },

  getUserName(contact) {
    const users = this.getRegisteredUsers();
    return users[contact] || '';
  },

  // ── EMAIL OTP ──────────────────────────────────────────────────────────────
  // Sends OTP via Gmail SMTP through the local Vite dev server middleware
  async sendEmailOTP(email) {
    const otp = this.generateOTP();

    try {
      const res = await fetch('/api/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp })
      });

      const data = await res.json();

      if (res.ok && data.success) {
        this.storeOTP(email, otp);
        return { success: true };
      }

      return { success: false, error: data.error || 'Email yuborishda xatolik.' };
    } catch {
      return { success: false, error: 'Tarmoq xatosi. Serverni tekshiring.' };
    }
  },

  // Helper to find chat_id by username from recent updates
  async resolveChatId(username) {
    const cleanUsername = username.startsWith('@') ? username.slice(1).toLowerCase() : username.toLowerCase();
    
    try {
      const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/getUpdates?limit=100`);
      const data = await res.json();
      
      if (data.ok && data.result) {
        // Search from most recent to oldest
        for (let i = data.result.length - 1; i >= 0; i--) {
          const update = data.result[i];
          const msg = update.message || update.edited_message || update.callback_query?.message;
          if (msg && msg.from && msg.from.username && msg.from.username.toLowerCase() === cleanUsername) {
            return msg.from.id;
          }
        }
      }
    } catch (err) {
      console.error('Telegram updates error:', err);
    }
    return null;
  },

  // ── TELEGRAM OTP ───────────────────────────────────────────────────────────
  // Foydalanuvchi avval @murod_yordambot ga /start yuborishi shart
  async sendTelegramOTP(username) {
    const otp = this.generateOTP();
    const cleanUsername = username.startsWith('@') ? username.slice(1) : username;

    try {
      // 1. Try to find chat_id from recent updates
      let chatId = await this.resolveChatId(cleanUsername);

      // 2. Fallback: try getChat (only works if user is in a group/channel with the bot, or public)
      if (!chatId) {
        const chatRes = await fetch(
          `https://api.telegram.org/bot${BOT_TOKEN}/getChat?chat_id=@${cleanUsername}`
        );
        const chatData = await chatRes.json();
        if (chatData.ok) {
          chatId = chatData.result.id;
        }
      }

      if (!chatId) {
        return {
          success: false,
          error: `@${cleanUsername} topilmadi. Avval Telegram da @${BOT_USERNAME} ga biror xabar (masalan /start) yuboring, so'ng qayta urinib ko'ring.`
        };
      }

      // 3. Send OTP message
      const msgRes = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: [
            `🔐 *AI Kurslar* — Tasdiqlash kodi`,
            ``,
            `Sizning kodingiz: *${otp}*`,
            ``,
            `⏱ Kod 5 daqiqa ichida amal qiladi.`,
            `🚫 Agar siz so'rovni yubormagan bo'lsangiz, e'tiborsiz qoldiring.`
          ].join('\n'),
          parse_mode: 'Markdown'
        })
      });

      const msgData = await msgRes.json();

      if (!msgData.ok) {
        return { success: false, error: `Telegram xabar yuborib bo'lmadi: ${msgData.description || 'Noma\'lum xatolik'}` };
      }

      this.storeOTP(`@${cleanUsername}`, otp);
      return { success: true };
    } catch (err) {
      console.error('Telegram send error:', err);
      return { success: false, error: 'Tarmoq xatosi. Internetni tekshiring.' };
    }
  }
};
