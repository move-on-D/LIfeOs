require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'lifeos-super-secret-key-2026';

// Enable CORS and JSON payload handling (up to 50MB for file uploads)
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Paths
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(__dirname, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'db.json');

// Ensure directories exist
if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(UPLOADS_DIR)) fs.mkdirSync(UPLOADS_DIR, { recursive: true });

// Clean Default State - Every user starts fresh, no dummy data
const defaultState = {
  checklist: [],
  metrics: { focus: 0, energy: 0, discipline: 0, happiness: 0 },
  habits: [],
  accounts: [],
  finance: { income: 0, expenses: 0, transactions: [] },
  entertainment: [],
  projects: [],
  subjects: [],
  security: {
    score: 0,
    twoFactorEnabled: false,
    localBackup: false,
    encryptionKeySet: false,
    alerts: []
  },
  reminders: [],
  vaultFiles: [],
  user: {
    name: 'Operator',
    motto: 'Control your digital life, or it will control you.',
    quote: 'Discipline today, Freedom tomorrow.',
    progress: 0
  }
};

const mongoose = require('mongoose');

// Define MongoDB Schema for App State
const AppStateSchema = new mongoose.Schema({
  configId: { type: String, default: 'main' },
  data: Object
});
const AppState = mongoose.model('AppState', AppStateSchema);

let db = defaultState; // In-memory cache

// Connect to MongoDB
if (process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, { family: 4 })
    .then(async () => {
      console.log('✅ Connected to MongoDB Atlas Cloud!');
      // Load state from Cloud
      let doc = await AppState.findOne({ configId: 'main' });
      if (doc) {
        db = { ...defaultState, ...doc.data };
      } else {
        await new AppState({ configId: 'main', data: defaultState }).save();
      }
    })
    .catch(err => console.error('MongoDB connection error:', err));
} else {
  // Fallback to local DB if no URI
  console.log('⚠️ No MONGO_URI found in .env. Falling back to local file storage.');
  try {
    if (fs.existsSync(DB_FILE)) {
      db = { ...defaultState, ...JSON.parse(fs.readFileSync(DB_FILE, 'utf8')) };
    }
  } catch (e) {}
}

// Universal Save Function (Updates Cloud and Local Cache)
function saveDB(dbData) {
  db = dbData; // Update in-memory
  
  if (process.env.MONGO_URI && mongoose.connection.readyState === 1) {
    // Save to Cloud
    AppState.updateOne({ configId: 'main' }, { data: dbData }, { upsert: true }).exec()
      .catch(err => console.error('Cloud Sync Error:', err));
  } else {
    // Save to Local File
    try {
      fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
    } catch (e) {}
  }
}

// --- AUTHENTICATION API ---
app.post('/api/auth/register', async (req, res) => {
  const { username, password } = req.body;
  if (!username || !password) return res.status(400).json({ error: 'Username and password required' });
  
  if (!db.users) db.users = [];
  const userExists = db.users.find(u => u.username === username);
  if (userExists) return res.status(400).json({ error: 'User already exists' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  const newUser = { id: Date.now(), username, password: hashedPassword };
  db.users.push(newUser);
  saveDB(db);

  const token = jwt.sign({ id: newUser.id, username: newUser.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { username: newUser.username } });
});

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  if (!db.users) db.users = [];
  
  const user = db.users.find(u => u.username === username);
  if (!user) return res.status(400).json({ error: 'Invalid credentials' });

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) return res.status(400).json({ error: 'Invalid credentials' });

  const token = jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });
  res.json({ success: true, token, user: { username: user.username } });
});

// Root API Health
app.get('/', (req, res) => {
  res.json({
    message: 'LifeOS V2 Sync Backend is running!',
    system: 'Operational',
    version: 'V2 Sync',
    dbStorage: 'Persistent JSON DB Active',
    user: db.user.name
  });
});

// GET Dashboard Data
app.get('/api/dashboard', (req, res) => {
  db = loadDB();
  res.json({
    user: db.user.name,
    motto: db.user.motto,
    quote: db.user.quote,
    checklist: db.checklist,
    metrics: db.metrics,
    reminders: db.reminders,
    progress: db.user.progress
  });
});

// Toggle Checklist Item
app.post('/api/checklist/toggle', (req, res) => {
  const { id } = req.body;
  db.checklist = db.checklist.map(item =>
    item.id === id ? { ...item, completed: !item.completed } : item
  );
  saveDB(db);
  res.json({ success: true, checklist: db.checklist });
});

// Add Checklist Item
app.post('/api/checklist/add', (req, res) => {
  const { label, tag } = req.body;
  if (!label) return res.status(400).json({ error: 'Label required' });
  const newItem = { id: Date.now(), label, tag: tag || 'General', completed: false };
  if (!db.checklist) db.checklist = [];
  db.checklist.push(newItem);
  saveDB(db);
  res.json({ success: true, checklist: db.checklist });
});

// Delete Checklist Item
app.delete('/api/checklist/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.checklist = db.checklist.filter(i => i.id != id);
  saveDB(db);
  res.json({ success: true, checklist: db.checklist });
});

// Add Reminder
app.post('/api/reminders/add', (req, res) => {
  const { time, title, category } = req.body;
  const newReminder = { id: Date.now(), time: time || '12:00', title: title || 'New Reminder', category: category || 'General', enabled: true };
  if (!db.reminders) db.reminders = [];
  db.reminders.push(newReminder);
  saveDB(db);
  res.json({ success: true, reminders: db.reminders });
});

// Delete Reminder
app.delete('/api/reminders/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.reminders = db.reminders.filter(r => r.id != id);
  saveDB(db);
  res.json({ success: true, reminders: db.reminders });
});

// Toggle Reminder
app.post('/api/reminders/toggle', (req, res) => {
  const { id } = req.body;
  db.reminders = db.reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
  saveDB(db);
  res.json({ success: true, reminders: db.reminders });
});

// Update System Metrics
app.post('/api/metrics', (req, res) => {
  const { focus, energy, discipline, happiness } = req.body;
  db.metrics = {
    focus: focus ?? db.metrics.focus,
    energy: energy ?? db.metrics.energy,
    discipline: discipline ?? db.metrics.discipline,
    happiness: happiness ?? db.metrics.happiness
  };
  saveDB(db);
  res.json({ success: true, metrics: db.metrics });
});

// RESET ALL DATA — Wipe everything back to empty
app.post('/api/reset', (req, res) => {
  db = JSON.parse(JSON.stringify(defaultState)); // Deep clone
  saveDB(db);
  res.json({ success: true, message: 'All data has been reset to empty.' });
});

// --- ACCOUNTS API ---
app.get('/api/accounts', (req, res) => {
  res.json(db.accounts || defaultState.accounts);
});

app.post('/api/accounts/add', (req, res) => {
  const { service, identity, category, recovery, status } = req.body;
  const newAcc = {
    id: Date.now(),
    service: service || 'New Service',
    identity: identity || 'user@email.com',
    category: category || 'General',
    recovery: recovery || 'Protected',
    status: status || 'Secured'
  };
  if (!db.accounts) db.accounts = [];
  db.accounts.push(newAcc);
  saveDB(db);
  res.json({ success: true, accounts: db.accounts });
});

app.put('/api/accounts/edit/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.accounts = db.accounts.map(a => a.id == id ? { ...a, ...req.body } : a);
  saveDB(db);
  res.json({ success: true, accounts: db.accounts });
});

app.delete('/api/accounts/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.accounts = db.accounts.filter(a => a.id != id);
  saveDB(db);
  res.json({ success: true, accounts: db.accounts });
});

// --- FINANCE API ---
app.get('/api/finance', (req, res) => {
  res.json(db.finance || defaultState.finance);
});

app.post('/api/finance/transaction', (req, res) => {
  const { title, category, amount, type } = req.body;
  const parsedAmt = parseFloat(amount) || 0;
  const newTx = {
    id: Date.now(),
    title: title || 'Transaction',
    category: category || 'General',
    amount: parsedAmt,
    type: type || 'expense',
    date: 'Just now'
  };
  if (!db.finance) db.finance = defaultState.finance;
  db.finance.transactions.unshift(newTx);
  if (type === 'income') {
    db.finance.income += parsedAmt;
  } else {
    db.finance.expenses += parsedAmt;
  }
  saveDB(db);
  res.json({ success: true, finance: db.finance });
});

app.delete('/api/finance/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  const tx = db.finance.transactions.find(t => t.id == id);
  if (tx) {
    if (tx.type === 'income') db.finance.income -= tx.amount;
    else db.finance.expenses -= tx.amount;
    db.finance.transactions = db.finance.transactions.filter(t => t.id != id);
    saveDB(db);
  }
  res.json({ success: true, finance: db.finance });
});

// --- ENTERTAINMENT API ---
app.get('/api/entertainment', (req, res) => {
  res.json(db.entertainment || defaultState.entertainment);
});

app.post('/api/entertainment/add', (req, res) => {
  const { title, category, rating, status, image } = req.body;
  const newItem = {
    id: Date.now(),
    title: title || 'Untitled',
    category: category || 'Anime',
    rating: rating || '9.0',
    status: status || 'Watching',
    image: image || '🎬'
  };
  if (!db.entertainment) db.entertainment = [];
  db.entertainment.unshift(newItem);
  saveDB(db);
  res.json({ success: true, entertainment: db.entertainment });
});

app.put('/api/entertainment/edit/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.entertainment = db.entertainment.map(e => e.id == id ? { ...e, ...req.body } : e);
  saveDB(db);
  res.json({ success: true, entertainment: db.entertainment });
});

app.delete('/api/entertainment/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.entertainment = db.entertainment.filter(e => e.id != id);
  saveDB(db);
  res.json({ success: true, entertainment: db.entertainment });
});

// --- PROJECTS API ---
app.get('/api/projects', (req, res) => {
  res.json(db.projects || defaultState.projects);
});

app.post('/api/projects/add', (req, res) => {
  const { name, desc, status, github, deploy, progress } = req.body;
  const newProj = {
    id: Date.now(),
    name: name || 'New Project',
    desc: desc || 'Project description',
    status: status || 'Active',
    github: github || 'https://github.com',
    deploy: deploy || 'Local',
    progress: parseInt(progress) || 50
  };
  if (!db.projects) db.projects = [];
  db.projects.unshift(newProj);
  saveDB(db);
  res.json({ success: true, projects: db.projects });
});

app.put('/api/projects/edit/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.projects = db.projects.map(p => p.id == id ? { ...p, ...req.body } : p);
  saveDB(db);
  res.json({ success: true, projects: db.projects });
});

app.delete('/api/projects/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.projects = db.projects.filter(p => p.id != id);
  saveDB(db);
  res.json({ success: true, projects: db.projects });
});

// --- COLLEGE & STUDY API ---
app.get('/api/college', (req, res) => {
  res.json(db.subjects || defaultState.subjects);
});

app.post('/api/college/add', (req, res) => {
  const { name, code, progress, teacher } = req.body;
  const newSub = {
    id: Date.now(),
    name: name || 'New Subject',
    code: code || 'CS-100',
    progress: parseInt(progress) || 50,
    teacher: teacher || 'Instructor',
    notesCount: 0
  };
  if (!db.subjects) db.subjects = [];
  db.subjects.push(newSub);
  saveDB(db);
  res.json({ success: true, subjects: db.subjects });
});

app.put('/api/college/edit/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.subjects = db.subjects.map(s => s.id == id ? { ...s, ...req.body, progress: parseInt(req.body.progress) || s.progress } : s);
  saveDB(db);
  res.json({ success: true, subjects: db.subjects });
});

app.delete('/api/college/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.subjects = db.subjects.filter(s => s.id != id);
  saveDB(db);
  res.json({ success: true, subjects: db.subjects });
});

// --- HABITS API ---
app.get('/api/habits', (req, res) => {
  res.json(db.habits || defaultState.habits);
});

app.post('/api/habits/add', (req, res) => {
  const { name, category, streak } = req.body;
  const newHabit = { id: Date.now(), name: name || 'New Habit', category: category || 'General', streak: parseInt(streak) || 0, status: 'Active' };
  if (!db.habits) db.habits = [];
  db.habits.push(newHabit);
  saveDB(db);
  res.json({ success: true, habits: db.habits });
});

app.put('/api/habits/edit/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.habits = db.habits.map(h => h.id == id ? { ...h, ...req.body } : h);
  saveDB(db);
  res.json({ success: true, habits: db.habits });
});

app.delete('/api/habits/delete/:id', (req, res) => {
  const id = parseInt(req.params.id) || req.params.id;
  db.habits = db.habits.filter(h => h.id != id);
  saveDB(db);
  res.json({ success: true, habits: db.habits });
});

// --- AI ASSISTANT SMART CHAT API ---
app.post('/api/ai/chat', (req, res) => {
  const { message } = req.body;
  const q = (message || '').toLowerCase();
  let reply = "I am your LifeOS Smart Assistant. I can track your habits, discipline, tasks, and system performance.";

  if (q.includes('quote') || q.includes('motto') || q.includes('inspire')) {
    reply = `"${db.user.quote}" — Keep focusing on your goals, ${db.user.name}`;
  } else if (q.includes('checklist') || q.includes('task') || q.includes('today')) {
    const done = db.checklist.filter(c => c.completed).length;
    reply = `You have completed ${done} out of ${db.checklist.length} daily goals today (${Math.round((done / db.checklist.length) * 100)}%).`;
  } else if (q.includes('status') || q.includes('metric') || q.includes('focus')) {
    reply = `Current System Metrics: Focus ${db.metrics.focus}%, Discipline ${db.metrics.discipline}%, Energy ${db.metrics.energy}%, Happiness ${db.metrics.happiness}%.`;
  } else if (q.includes('finance') || q.includes('money') || q.includes('budget')) {
    const net = db.finance.income - db.finance.expenses;
    reply = `Financial Summary: Income ₹${db.finance.income}, Expenses ₹${db.finance.expenses}, Net Savings ₹${net}.`;
  } else if (q.includes('hi') || q.includes('hello') || q.includes('hey')) {
    reply = `Hello MOVE ON.! System operational and ready. How can I assist your command center today?`;
  } else {
    reply = `Command received: "${message}". Recommendation: Maintain focus on high-priority dev tasks and college studies today.`;
  }

  res.json({ success: true, reply, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) });
});

// GET & ADD Reminders
app.get('/api/reminders', (req, res) => {
  res.json(db.reminders);
});

app.post('/api/reminders/add', (req, res) => {
  const { time, title, category } = req.body;
  const newReminder = {
    id: Date.now(),
    time: time || '12:00',
    title: title || 'New Reminder',
    category: category || 'General',
    enabled: true
  };
  db.reminders.push(newReminder);
  saveDB(db);
  res.json({ success: true, reminders: db.reminders });
});

app.post('/api/reminders/toggle', (req, res) => {
  const { id } = req.body;
  db.reminders = db.reminders.map(r => r.id === id ? { ...r, enabled: !r.enabled } : r);
  saveDB(db);
  res.json({ success: true, reminders: db.reminders });
});

// Documents Vault API (File Upload, List, Download, Delete)
app.get('/api/vault/files', (req, res) => {
  res.json(db.vaultFiles);
});

app.post('/api/vault/upload', (req, res) => {
  const { name, category, fileData } = req.body;
  if (!name || !fileData) {
    return res.status(400).json({ error: 'Filename and content required' });
  }

  const safeFilename = `${Date.now()}_${name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
  const filePath = path.join(UPLOADS_DIR, safeFilename);

  const base64Data = fileData.split(';base64,').pop();
  fs.writeFileSync(filePath, base64Data, { encoding: 'base64' });

  const sizeInMB = (fs.statSync(filePath).size / (1024 * 1024)).toFixed(2) + ' MB';

  const newDoc = {
    id: Date.now(),
    title: name,
    filename: safeFilename,
    category: category || 'General',
    size: sizeInMB,
    date: new Date().toISOString().split('T')[0]
  };

  db.vaultFiles.unshift(newDoc);
  saveDB(db);

  res.json({ success: true, file: newDoc, files: db.vaultFiles });
});

app.get('/api/vault/download/:filename', (req, res) => {
  const filePath = path.join(UPLOADS_DIR, req.params.filename);
  if (fs.existsSync(filePath)) {
    res.download(filePath);
  } else {
    res.status(404).json({ error: 'File not found' });
  }
});

app.delete('/api/vault/delete/:id', (req, res) => {
  const fileId = parseInt(req.params.id);
  const targetFile = db.vaultFiles.find(f => f.id === fileId);
  if (targetFile) {
    const filePath = path.join(UPLOADS_DIR, targetFile.filename);
    if (fs.existsSync(filePath)) {
      try { fs.unlinkSync(filePath); } catch (e) {}
    }
    db.vaultFiles = db.vaultFiles.filter(f => f.id !== fileId);
    saveDB(db);
  }
  res.json({ success: true, files: db.vaultFiles });
});

// Multi-Device Sync Status Endpoint
app.get('/api/sync/status', (req, res) => {
  res.json({
    synced: true,
    lastSync: new Date().toISOString(),
    devicesConnected: 2,
    activeUser: db.user.name
  });
});

app.listen(PORT, () => {
  console.log(`⚡ LifeOS V2 Sync backend running on http://localhost:${PORT}`);
});