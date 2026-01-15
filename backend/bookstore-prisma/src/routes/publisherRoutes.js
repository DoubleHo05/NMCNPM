const express = require('express');
const router = express.Router();
const { getAllPublishers, createPublisher, updatePublisher, deletePublisher } = require('../controllers/publisherController');
const { authMiddleware } = require('../middleware/auth');

// Get all publishers (public)
router.get('/', getAllPublishers);

// Create publisher (protected)
router.post('/', authMiddleware, createPublisher);

// Update publisher (protected)
router.put('/:id', authMiddleware, updatePublisher);

// Delete publisher (protected)
router.delete('/:id', authMiddleware, deletePublisher);

module.exports = router;
