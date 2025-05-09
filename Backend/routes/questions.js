const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Question = require('../models/Questions');
const Category = require('../models/Category');

// GET /api/questions - Fetch questions by category
router.get('/', auth, async (req, res) => {
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

// GET /api/questions/categories - Fetch all category names
router.get('/categories', async (req, res) => {
  try {
    const categories = await Category.find({}, 'name');
    res.json(categories.map(c => c.name));
  } catch (err) {
    res.status(500).json({ msg: 'Failed to fetch categories', error: err.message });
  }
});

// POST /api/questions - Add a new category with questions
router.post('/', async (req, res) => {
  const { name, questions } = req.body;

  if (!name || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Category name and questions array are required.' });
  }

  try {
    const existing = await Category.findOne({ name });
    if (existing) {
      return res.status(400).json({ error: 'Category already exists.' });
    }

    const category = new Category({ name, questions });
    await category.save();

    res.status(201).json({ message: 'Category added', category });
  } catch (err) {
    res.status(500).json({ error: 'Failed to create category', detail: err.message });
  }
});

// PUT /api/questions/:category/:index - Update question in category
router.put('/:category/:index', async (req, res) => {
  const { category, index } = req.params;
  const { text, choices, correctAnswer } = req.body;

  try {
    const doc = await Category.findOne({ name: category });
    if (!doc || !doc.questions[index]) {
      return res.status(404).json({ error: 'Question not found' });
    }

    doc.questions[index] = { text, choices, correctAnswer };
    await doc.save();

    res.json({ message: 'Question updated', question: doc.questions[index] });
  } catch (err) {
    res.status(500).json({ error: 'Update failed', detail: err.message });
  }
});

module.exports = router;
