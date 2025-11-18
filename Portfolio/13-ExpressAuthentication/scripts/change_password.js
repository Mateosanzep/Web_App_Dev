#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const [,, username, newPassword] = process.argv;
if (!username || !newPassword) {
  console.error('Usage: node scripts/change_password.js <username> <newPassword>');
  process.exit(1);
}

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LOTR';

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB, updating password...');
    const user = await User.findOne({ username }).exec();
    if (!user) {
      console.error('User not found:', username);
      mongoose.disconnect();
      process.exitCode = 1;
      return;
    }
    user.setPassword(newPassword, (err) => {
      if (err) {
        console.error('Failed to set password:', err.message || err);
        mongoose.disconnect();
        process.exitCode = 1;
        return;
      }
      user.save()
        .then(() => {
          console.log('Password updated for user:', username);
        })
        .catch((saveErr) => {
          console.error('Error saving user:', saveErr && saveErr.message ? saveErr.message : saveErr);
          process.exitCode = 1;
        })
        .finally(() => mongoose.disconnect());
    });
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });
