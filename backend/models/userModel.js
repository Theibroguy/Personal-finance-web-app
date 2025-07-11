const mongoose = require('mongoose');
const { type } = require('os');

// Define the username schema
const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true
  }
}, {timestamps: true});

// Create the user model
const User = mongoose.model('User', userSchema);

// Export the model so we can use it elsewhere
module.exports = User;