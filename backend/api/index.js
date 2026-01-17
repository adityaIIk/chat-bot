require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');
const { sql } = require('@vercel/postgres');

const app = express();

/* -------------------- CORS -------------------- */

const allowedOrigins = [
  'https://chatbot-frontend-kappa-ten.vercel.app',
  'https://chatbot-frontend-jboxkct2q-aditya-aryans-projects-f3606139.vercel.app',
  'http://localhost:3000'
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) return callback(null, true);
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));

/* -------------------- OPENAI -------------------- */

const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

/* -------------------- DB INIT -------------------- */

let dbReady = false;

async function initDatabase() {
  if (dbReady) return;

  await sql`
    CREATE TABLE IF NOT EXISTS "Users" (
      id SERIAL PRIMARY KEY,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "Projects" (
      id SERIAL PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      prompts TEXT[] DEFAULT '{}',
      "userId" INTEGER NOT NULL REFERENCES "Users"(id),
      "createdAt" TIMESTAMP DEFAULT NOW(),
      "updatedAt" TIMESTAMP DEFAULT NOW()
    );
  `;

  await sql`
    CREATE TABLE IF NOT EXISTS "ChatMessages" (
      id SERIAL PRIMARY KEY,
      role VARCHAR(50) CHECK (role IN ('user', 'assistant')),
      content TEXT NOT NULL,
      "projectId" INTEGER REFERENCES "Projects"(id),
      "createdAt" TIMESTAMP DEFAULT NOW()
    );
  `;

  dbReady = true;
}

/* -------------------- AUTH -------------------- */

function auth(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
}

/* -------------------- ROUTES -------------------- */

app.get('/', async (req, res) => {
  await initDatabase();
  res.json({ status: 'Backend running ✅' });
});

/* ---------- AUTH ---------- */

app.post('/api/auth/register', async (req, res) => {
  try {
    await initDatabase();

    const hashed = await bcrypt.hash(req.body.password, 10);

    const result = await sql`
      INSERT INTO "Users" (email, password)
      VALUES (${req.body.email}, ${hashed})
      RETURNING id, email;
    `;

    const token = jwt.sign({ id: result.rows[0].id }, process.env.JWT_SECRET);
    res.json({ token, user: result.rows[0] });

  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    await initDatabase();

    const result = await sql`
      SELECT * FROM "Users" WHERE email=${req.body.email};
    `;

    const user = result.rows[0];

    if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
      return res.status(401).json({ error: 'Wrong credentials' });
    }

    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ---------- PROJECTS ---------- */

app.get('/api/projects', auth, async (req, res) => {
  await initDatabase();

  const result = await sql`
    SELECT * FROM "Projects"
    WHERE "userId"=${req.user.id}
    ORDER BY "createdAt" DESC;
  `;

  res.json(result.rows);
});

app.post('/api/projects', auth, async (req, res) => {
  await initDatabase();

  const result = await sql`
    INSERT INTO "Projects" (name, "userId")
    VALUES (${req.body.name}, ${req.user.id})
    RETURNING *;
  `;

  res.json(result.rows[0]);
});

/* ---------- CHAT HISTORY ---------- */

app.get('/api/chat/:projectId/history', auth, async (req, res) => {
  await initDatabase();

  const messages = await sql`
    SELECT role, content
    FROM "ChatMessages"
    WHERE "projectId"=${req.params.projectId}
    ORDER BY "createdAt" ASC;
  `;

  res.json(messages.rows);
});

/* ---------- CHAT SEND (NO RATE LIMITER) ---------- */

app.post('/api/chat/:projectId', auth, async (req, res) => {
  await initDatabase();

  const { projectId } = req.params;
  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  try {
    // Save user message
    await sql`
      INSERT INTO "ChatMessages" (role, content, "projectId")
      VALUES ('user', ${message}, ${projectId});
    `;

    // Fetch history
    const historyResult = await sql`
      SELECT role, content
      FROM "ChatMessages"
      WHERE "projectId"=${projectId}
      ORDER BY "createdAt" ASC;
    `;

    const limitedHistory = historyResult.rows.slice(-10);

    // OpenAI call (YOUR REQUESTED LOGIC)
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-05-13',
      messages: limitedHistory,
      max_tokens: 800,
      temperature: 0.7
    });

    const reply = completion.choices[0].message.content;

    // Save assistant reply
    await sql`
      INSERT INTO "ChatMessages" (role, content, "projectId")
      VALUES ('assistant', ${reply}, ${projectId});
    `;

    res.json({ reply });

  } catch (err) {
    console.error('OpenAI Error:', err.message);
    res.status(500).json({ error: err.message });
  }
});

/* -------------------- EXPORT FOR VERCEL -------------------- */

module.exports = app;
