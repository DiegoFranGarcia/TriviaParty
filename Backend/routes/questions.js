// routes/questions.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Assuming fetching questions still requires a logged-in user
const Question = require('../models/Question'); // Your Question model from Backend/models/Question.js

/**
 * @route   GET /api/questions
 * @desc    Get questions, filtered by category and limited for a game round.
 * Questions are pre-loaded and cannot be modified via the API.
 * @access  Private (or Public, if anyone can see question structures, though usually fetched in game context)
 * @query   category (String, e.g., "History", "Science") - REQUIRED
 * @query   limit (Number, e.g., 10 for a game round) - Optional, defaults to a preset number
 */
router.get('/', auth, async (req, res) => {
    const { category, limit, difficulty } = req.query;

    if (!category) {
        return res.status(400).json({ msg: 'A category is required to fetch questions.' });
    }

    const queryOptions = { category }; // Category is mandatory for filtering


    // Determine the number of questions to fetch
    // The Game model's gameSettings.numberOfQuestions could also drive this if fetched during game creation.
    const numLimit = parseInt(limit) || 10; // Default to 10 questions if no limit or an invalid limit is specified

    try {
        // Fetch questions using MongoDB's aggregation framework for random sampling
        // This is generally the best way to get N random documents matching criteria.
        const questions = await Question.aggregate([
            { $match: queryOptions },        // Filter by category and optionally difficulty
            { $sample: { size: numLimit } }  // Get N random documents from the filtered set
        ]);

        // If $sample returns fewer questions than requested (e.g., not enough questions in that category),
        // you might want to handle this, or it might be acceptable.
        if (!questions || questions.length === 0) {
            return res.status(404).json({ msg: `No questions found for category '${category}'` + (difficulty ? ` and difficulty '${difficulty}'.` : '.') });
        }
        
        // If you need to ensure a *minimum* number of questions and $sample might not provide enough,
        // you could fall back or have more complex logic, but usually, if there aren't enough, that's the data available.

        res.json(questions);
    } catch (err) {
        console.error('Error fetching questions:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;