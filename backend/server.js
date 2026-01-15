require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Sequelize, DataTypes } = require('sequelize');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const OpenAI = require('openai');

const app = express();
app.use(cors({ origin: 'http://localhost:3000' }));
app.use(express.json({ limit: '10mb' }));
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Invalid JSON' });
  }
  next();
});
app.use(express.json());

// ✅ FIXED: Import DataTypes and use correct syntax
const sequelize = new Sequelize(process.env.DB_URL);

const db = {};

// ✅ CORRECT MODEL DEFINITIONS
db.User = sequelize.define('User', {
  email: { 
    type: DataTypes.STRING, 
    unique: true, 
    allowNull: false 
  },
  password: { 
    type: DataTypes.STRING, 
    allowNull: false 
  }
});

db.Project = sequelize.define('Project', {
  name: { 
    type: DataTypes.STRING, 
    allowNull: false 
  },
  prompts: { 
    type: DataTypes.ARRAY(DataTypes.TEXT), 
    defaultValue: [] 
  }
});

db.ChatMessage = sequelize.define('ChatMessage', {
  role: { 
    type: DataTypes.ENUM('user', 'assistant'), 
    allowNull: false 
  },
  content: { 
    type: DataTypes.TEXT, 
    allowNull: false 
  }
});

// Relationships
db.User.hasMany(db.Project, { foreignKey: 'userId' });
db.Project.belongsTo(db.User, { foreignKey: 'userId' });
db.Project.hasMany(db.ChatMessage, { foreignKey: 'projectId' });
db.ChatMessage.belongsTo(db.Project, { foreignKey: 'projectId' });

// Create tables automatically
sequelize.sync({ force: false }).then(() => {
  console.log('✅ Database ready - Tables created!');
});

// JWT Auth middleware
const auth = (req, res, next) => {
  const token = req.header('Authorization')?.replace('Bearer ', '');
  if (!token) return res.status(401).json({ error: 'No token' });
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.status(401).json({ error: 'Invalid token' });
    req.user = user;
    next();
  });
};

// OpenRouter AI
const openai = new OpenAI({
  apiKey: process.env.OPENROUTER_API_KEY,
  baseURL: 'https://openrouter.ai/api/v1'
});

// === ROUTES ===
// Register
app.post('/api/auth/register', async (req, res) => {
  try {
    const hashed = await bcrypt.hash(req.body.password, 10);
    const user = await db.User.create({ 
      email: req.body.email, 
      password: hashed 
    });
    const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
    res.json({ token, user: { id: user.id, email: user.email } });
  } catch (err) {
    res.status(400).json({ error: 'Email already exists' });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const user = await db.User.findOne({ where: { email: req.body.email } });
    if (user && await bcrypt.compare(req.body.password, user.password)) {
      const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET);
      res.json({ token, user: { id: user.id, email: user.email } });
    } else {
      res.status(401).json({ error: 'Wrong credentials' });
    }
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Projects (protected)
app.use('/api/projects', auth);
app.get('/api/projects', async (req, res) => {
  const projects = await db.Project.findAll({ where: { userId: req.user.id } });
  res.json(projects);
});

app.post('/api/projects', async (req, res) => {
  const project = await db.Project.create({
    name: req.body.name,
    prompts: req.body.prompts || [],
    userId: req.user.id
  });
  res.json(project);
});

app.post('/api/chat/:projectId', auth, async (req, res) => {
  try {
    const project = await db.Project.findOne({ 
      where: { id: req.params.projectId, userId: req.user.id } 
    });
    
    if (!project) return res.status(404).json({ error: 'Project not found' });

    await db.ChatMessage.create({
      role: 'user',
      content: req.body.message,
      projectId: project.id
    });

    const systemPrompt = project.prompts.join('\n') || 'You are a helpful assistant.';
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-2024-05-13',  // ✅ CHEAPEST + FREE
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: req.body.message }
      ],
      max_tokens: 800,        // ✅ Fits your 1333 limit
      temperature: 0.7
    });

    const aiResponse = completion.choices[0].message.content;
    await db.ChatMessage.create({
      role: 'assistant',
      content: aiResponse,
      projectId: project.id
    });

    res.json({ response: aiResponse });
  } catch (err) {
    console.error('Chat error:', err.message);
    res.status(500).json({ error: err.message });
  }
});


app.get('/api/chat/:projectId/history', auth, async (req, res) => {
  const messages = await db.ChatMessage.findAll({
    where: { projectId: req.params.projectId },
    order: [['createdAt', 'ASC']]
  });
  res.json(messages);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
