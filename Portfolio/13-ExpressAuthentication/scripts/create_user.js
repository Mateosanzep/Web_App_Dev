#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const [,, username, email, password] = process.argv;
if (!username || !email || !password) {
  console.error('Usage: node scripts/create_user.js <username> <email> <password>');
  process.exit(1);
}

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LOTR';

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log('Connected to MongoDB, creating user...');
    const newUser = new User({ username, email });
    User.register(newUser, password, (err, user) => {
      if (err) {
        console.error('Failed to create user:', err.message || err);
        process.exitCode = 1;
      } else {
        console.log('User created:', user.username);
      }
      mongoose.disconnect();
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });
