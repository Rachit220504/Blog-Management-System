const express = require('express');

const authRoutes = require('../authRoutes');
const postRoutes = require('../postRoutes');
const userRoutes = require('../userRoutes');
const dashboardRoutes = require('../dashboardRoutes');
const analyticsRoutes = require('../analyticsRoutes');
const uploadRoutes = require('../uploadRoutes');

const router = express.Router();

router.use('/auth', authRoutes);
router.use('/posts', postRoutes);
router.use('/users', userRoutes);
router.use('/dashboard', dashboardRoutes);
router.use('/analytics', analyticsRoutes);
router.use('/upload', uploadRoutes);

module.exports = router;