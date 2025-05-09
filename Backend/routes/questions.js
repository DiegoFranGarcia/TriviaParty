const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Questions');
const Category = require('../models/Category');

// 🟢 GET /api/questions - Fetch questions from a specific category
router.get('/', async (req, res) => {
  const { category, limit } = req.query;

  if (!category) {
    return res.status(400).json({ msg: 'A category is required to fetch questions.' });
  }

  const numLimit = parseInt(limit) || 10;

  try {
    const questions = await Category.aggregate([
      { $match: { name: category } },
      { $unwind: '$questions' },
      { $sample: { size: numLimit } },
      { $replaceRoot: { newRoot: '$questions' } }
    ]);

    res.json(questions);
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch questions', error: err.message });
  }
});

// 🟢 GET /api/questions/categories - Fetch category names
router.get('/categories', async (req, res) => {
  console.log('🟢 /api/questions/categories was hit'); // debug log
  try {
    const categories = await Category.find({}, 'name');
    res.json(categories.map(c => c.name));
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch categories', error: err.message });
  }
});

module.exports = router;
