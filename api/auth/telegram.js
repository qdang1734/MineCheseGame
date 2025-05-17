// Vercel Serverless Function: /api/auth/telegram.js
const { MongoClient } = require('mongodb');
const crypto = require('crypto');

const MONGODB_URI = 'mongodb+srv://mtykp1:19102004Ab.@cluster0.7eu4ig9.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
const DB_NAME = 'mine_chese_game'; // You can change this to your preferred DB name
const BOT_TOKEN = '7741573703:AAG2hV80HH0hBkQFGAdaROna4pw5GEAURj4';

let cachedClient = null;

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

async function connectToDatabase() {
  if (cachedClient) return cachedClient;
  const client = new MongoClient(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  await client.connect();
  cachedClient = client;
  return client;
}

module.exports = async (req, res) => {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { initData } = req.body;
  if (!initData) {
    res.status(400).json({ error: 'Missing initData' });
    return;
  }
  // Validate Telegram initData
  if (!checkTelegramAuth(initData, BOT_TOKEN)) {
    res.status(401).json({ error: 'Invalid Telegram auth' });
    return;
  }
  // Parse user info from initData
  const params = new URLSearchParams(initData);
  const userJson = params.get('user');
  let user = null;
  try {
    user = JSON.parse(userJson);
  } catch (e) {
    res.status(400).json({ error: 'Invalid user data' });
    return;
  }
  // Connect to MongoDB
  let client;
  try {
    client = await connectToDatabase();
    const db = client.db(DB_NAME);
    const users = db.collection('users');
    // Upsert user info
    const update = {
      $set: {
        telegram_id: user.id,
        username: user.username,
        first_name: user.first_name,
        last_name: user.last_name,
        avatar: user.photo_url || '',
        updated_at: new Date(),
      },
      $setOnInsert: {
        created_at: new Date(),
        ton_wallet: '', // Placeholder, to be updated when user links wallet
        game_data: {},  // Placeholder for game data
      }
    };
    await users.updateOne({ telegram_id: user.id }, update, { upsert: true });
    // Get user data after upsert
    const userData = await users.findOne({ telegram_id: user.id });
    res.status(200).json({
      id: user.id,
      username: user.username,
      first_name: user.first_name,
      last_name: user.last_name,
      avatar: user.photo_url || '',
      ton_wallet: userData.ton_wallet || '',
      game_data: userData.game_data || {},
    });
  } catch (e) {
    res.status(500).json({ error: 'Database error', detail: e.message });
  }
};
