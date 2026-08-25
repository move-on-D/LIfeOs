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

// Initial Default State
const defaultState = {
  checklist: [
    { id: 1, label: 'College', completed: true, tag: 'Study' },
    { id: 2, label: 'Code', completed: true, tag: 'Dev' },
    { id: 3, label: 'Workout', completed: false, tag: 'Health' },
    { id: 4, label: 'Read', completed: true, tag: 'Mind' },
    { id: 5, label: 'NoFap', completed: true, tag: 'Focus' },
    { id: 6, label: 'Sleep Early', completed: false, tag: 'Rest' }
  ],
  metrics: {
    focus: 85,
    energy: 62,
    discipline: 90,
    happiness: 70
  },
  habits: [
    { id: 1, name: 'Daily Coding Practice (2 Hours)', streak: 18, category: 'Skills', status: 'Active' },
    { id: 2, name: 'Morning Workout & Gym', streak: 12, category: 'Health', status: 'Active' },
    { id: 3, name: 'Read 20 Pages Daily', streak: 9, category: 'Mindset', status: 'Active' },
    { id: 4, name: 'NoFap & High Focus Mode', streak: 24, category: 'Discipline', status: 'Active' },
    { id: 5, name: 'Sleep Before 11:30 PM', streak: 5, category: 'Recovery', status: 'Active' }
  ],
  accounts: [
    { id: 1, service: 'Google Account', identity: 'moveon.main@gmail.com', category: 'Primary', recovery: '2FA Enabled + Phone', status: 'Secured' },
    { id: 2, service: 'GitHub', identity: '@moveon-dev', category: 'Development', recovery: 'SSH Key + Security Keys', status: 'Secured' },
    { id: 3, service: 'LinkedIn', identity: 'MOVE ON', category: 'Professional', recovery: 'Authenticator App', status: 'Secured' },
    { id: 4, service: 'Vercel', identity: 'moveon-vercel', category: 'Deployment', recovery: 'GitHub OAuth', status: 'Secured' },
    { id: 5, service: 'Discord', identity: 'MOVEON#0001', category: 'Social', recovery: 'Backup Codes Downloaded', status: 'Secured' }
  ],
  finance: {
    income: 15000,
    expenses: 2050,
    transactions: [
      { id: 1, title: 'Server Hosting / Domain', category: 'Tech', amount: 850, type: 'expense', date: 'Today' },
      { id: 2, title: 'College Books & Supplies', category: 'Study', amount: 1200, type: 'expense', date: 'Yesterday' },
      { id: 3, title: 'Freelance Coding Stipend', category: 'Income', amount: 15000, type: 'income', date: 'Aug 10' }
    ]
  },
  entertainment: [
    { id: 1, title: 'Jujutsu Kaisen', category: 'Anime', rating: '9.8', status: 'Watching (Season 2)', image: '🔥' },
    { id: 2, title: 'Demon Slayer', category: 'Anime', rating: '9.5', status: 'Completed', image: '⚔️' },
    { id: 3, title: 'Cyberpunk 2077', category: 'Gaming', rating: '9.9', status: 'Active Play', image: '🎮' },
    { id: 4, title: 'Interstellar', category: 'Movie', rating: '10/10', status: 'Favorite', image: '🚀' }
  ],
  projects: [
    { id: 1, name: 'LifeOS', desc: 'Personal Digital Command Center (React, Express, Tailwind)', status: 'V1/V2 Building', github: 'https://github.com', deploy: 'Local / Vercel', progress: 73 },
    { id: 2, name: 'Portfolio Site', desc: 'Personal Cyberpunk Developer Portfolio', status: 'Completed', github: 'https://github.com', deploy: 'vercel.app', progress: 100 },
    { id: 3, name: 'AI Habit Engine', desc: 'Predictive routines based on user discipline score', status: 'Planning (V3)', github: '#', deploy: 'Internal', progress: 25 }
  ],
  subjects: [
    { id: 1, name: 'Data Structures & Algorithms', code: 'CS-301', progress: 85, teacher: 'Dept. Head', notesCount: 12 },
    { id: 2, name: 'Operating Systems & Architecture', code: 'CS-302', progress: 70, teacher: 'Prof. Sharma', notesCount: 8 },
    { id: 3, name: 'Database Management Systems', code: 'CS-303', progress: 90, teacher: 'Dr. Rao', notesCount: 15 },
    { id: 4, name: 'Web Engineering & Frameworks', code: 'CS-304', progress: 95, teacher: 'Prof. Gupta', notesCount: 20 }
  ],
  security: {
    score: 98,
    twoFactorEnabled: true,
    localBackup: true,
    encryptionKeySet: true,
    alerts: [
      { id: 1, message: 'All master recovery keys safely encrypted locally.', level: 'info' }
    ]
  },
  reminders: [
    { id: 1, time: '08:30', title: 'Morning Gym & Workout', category: 'Health', enabled: true },
    { id: 2, time: '10:00', title: 'College Lectures & Study', category: 'Study', enabled: true },
    { id: 3, time: '16:00', title: '2 Hours Deep Coding Session', category: 'Dev', enabled: true },
    { id: 4, time: '22:30', title: 'Daily Review & Sleep Early', category: 'Rest', enabled: true }
  ],
  vaultFiles: [
    { id: 1, title: 'Degree Certificates & Transcripts.pdf', filename: 'Degree_Certificates.pdf', category: 'Education', size: '2.4 MB', date: '2026-08-12' },
    { id: 2, title: 'National Identity Proof (Aadhaar).pdf', filename: 'ID_Proof.pdf', category: 'Identity', size: '1.1 MB', date: '2026-08-12' }
  ],
  user: {
    name: 'MOVE ON.',
    motto: 'Control your digital life, or it will control you.',
    quote: 'Discipline today, Freedom tomorrow.',
    progress: 88
  }
};

// Load DB from Disk
function loadDB() {
  try {
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      const loaded = JSON.parse(data);
      return { ...defaultState, ...loaded };
    }
  } catch (err) {
    console.error('Error reading DB file:', err);
  }
  saveDB(defaultState);
  return defaultState;
}

// Save DB to Disk
function saveDB(dbData) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(dbData, null, 2), 'utf8');
  } catch (err) {
    console.error('Error writing DB file:', err);
  }
}

let db = loadDB();

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