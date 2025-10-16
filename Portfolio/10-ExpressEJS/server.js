const express = require("express");
const app = express();
const https = require("https");
const path = require('path');
const fs = require('fs');
const session = require('express-session');

const port = 3000;

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use(session({
  secret: 'dev-secret-change-me',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 1000 * 60 * 60 }
}));

app.set("view engine", "ejs");
app.set('views', path.join(__dirname, 'views'));

const longContent =
  "Lacus vel facilisis volutpat est velit egestas dui id ornare. Semper auctor neque vitae tempus quam. Sit amet cursus sit amet dictum sit amet justo. Viverra tellus in hac habitasse. Imperdiet proin fermentum leo vel orci porta. Donec ultrices tincidunt arcu non sodales neque sodales ut. Mattis molestie a iaculis at erat pellentesque adipiscing. Magnis dis parturient montes nascetur ridiculus mus mauris vitae ultricies. Adipiscing elit ut aliquam purus sit amet luctus venenatis lectus. Ultrices vitae auctor eu augue ut lectus arcu bibendum at. Odio euismod lacinia at quis risus sed vulputate odio ut. Cursus mattis molestie a iaculis at erat pellentesque adipiscing.";

let posts = [];
let nextPostId = 1;


app.listen(port, (err) => {
  console.log(`Server is running on http://localhost:${port}`);
});

app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'html', 'index.html'));
});

app.get('/home', (req, res) => {
  if (!req.session || !req.session.name) {
    return res.redirect('/')
  }

  res.render('home', { name: req.session.name, via: 'Cookies', posts })
});

  app.post('/posts', (req, res) => {
  if (!req.session || !req.session.name) {
    return res.redirect('/')
  }

  const title = (req.body.title || '').toString().trim();
  const content = (req.body.content || '').toString().trim();

  if (!title || !content) {
    return res.redirect('/home')
  }

  const id = nextPostId++;
  posts.unshift({ id, title, content });

  res.redirect('/home');
})

app.get('/login', (req,res) => {
  req.session.name = req.query.name;
  res.send('welcome ' + req.session.name + ' you login by (GET)');
})

app.post('/login', (req,res) => {
  req.session.name = req.body.name;
  res.json({ mensaje: 'welcome ' + req.session.name + ' you login by (POST)' });
});

app.get('/test', (req, res) => {
  const sessionName = req.session.name || '';
  const name = req.query.name || sessionName || '';
  const via = req.query.via || (req.query.name ? 'GET' : (sessionName ? 'Cookies' : 'POST'));
  if (req.query.name) req.session.name = req.query.name;
  res.render('test', { name, via });
});

app.get('/test/greet', (req, res) => {
  const n = req.query.name || req.session.name || '';
  res.type('text').send('welcome ' + n + ' you login by (GET)');
});

app.get('/test/card', (req, res) => {
  const n = req.query.name || req.session.name || '';
  const via = req.query.via || (req.query.name ? 'GET' : (req.session.name ? 'Cookies' : 'POST'));
  res.render('partials/greeting-card', { name: n, via });
});

app.post('/test/card', (req, res) => {
  const n = req.body && req.body.name ? req.body.name : (req.session.name || '');
  const via = 'POST';
  res.render('partials/greeting-card', { name: n, via });
});

app.post('/test', (req,res) => {
  req.session.name = req.body.name;
  res.json({ mensaje: 'welcome ' + req.session.name + ' you login by (POST)' });
});

app.get('/post/:id', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  res.render('post', { post, name: req.session && req.session.name ? req.session.name : '' });
});

app.post('/post/:id/edit', (req, res) => {
  const id = Number(req.params.id);
  const post = posts.find(p => p.id === id);
  const title = (req.body.title || '').toString().trim();
  const content = (req.body.content || '').toString().trim();
  post.title = title;
  post.content = content;
  res.redirect('/post/' + id);
});


app.post('/post/:id/delete', (req, res) => {
  const id = Number(req.params.id);
  const idx = posts.findIndex(p => p.id === id);
  posts.splice(idx, 1);
  res.redirect('/home');
});
