require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lifeos-super-secret-key-2026';

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Clean Default State for New Users
const defaultState = {
  checklist: [],
  metrics: { focus: 0, energy: 0, discipline: 0, happiness: 0 },
  habits: [],
  accounts: [],
  finance: { income: 0, expenses: 0, transactions: [] },
  entertainment: [],
  projects: [],
  subjects: [],
  security: { score: 100, twoFactorEnabled: true, localBackup: true, encryptionKeySet: true, alerts: [] },
  reminders: [],
  vaultFiles: [],
  user: { name: 'Operator', motto: 'Control your digital life, or it will control you.', quote: 'Discipline today, Freedom tomorrow.', progress: 0 }
};

// MongoDB Schemas
const UserSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});
const User = mongoose.model('User', UserSchema);

const AppStateSchema = new mongoose.Schema({
  configId: { type: String, required: true, unique: true },
  data: Object
});
const AppState = mongoose.model('AppState', AppStateSchema);

if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(() => console.log('✅ Connected to MongoDB Atlas Cloud! Multi-tenant isolated storage active.'))
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  console.log('⚠️ No MONGO_URI found in .env. Falling back to local file storage per user.');
}

// User-Isolated DB Load & Save
async function getUserDB(username) {
  if (!username) return JSON.parse(JSON.stringify(defaultState));
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    let doc = await AppState.findOne({ configId: username });
    if (doc && doc.data) {
      return { ...defaultState, ...doc.data };
    } else {
      const freshData = JSON.parse(JSON.stringify(defaultState));
      freshData.user.name = username;
      await new AppState({ configId: username, data: freshData }).save();
      return freshData;
    }
  } else {
    const userFile = path.join(DATA_DIR, `db_${username}.json`);
    if (fs.existsSync(userFile)) {
      try { return { ...defaultState, ...JSON.parse(fs.readFileSync(userFile, 'utf8')) }; } catch (e) {}
    }
    const freshData = JSON.parse(JSON.stringify(defaultState));
    freshData.user.name = username;
    fs.writeFileSync(userFile, JSON.stringify(freshData, null, 2), 'utf8');
    return freshData;
  }
}

async function saveUserDB(username, dbData) {
  if (!username) return;
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    await AppState.updateOne({ configId: username }, { data: dbData }, { upsert: true }).exec();
  } else {
    const userFile = path.join(DATA_DIR, `db_${username}.json`);
    fs.writeFileSync(userFile, JSON.stringify(dbData, null, 2), 'utf8');
  }
}

// JWT Auth Middleware
function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;
  let token = null;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    token = authHeader.split(' ')[1];
  } else if (req.query.token) {
    token = req.query.token;
  }

  if (!token) return res.status(401).json({ error: 'Authentication required' });

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid or expired token' });
  }
}

// --- AUTHENTICATION API ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  let userExists = false;
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    const existing = await User.findOne({ username });
    if (existing) userExists = true;
  } else {
    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      if (users.find(u => u.username === username)) userExists = true;
    }
  }

  if (userExists) return res.status(400).json({ error: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    const newUser = new User({ username, password: hashedPassword });
    await newUser.save();
  } else {
    let users = [];
    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
    users.push({ id: Date.now(), username, password: hashedPassword });
    fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
  }

  await getUserDB(username); // Initialize user space
  const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user: { username } });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });

  let user = null;
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    user = await User.findOne({ username });
  } else {
    const usersFile = path.join(DATA_DIR, 'users.json');
    if (fs.existsSync(usersFile)) {
      const users = JSON.parse(fs.readFileSync(usersFile, 'utf8'));
      user = users.find(u => u.username === username);
    }
  }

  if (!user) return res.status(400).json({ error: 'Invalid credentials' });
  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ username: user.username }, JWT_SECRET, { expiresIn: '30d' });
  res.json({ success: true, token, user: { username: user.username } });
});

// Google OAuth Login
app.post('/api/auth/google', async (req, res) => {
  const { credential } = req.body;
  if (!credential) return res.status(400).json({ error: 'No Google credential provided' });

  try {
    const gRes = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${credential}`);
    if (!gRes.ok) return res.status(400).json({ error: 'Invalid Google Token' });

    const gUser = await gRes.json();
    const username = gUser.email ? gUser.email.split('@')[0] : `google_${Date.now()}`;

    let user = null;
    if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
      user = await User.findOne({ username });
      if (!user) {
        user = new User({ username, password: 'GOOGLE_OAUTH_USER' });
        await user.save();
      }
    } else {
      const usersFile = path.join(DATA_DIR, 'users.json');
      let users = fs.existsSync(usersFile) ? JSON.parse(fs.readFileSync(usersFile, 'utf8')) : [];
      user = users.find(u => u.username === username);
      if (!user) {
        user = { id: Date.now(), username, password: 'GOOGLE_OAUTH_USER' };
        users.push(user);
        fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
      }
    }

    await getUserDB(username);
    const token = jwt.sign({ username }, JWT_SECRET, { expiresIn: '30d' });
    res.json({ success: true, token, user: { username } });
  } catch (err) {
    console.error('Google Auth Error:', err);
    res.status(500).json({ error: 'Google login failed' });
  }
});

// Root API Health
app.get('/', (req, res) => {
  res.json({ message: 'LifeOS V2 Isolated Multi-Tenant Backend', status: 'Operational' });
});

// GET Dashboard Data
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json({
    user: db.user.name || req.user.username,
    motto: db.user.motto,
    quote: db.user.quote,
    checklist: db.checklist || [],
    metrics: db.metrics || { focus: 0, energy: 0, discipline: 0, happiness: 0 },
    reminders: db.reminders || [],
    progress: db.user.progress || 0
  });
});

// Toggle Checklist Item
app.post('/api/checklist/toggle', authMiddleware, async (req, res) => {
  const { id } = req.body;
  const db = await getUserDB(req.user.username);
  db.checklist = (db.checklist || []).map(item => item.id === id ? { ...item, completed: !item.completed } : item);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, checklist: db.checklist });
});

// Add Checklist Item
app.post('/api/checklist/add', authMiddleware, async (req, res) => {
  const { label, tag } = req.body;
  if (!label) return res.status(400).json({ error: 'Label required' });
  const db = await getUserDB(req.user.username);
  if (!db.checklist) db.checklist = [];
  db.checklist.push({ id: Date.now(), label, tag: tag || 'General', completed: false });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, checklist: db.checklist });
});

// Delete Checklist Item
app.delete('/api/checklist/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.checklist = (db.checklist || []).filter(i => i.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, checklist: db.checklist });
});

// Reminders
app.post('/api/reminders/add', authMiddleware, async (req, res) => {
  const { time, title, category } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.reminders) db.reminders = [];
  db.reminders.push({ id: Date.now(), time: time || '12:00', title: title || 'New Reminder', category: category || 'General', enabled: true });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, reminders: db.reminders });
});

app.delete('/api/reminders/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.reminders = (db.reminders || []).filter(r => r.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, reminders: db.reminders });
});

app.post('/api/reminders/toggle', authMiddleware, async (req, res) => {
  const { id } = req.body;
  const db = await getUserDB(req.user.username);
  db.reminders = (db.reminders || []).map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, reminders: db.reminders });
});

// Metrics
app.post('/api/metrics', authMiddleware, async (req, res) => {
  const { focus, energy, discipline, happiness } = req.body;
  const db = await getUserDB(req.user.username);
  db.metrics = {
    focus: focus ?? db.metrics.focus,
    energy: energy ?? db.metrics.energy,
    discipline: discipline ?? db.metrics.discipline,
    happiness: happiness ?? db.metrics.happiness
  };
  await saveUserDB(req.user.username, db);
  res.json({ success: true, metrics: db.metrics });
});

// Reset
app.post('/api/reset', authMiddleware, async (req, res) => {
  const fresh = JSON.parse(JSON.stringify(defaultState));
  fresh.user.name = req.user.username;
  await saveUserDB(req.user.username, fresh);
  res.json({ success: true, message: 'Your dashboard data has been reset to empty.' });
});

// Accounts
app.get('/api/accounts', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.accounts || []);
});

app.post('/api/accounts/add', authMiddleware, async (req, res) => {
  const { service, identity, category, recovery, status } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.accounts) db.accounts = [];
  db.accounts.push({ id: Date.now(), service: service || 'New Service', identity: identity || 'user@email.com', category: category || 'General', recovery: recovery || 'Protected', status: status || 'Secured' });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, accounts: db.accounts });
});

app.put('/api/accounts/edit/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.accounts = (db.accounts || []).map(a => a.id == id ? { ...a, ...req.body } : a);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, accounts: db.accounts });
});

app.delete('/api/accounts/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.accounts = (db.accounts || []).filter(a => a.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, accounts: db.accounts });
});

// Finance
app.get('/api/finance', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.finance || defaultState.finance);
});

app.post('/api/finance/transaction', authMiddleware, async (req, res) => {
  const { title, category, amount, type } = req.body;
  const parsedAmt = parseFloat(amount) || 0;
  const db = await getUserDB(req.user.username);
  if (!db.finance) db.finance = JSON.parse(JSON.stringify(defaultState.finance));
  if (!db.finance.transactions) db.finance.transactions = [];
  db.finance.transactions.unshift({ id: Date.now(), title: title || 'Transaction', category: category || 'General', amount: parsedAmt, type: type || 'expense', date: 'Today' });
  if (type === 'income') db.finance.income += parsedAmt; else db.finance.expenses += parsedAmt;
  await saveUserDB(req.user.username, db);
  res.json({ success: true, finance: db.finance });
});

app.delete('/api/finance/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  if (db.finance && db.finance.transactions) {
    const tx = db.finance.transactions.find(t => t.id == id);
    if (tx) {
      if (tx.type === 'income') db.finance.income -= tx.amount; else db.finance.expenses -= tx.amount;
      db.finance.transactions = db.finance.transactions.filter(t => t.id != id);
      await saveUserDB(req.user.username, db);
    }
  }
  res.json({ success: true, finance: db.finance });
});

// Entertainment
app.get('/api/entertainment', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.entertainment || []);
});

app.post('/api/entertainment/add', authMiddleware, async (req, res) => {
  const { title, category, rating, status, image } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.entertainment) db.entertainment = [];
  db.entertainment.unshift({ id: Date.now(), title: title || 'Untitled', category: category || 'Anime', rating: rating || '9.0', status: status || 'Watching', image: image || '🎬' });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, entertainment: db.entertainment });
});

app.put('/api/entertainment/edit/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.entertainment = (db.entertainment || []).map(e => e.id == id ? { ...e, ...req.body } : e);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, entertainment: db.entertainment });
});

app.delete('/api/entertainment/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.entertainment = (db.entertainment || []).filter(e => e.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, entertainment: db.entertainment });
});

// Projects
app.get('/api/projects', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.projects || []);
});

app.post('/api/projects/add', authMiddleware, async (req, res) => {
  const { name, desc, status, github, deploy, progress } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.projects) db.projects = [];
  db.projects.unshift({ id: Date.now(), name: name || 'New Project', desc: desc || 'Description', status: status || 'Active', github: github || 'https://github.com', deploy: deploy || 'Local', progress: parseInt(progress) || 50 });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, projects: db.projects });
});

app.put('/api/projects/edit/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.projects = (db.projects || []).map(p => p.id == id ? { ...p, ...req.body } : p);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, projects: db.projects });
});

app.delete('/api/projects/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.projects = (db.projects || []).filter(p => p.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, projects: db.projects });
});

// College
app.get('/api/college', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.subjects || []);
});

app.post('/api/college/add', authMiddleware, async (req, res) => {
  const { name, code, progress, teacher } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.subjects) db.subjects = [];
  db.subjects.push({ id: Date.now(), name: name || 'New Subject', code: code || 'CS-100', progress: parseInt(progress) || 50, teacher: teacher || 'Instructor', notesCount: 0 });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, subjects: db.subjects });
});

app.put('/api/college/edit/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.subjects = (db.subjects || []).map(s => s.id == id ? { ...s, ...req.body, progress: parseInt(req.body.progress) || s.progress } : s);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, subjects: db.subjects });
});

app.delete('/api/college/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.subjects = (db.subjects || []).filter(s => s.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, subjects: db.subjects });
});

// Habits
app.get('/api/habits', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.habits || []);
});

app.post('/api/habits/add', authMiddleware, async (req, res) => {
  const { name, category, streak } = req.body;
  const db = await getUserDB(req.user.username);
  if (!db.habits) db.habits = [];
  db.habits.push({ id: Date.now(), name: name || 'New Habit', category: category || 'General', streak: parseInt(streak) || 0, status: 'Active' });
  await saveUserDB(req.user.username, db);
  res.json({ success: true, habits: db.habits });
});

app.put('/api/habits/edit/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.habits = (db.habits || []).map(h => h.id == id ? { ...h, ...req.body } : h);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, habits: db.habits });
});

app.delete('/api/habits/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.habits = (db.habits || []).filter(h => h.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, habits: db.habits });
});

// Vault Files
app.get('/api/vault/files', authMiddleware, async (req, res) => {
  const db = await getUserDB(req.user.username);
  res.json(db.vaultFiles || []);
});

app.delete('/api/vault/delete/:id', authMiddleware, async (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const db = await getUserDB(req.user.username);
  db.vaultFiles = (db.vaultFiles || []).filter(f => f.id != id);
  await saveUserDB(req.user.username, db);
  res.json({ success: true, vaultFiles: db.vaultFiles });
});

// AI Chat
app.post('/api/ai/chat', authMiddleware, async (req, res) => {
  const { message } = req.body;
  const db = await getUserDB(req.user.username);
  const q = (message || '').toLowerCase();
  let reply = `Hello ${req.user.username}! I am your LifeOS Smart Assistant.`;

  if (q.includes('quote') || q.includes('motto')) {
    reply = `"${db.user.quote || 'Discipline today, Freedom tomorrow.'}" — Keep focusing on your goals, ${req.user.username}!`;
  } else if (q.includes('checklist') || q.includes('task')) {
    const total = (db.checklist || []).length;
    const done = (db.checklist || []).filter(c => c.completed).length;
    reply = total ? `You have completed ${done} out of ${total} daily tasks.` : `Your checklist is currently empty. Add your first task on the dashboard!`;
  } else if (q.includes('habit') || q.includes('streak')) {
    const totalH = (db.habits || []).length;
    reply = totalH ? `You are currently tracking ${totalH} daily habits.` : `You don't have any active habits. Add some in Goals & Habits!`;
  }

  res.json({ reply });
});

app.listen(PORT, () => {
  console.log(`⚡ LifeOS Multi-Tenant Server running on port ${PORT}`);
});