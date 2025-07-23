const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const User = require('../models/userModel');

// POST / signup
router.post('/signup', async (req, res) => {
  const {username, email, password} = req.body;

  try {
    // Checks if user alredy exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User alredy exists' });
    }

    // Hash the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save user
    const newUser = new User ({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Signup error', error);
    res.status(500).json({ message: 'Server error during signup' });
  }
});

module.exports = router;