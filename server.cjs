const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// dist papkasini (production build) statik ravishda taqdim etamiz
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

// Barcha route-larni index.html-ga yo'naltiramiz (React Router uchun kerak)
app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`🚀 Frontend server ishga tushdi: http://localhost:${PORT}`);
});
