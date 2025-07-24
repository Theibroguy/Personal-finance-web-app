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

// POST /login
router.post('/login', async (req, res) => {
  const {email, password} = req.body;

  try {
    // Checks if user exists
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: 'Invalid email or password'});

    // Compare password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid email or password'});

    res.status(200).json({ message: 'Login successful' });
  } catch (error) {
    console.error('Lgin error', error);
    res.status(500).json({ message: 'Server error during login' });
  }
});

// PUT /update-profile
router.put('/update-profile', async (req, res) => {
  const { email, username } = req.body;

  try {
    const user = await User.findOneAndUpdate(
      { email },
      { username },
      { new: true}
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "Profile updated", user });
  } catch (error) {
    console.error("Profile update error:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// PUT /update-password
router.put('/update-password', async (req, res) => {
  const { email, currentPassword, newPassword } = req.body;

  try {
    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Current password is incorrect' });
    }

    // Take new password and update
    const hashed = await bcrypt.hash(newPassword, 10);
    user.password = hashed;
    await user.save();

    res.json({ message: 'Password updated successfully' });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error during password update' });
  }
});

module.exports = router;