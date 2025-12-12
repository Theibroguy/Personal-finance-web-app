const express = require('express');
const router = express.Router();
const Budget = require('../models/budgetModel');
const jwt = require('jsonwebtoken');

// Middleware to verify token (same as in other routes)
const auth = (req, res, next) => {
  const token = req.header('x-auth-token');
  if (!token) return res.status(401).json({ message: 'No token, authorization denied' });

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (e) {
    res.status(400).json({ message: 'Token is not valid' });
  }
};

// GET /api/budgets - Get all budgets for the user
router.get('/', auth, async (req, res) => {
  try {
    const budgets = await Budget.find({ user: req.user.id }).sort({ createdAt: -1 });
    res.json(budgets);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// POST /api/budgets - Create a new budget
router.post('/', auth, async (req, res) => {
  const { category, amount } = req.body;

  try {
    const newBudget = new Budget({
      category,
      amount,
      user: req.user.id,
    });

    const budget = await newBudget.save();
    res.json(budget);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

// DELETE /api/budgets/:id - Delete a budget
router.delete('/:id', auth, async (req, res) => {
  try {
    const budget = await Budget.findById(req.params.id);

    if (!budget) return res.status(404).json({ message: 'Budget not found' });

    // Check user
    if (budget.user.toString() !== req.user.id) {
      return res.status(401).json({ message: 'User not authorized' });
    }

    await budget.deleteOne();
    res.json({ message: 'Budget removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
