const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const authRoutes = require('./routes/auth');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/transactions', require('./routes/transactions'));
app.use('/api/budgets', require('./routes/budgetRoutes'));

// Serve static files from the root directory
app.use(express.static(path.join(__dirname, '../')));

// MongoDB connection
console.log('Attempting to connect to MongoDB at:', process.env.MONGO_URI);

// Use 127.0.0.1 instead of localhost to avoid IPv6 issues
const mongoURI = process.env.MONGO_URI.replace('localhost', '127.0.0.1');

mongoose.connect(mongoURI, {
  serverSelectionTimeoutMS: 5000 // Timeout after 5s instead of 30s
})
  .then(() => {
    console.log('MongoDB connected');
    startServer();
  })
  .catch((err) => {
    console.error('MongoDB connection failed:', err);
    console.log('Starting server without database connection for debugging...');
    startServer();
  });

function startServer() {
  app.listen(PORT, () => console.log(`Server running on ${PORT}`));
}