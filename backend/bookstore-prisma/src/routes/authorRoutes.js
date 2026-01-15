const express = require('express');
const router = express.Router();
const { getAllAuthors, createAuthor, updateAuthor, deleteAuthor } = require('../controllers/authorController');
const { authMiddleware } = require('../middleware/auth');

// Get all authors (public)
router.get('/', getAllAuthors);

// Create author (protected)
router.post('/', authMiddleware, createAuthor);

// Update author (protected)
router.put('/:id', authMiddleware, updateAuthor);

// Delete author (protected)
router.delete('/:id', authMiddleware, deleteAuthor);

module.exports = router;
