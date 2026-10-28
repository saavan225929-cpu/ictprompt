const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const applicationRoutes = require('./routes/applicationRoutes');
const { notFoundHandler, errorHandler } = require('./middleware/errorHandler');

// Load environment variables from .env file
dotenv.config();

// Connect to MongoDB
connectDB();

const app = express();

// Enable Cross-Origin Resource Sharing
app.use(cors());

// Body parser middleware for JSON and URL-encoded requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Basic health check route
app.get('/api/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Job Application Tracker API is running smoothly',
    data: {
      uptime: process.uptime(),
      timestamp: new Date().toISOString()
    }
  });
});

// Mount application resource routes
app.use('/api/applications', applicationRoutes);

// Catch-all route handler for undefined endpoints
app.use(notFoundHandler);

// Centralized error handling middleware
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
