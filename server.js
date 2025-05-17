// Node.js backend for Telegram Mini App user sync (Express)
const express = require('express');
const crypto = require('crypto');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;
const BOT_TOKEN = process.env.BOT_TOKEN || '7741573703:AAG2hV80HH0hBkQFGAdaROna4pw5GEAURj4';

app.use(express.json());
app.use(cors());

// Helper to validate initData from Telegram (see https://core.telegram.org/bots/webapps#validating-data-received-via-the-web-app)
function checkTelegramAuth(initData, botToken) {
  const urlSearchParams = new URLSearchParams(initData);
  const data = [];
  let hash = '';
  for (const [key, value] of urlSearchParams) {
    if (key === 'hash') {
      hash = value;
    } else {
      data.push(`${key}=${value}`);
    }
  }
  data.sort();
  const dataCheckString = data.join('\n');
  const secret = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();
  const computedHash = crypto.createHmac('sha256', secret).update(dataCheckString).digest('hex');
  return computedHash === hash;
}

// API endpoint to get Telegram user info securely
app.post('/api/telegram_user', async (req, res) => {
  const { initData } = req.body;
  if (!initData) {
    return res.status(400).json({ error: 'Missing initData' });
  }
  // Validate initData
  if (!checkTelegramAuth(initData, BOT_TOKEN)) {
    return res.status(401).json({ error: 'Invalid Telegram auth' });
  }
  // Parse user info from initData
  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  let user = null;
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    return res.status(400).json({ error: 'Invalid user data' });
  }
  // Get avatar (profile photo) from Telegram API
  let avatar = '';
  try {
    const resp = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getUserProfilePhotos?user_id=${user.id}&limit=1`);
    if (resp.data.ok && resp.data.result.total_count > 0) {
      const file_id = resp.data.result.photos[0][0].file_id;
      const fileInfo = await axios.get(`https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${file_id}`);
      const file_path = fileInfo.data.result.file_path;
      avatar = `https://api.telegram.org/file/bot${BOT_TOKEN}/${file_path}`;
    }
  } catch (e) {
    avatar = '';
  }
  res.json({
    id: user.id,
    username: user.username,
    first_name: user.first_name,
    last_name: user.last_name,
    avatar: avatar || user.photo_url || '',
  });
});

// Serve React build (static files)
const path = require('path');
app.use(express.static(path.join(__dirname, 'build')));
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
