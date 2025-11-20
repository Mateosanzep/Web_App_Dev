require('dotenv').config();
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const cookieParser = require('cookie-parser');

const app = express();

if (mongoose && mongoose.Query && mongoose.Query.prototype) {
  const _origExec = mongoose.Query.prototype.exec;
  mongoose.Query.prototype.exec = function(op, callback) {
    if (typeof op === 'function') {
      callback = op;
      op = undefined;
    }
    const p = _origExec.call(this, op);
    if (typeof callback === 'function') {
      p.then((res) => callback(null, res)).catch((err) => callback(err));
    }
    return p;
  };
}

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use(express.static(path.join(__dirname, 'public')));

app.engine('ejs', require('ejs').renderFile);
app.set('view engine', 'ejs');

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LOTR';
mongoose.set('strictQuery', true);
let dbConnected = false;
mongoConnect();

function mongoConnect() {
  mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => {
      dbConnected = true;
      console.log('MongoDB connected');
    })
    .catch((err) => {
      dbConnected = false;
      console.error('MongoDB connection error:', err && err.message ? err.message : err);
      console.error('Please check your MONGO_URI in the .env file or ensure MongoDB is accessible.');
    });
}

app.use(session({
  secret: process.env.SESSION_SECRET || 'dev_secret_change_me',
  resave: false,
  saveUninitialized: false,
  store: MongoStore.create({ mongoUrl }),
  cookie: { maxAge: 1000 * 60 * 60 * 24 }
}));

app.use(passport.initialize());
app.use(passport.session());

const User = require('./models/User');

passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
  passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: process.env.CALLBACK_URL || `${process.env.BASE_URL || 'http://localhost:' + (process.env.PORT || 3000)}/auth/google/secrets`
  }, async (accessToken, refreshToken, profile, cb) => {
    try {
      let user = await User.findOne({ googleId: profile.id }).exec();
      if (user) return cb(null, user);

      const email = profile.emails && profile.emails[0] && profile.emails[0].value;
      if (email) {
        const existingByEmail = await User.findOne({ email }).exec();
        if (existingByEmail) {
          existingByEmail.googleId = profile.id;
          await existingByEmail.save();
          return cb(null, existingByEmail);
        }
      }

      const username = profile.displayName || email || `google_${profile.id}`;
      user = new User({ username, email, googleId: profile.id });
      await user.save();
      return cb(null, user);
    } catch (err) {
      console.error('GoogleStrategy error:', err && err.message ? err.message : err);
      return cb(err);
    }
  }));
} else {
  console.warn('GOOGLE_CLIENT_ID and/or GOOGLE_CLIENT_SECRET not set in .env — Google OAuth will be disabled.');
}

app.get('/', (req, res) => {
  if (!dbConnected) {
    return res.status(503).send('Servicio temporalmente no disponible: sin conexión a la base de datos. Revise MONGO_URI.');
  }
  return res.sendFile(path.join(__dirname, 'public/html/index.html'));
});

function requireDB(req, res, next) {
  if (!dbConnected) return res.status(503).send('Servicio temporalmente no disponible: sin conexión a la base de datos.');
  return next();
}

app.get('/register', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/html/register.html'));
});

app.post('/register', requireDB, async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) return res.status(400).send('Faltan campos');
  try {
    const exists = await User.findOne({ email }).exec();
    if (exists) return res.status(409).send('El email ya está registrado. Por favor inicia sesión o usa otro email.');

    const newUser = new User({ username, email });
    await User.register(newUser, password);
    req.login(newUser, (err) => {
      if (err) return res.status(500).send('Error iniciando sesión');
      res.cookie('sessionActive', 'true', { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
      return res.redirect('/secret');
    });
  } catch (err) {
    console.error('Registro error:', err && err.message ? err.message : err);
    if (err && err.code === 11000) {
      return res.status(409).send('El email o nombre de usuario ya existe. Intenta iniciar sesión.');
    }
    return res.status(400).send('No se pudo crear el usuario');
  }
});

app.post('/login', requireDB, (req, res, next) => {
  const { username, password } = req.body;
  if (!username || !password) return res.redirect('/');

  const auth = User.authenticate();
  auth(username, password, (err, user, info) => {
    if (err) return next(err);
    if (!user) return res.status(401).send('Credenciales inválidas');
    req.login(user, (err) => {
      if (err) return next(err);
      res.cookie('sessionActive', 'true', { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
      return res.redirect('/secret');
    });
  });
});

app.get('/secret', requireDB, (req, res) => {
  if (req.isAuthenticated && req.isAuthenticated()) {
    return res.render('secret', { user: req.user });
  }
  return res.redirect('/');
});

app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
app.get('/auth/google/secrets', passport.authenticate('google', { failureRedirect: '/' }), (req, res) => {
  res.cookie('sessionActive', 'true', { httpOnly: true, maxAge: 1000 * 60 * 60 * 24 });
  res.redirect('/secret');
});

app.post('/submit-secret', requireDB, async (req, res) => {
  if (!(req.isAuthenticated && req.isAuthenticated())) return res.status(401).redirect('/');
  const { secret } = req.body;
  if (!secret) return res.status(400).send('No secret provided');
  try {
    const user = await User.findById(req.user._id).exec();
    if (!user) return res.status(404).send('User not found');
    user.secrets = user.secrets || [];
    user.secrets.push(secret);
    await user.save();
    return res.redirect('/secret');
  } catch (err) {
    console.error(err);
    return res.status(500).send('Error saving secret');
  }
});

app.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    res.clearCookie('sessionActive');
    res.redirect('/');
  });
});

module.exports = app;
