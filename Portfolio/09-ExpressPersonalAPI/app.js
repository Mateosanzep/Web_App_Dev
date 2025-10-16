const express = require('express');
const app = express();
const path = require('path');
const fs = require('fs');
const port = 3000;
const JSON_FILE = path.join(__dirname, 'tasks.json');
const NAMES_FILE = path.join(__dirname, 'names.json');

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('html'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'html', 'index.html'));
});

app.get('/greet', (req, res, next) => {
  if (typeof req.query.index !== 'undefined') {
    const idx = parseInt(req.query.index, 10);
    fs.readFile(NAMES_FILE, 'utf8', (err, data) => {
      if (err) return next(err);
      const names = data ? JSON.parse(data) : [];
      if (Number.isNaN(idx) || idx < 0 || idx >= names.length) {
        const error = new Error('Index out of range');
        error.status = 400;
        return next(error);
      }
      const name = names[idx];
      return res.redirect('/wazzup.html?name=' + encodeURIComponent(name));
    });
    return;
  }

  const name = req.query.name || '';
  if (name) {
    fs.readFile(NAMES_FILE, 'utf8', (err, data) => {
      const names = data ? JSON.parse(data) : [];
      names.push(String(name));
      fs.writeFile(NAMES_FILE, JSON.stringify(names, null, 2), (writeErr) => {
        if (writeErr) console.error(writeErr);
        return res.redirect('/');
      });
    });
    return;
  }
  res.send(`Hello, ${name}! Welcome to my personal API.`);
});

app.get('/names', (req, res) => {
  fs.readFile(NAMES_FILE, 'utf8', (err, data) => {
    const names = data ? JSON.parse(data) : [];
    res.json({ names });
  });
});



app.put('/greet/:name', (req, res) => {
  const name = req.params.name || '';
  fs.readFile(NAMES_FILE, 'utf8', (err, data) => {
    const names = data ? JSON.parse(data) : [];
    names.push(String(name));
    fs.writeFile(NAMES_FILE, JSON.stringify(names, null, 2), () => {
      res.json({ names });
    });
  });
});

app.post('/task', (req, res) => {
  const task = req.body && req.body.task;

  fs.readFile(JSON_FILE, 'utf8', (err, data) => {
    const tasks = data ? JSON.parse(data) : [];
    tasks.push(String(task));
    fs.writeFile(JSON_FILE, JSON.stringify(tasks, null, 2), () => {
      res.json({ success: true, tasks });
    });
  });
});

app.get('/task', (req, res) => {
  fs.readFile(JSON_FILE, 'utf8', (error, data) => {
    const tasks = data ? JSON.parse(data) : [];
    res.json({ tasks });
  });
});

app.delete('/task/:index', (req, res) => {
  const idx = parseInt(req.params.index, 10);
  fs.readFile(JSON_FILE, 'utf8', (err, data) => {
    const tasks = data ? JSON.parse(data) : [];
    if (!Number.isNaN(idx) && idx >= 0 && idx < tasks.length) {
      tasks.splice(idx, 1);
    }
    fs.writeFile(JSON_FILE, JSON.stringify(tasks, null, 2), () => {
      res.json({ success: true, tasks });
    });
  });
});