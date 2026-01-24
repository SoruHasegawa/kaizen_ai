
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
        {
          role: 'system', content: `あなたは店舗運営コンサルタントです。
アルバイトの意見を、店長向けの建設的な提案書に変換してください。

【構成】
1. 【改善ポイントの要約】：冒頭に1〜3つの箇条書き
2. 【提案の詳細】：現状の課題、改善メリット、具体的アクション案

【制約】
- 感情的な言葉は運営リスク（離職・ミス等）に変換すること。
- トーンは丁寧かつ協力的（〜と考えております等）にすること。
- 店舗利益や効率向上に結びつけること。
- 出力される文章は100文字以内であること。` },
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