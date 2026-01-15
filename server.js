
require('dotenv').config();
const { OpenAI } = require('openai');
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const express = require('express');
const cors = require('cors');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_FILE = 'opinions.json';

app.use(cors());
app.use(express.json());

function readOpinions() {
  try {
    if (!fs.existsSync(DATA_FILE)) return [];
    const raw = fs.readFileSync(DATA_FILE, 'utf8');
    if (!raw.trim()) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeOpinions(opinions) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(opinions, null, 2));
}

// 従業員側：意見を投稿

app.post('/api/opinions', async (req, res) => {
  // employee.htmlからはopinion、既存APIからはmessageで受け取る
  const message = typeof req.body?.message === 'string'
    ? req.body.message.trim()
    : (typeof req.body?.opinion === 'string' ? req.body.opinion.trim() : '');

  if (!message) {
    return res.status(400).json({ error: 'message is required' });
  }
  if (message.length > 100) {
    return res.status(400).json({ error: 'message must be <= 100 chars' });
  }

  let converted = message;
  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: '文体を丁寧語に変換してください。' },
        { role: 'user', content: message }
      ]
    });
    converted = response.choices[0].message.content;
  } catch (e) {
    // OpenAIエラー時は元のメッセージをそのまま使う
    console.error('OpenAI API error:', e.message);
  }

  const opinions = readOpinions();
  const record = {
    id: Date.now(),
    message: converted,
    createdAt: new Date().toISOString(),
  };

  opinions.push(record);
  writeOpinions(opinions);

  return res.status(201).json({ ok: true, record });
});

// 店舗側：意見一覧を取得
app.get('/api/opinions', (_req, res) => {
  const opinions = readOpinions();
  res.json(opinions);
});

app.listen(PORT, () => {
  console.log(`API server: http://localhost:${PORT}`);
});