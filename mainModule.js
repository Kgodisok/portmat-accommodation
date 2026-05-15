const fs = require('fs');
const path = require('path');
const express = require('express');

const app = express();
const port = process.env.PORT || 2003;
const dataPath = path.join(__dirname, 'accommodationData.json');

app.use(express.json());

// Simple CORS middleware
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.sendStatus(204);
  next();
});

function loadData() {
  try {
    const raw = fs.readFileSync(dataPath, 'utf8');
    return JSON.parse(raw);
  } catch (err) {
    return [];
  }
}

function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf8');
}

let localData = loadData();

app.get('/', (req, res) => {
  res.json({ status: 'ok', endpoints: ['/accommodations'] });
});

// List all accommodations
app.get('/accommodations', (req, res) => {
  res.json(localData);
});

// Get by id
app.get('/accommodations/:id', (req, res) => {
  const id = req.params.id;
  const item = localData.find(a => String(a.id) === String(id));
  if (!item) return res.status(404).json({ error: 'Not found' });
  res.json(item);
});

// Create
app.post('/accommodations', (req, res) => {
  const body = req.body;
  if (!body) return res.status(400).json({ error: 'Missing body' });
  const maxId = localData.reduce((m, i) => (i.id && i.id > m ? i.id : m), 0);
  const newItem = Object.assign({}, body, { id: maxId + 1 });
  localData.push(newItem);
  try {
    saveData(localData);
    res.status(201).json(newItem);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Update
app.put('/accommodations/:id', (req, res) => {
  const id = req.params.id;
  const idx = localData.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  localData[idx] = Object.assign({}, localData[idx], req.body, { id: localData[idx].id });
  try {
    saveData(localData);
    res.json(localData[idx]);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

// Delete
app.delete('/accommodations/:id', (req, res) => {
  const id = req.params.id;
  const idx = localData.findIndex(a => String(a.id) === String(id));
  if (idx === -1) return res.status(404).json({ error: 'Not found' });
  const removed = localData.splice(idx, 1)[0];
  try {
    saveData(localData);
    res.json(removed);
  } catch (err) {
    res.status(500).json({ error: 'Failed to save' });
  }
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});