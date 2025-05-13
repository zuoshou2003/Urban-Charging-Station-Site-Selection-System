const express = require('express');
const router = express.Router();

// Import routes
const sitesRoutes = require('./sites');

// Register routes
router.use('/sites', sitesRoutes);

module.exports = router; 