const nodemailer = require('nodemailer');

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

async function test() {
  try {
    let info = await transporter.sendMail({
      from: `"AI Kurslar" <${GMAIL_USER}>`,
      to: "test@example.com",
      subject: "Test",
      text: "Test"
    });
    console.log("Success:", info.messageId);
  } catch (err) {
    console.error("Error:", err);
  }
}

test();
