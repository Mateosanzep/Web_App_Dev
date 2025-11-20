const mongoose = require('mongoose');
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  googleId: { type: String, index: true, unique: false, sparse: true },
  secrets: { type: [String], default: [] },
  createdAt: { type: Date, default: Date.now }
});

userSchema.plugin(passportLocalMongoose, { usernameField: 'username' });

module.exports = mongoose.model('User', userSchema);
