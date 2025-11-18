#!/usr/bin/env node
require('dotenv').config();
const mongoose = require('mongoose');
const path = require('path');
const User = require(path.join(__dirname, '..', 'models', 'User'));

const mongoUrl = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/LOTR';

mongoose.connect(mongoUrl, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(async () => {
    console.log('Connected to MongoDB, fetching users...');
    const users = await User.find({}, { username: 1, email: 1, _id: 0 }).lean().exec();
    if (!users || users.length === 0) {
      console.log('No users found.');
    } else {
      console.table(users);
    }
    mongoose.disconnect();
  })
  .catch((err) => {
    console.error('MongoDB connection error:', err && err.message ? err.message : err);
    process.exit(1);
  });
