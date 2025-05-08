// routes/stats.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const UserStats = require('../models/Stats'); // The UserStats model
const User = require('../models/User');         // The User model

/**
 * @route   GET /api/stats/me
 * @desc    Get stats for the currently authenticated user
 * @access  Private
 */
router.get('/me', auth, async (req, res) => {
    try {
        let stats = await UserStats.findOne({ user: req.user._id });

        if (!stats) {
            // If no stats record exists, create a default one and return it
            stats = new UserStats({ user: req.user._id });
            await stats.save();
        }
        
        // Format the response to match what StatsPage.jsx might expect
        // (totalCorrect / totalQuestions for average accuracy, best category)
        const formattedStats = {
            userId: req.user.playerId, // Use playerId as it's likely the frontend identifier
            name: req.user.username,
            totalGames: stats.totalGamesPlayed,
            totalQuestions: stats.totalQuestionsAnswered, // This is total questions *answered*
            totalCorrect: stats.totalCorrectAnswers,
            categoryStats: {}, // To be populated
        };

        // Convert Map to object for categoryStats and calculate percentages
        let bestCategoryName = 'N/A';
        let bestCategoryPercent = -1;

        if (stats.categoryStats && stats.categoryStats.size > 0) {
            stats.categoryStats.forEach((catData, category) => {
                formattedStats.categoryStats[category] = {
                    correct: catData.correct,
                    total: catData.totalAnswered, // Match frontend's 'total' expectation
                };
                if (catData.totalAnswered > 0) {
                    const percent = (catData.correct / catData.totalAnswered) * 100;
                    if (percent > bestCategoryPercent) {
                        bestCategoryPercent = percent;
                        bestCategoryName = category;
                    }
                }
            });
        }
        
        formattedStats.averageCorrectPercent = stats.totalQuestionsAnswered > 0 ?
            Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) : 0;
        
        formattedStats.bestCategory = {
            category: bestCategoryName,
            percent: parseFloat(bestCategoryPercent.toFixed(1)) || 0
        };
        
        res.json(formattedStats);

    } catch (err) {
        console.error('Error fetching own stats:', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/stats/:identifier
 * @desc    Get stats for a specific user by their MongoDB ObjectId or PlayerId
 * @access  Private (or Public, based on your app's privacy rules)
 */
router.get('/:identifier', auth, async (req, res) => {
    try {
        const identifier = req.params.identifier;
        let userToStat;

        // Check if identifier is likely a MongoDB ObjectId
        if (identifier.match(/^[0-9a-fA-F]{24}$/)) {
            userToStat = await User.findById(identifier);
        } else {
            // Assume it's a playerId
            userToStat = await User.findOne({ playerId: identifier.toUpperCase() });
        }

        if (!userToStat) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        let stats = await UserStats.findOne({ user: userToStat._id });

        if (!stats) {
             // If no stats record exists for this user, return a default "empty" stats structure
            return res.json({
                userId: userToStat.playerId,
                name: userToStat.username,
                totalGames: 0,
                totalQuestions: 0,
                totalCorrect: 0,
                categoryStats: {},
                averageCorrectPercent: 0,
                bestCategory: { category: 'N/A', percent: 0 },
            });
        }
        
        // Format the response (similar to /me)
        const formattedStats = {
            userId: userToStat.playerId,
            name: userToStat.username,
            totalGames: stats.totalGamesPlayed,
            totalQuestions: stats.totalQuestionsAnswered,
            totalCorrect: stats.totalCorrectAnswers,
            categoryStats: {},
        };

        let bestCategoryName = 'N/A';
        let bestCategoryPercent = -1;

        if (stats.categoryStats && stats.categoryStats.size > 0) {
            stats.categoryStats.forEach((catData, category) => {
                formattedStats.categoryStats[category] = {
                    correct: catData.correct,
                    total: catData.totalAnswered,
                };
                 if (catData.totalAnswered > 0) {
                    const percent = (catData.correct / catData.totalAnswered) * 100;
                    if (percent > bestCategoryPercent) {
                        bestCategoryPercent = percent;
                        bestCategoryName = category;
                    }
                }
            });
        }
        
        formattedStats.averageCorrectPercent = stats.totalQuestionsAnswered > 0 ?
            Math.round((stats.totalCorrectAnswers / stats.totalQuestionsAnswered) * 100) : 0;
            
        formattedStats.bestCategory = {
            category: bestCategoryName,
            percent: parseFloat(bestCategoryPercent.toFixed(1)) || 0
        };

        res.json(formattedStats);

    } catch (err) {
        console.error('Error fetching user stats:', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   PUT /api/stats/me
 * @desc    Update stats for the currently authenticated user after a game.
 * This endpoint should be called by each player involved in the completed game.
 * @access  Private
 * @body    An object representing the outcome of ONE game for THIS user.
 */
router.put('/me', auth, async (req, res) => {
    const gameOutcome = req.body; // See @body examples above

    if (!gameOutcome || (!gameOutcome.categoryPlayed && !gameOutcome.categoriesPlayed)) {
        return res.status(400).json({ msg: 'Game outcome data is required, including category information.' });
    }

    try {
        let stats = await UserStats.findOne({ user: req.user._id });
        if (!stats) {
            stats = new UserStats({ user: req.user._id });
        }

        stats.totalGamesPlayed += 1;
        stats.lastPlayedAt = new Date();
        // if (typeof gameOutcome.gameWon === 'boolean' && gameOutcome.gameWon) {
        //     stats.gamesWon = (stats.gamesWon || 0) + 1;
        // }

        if (gameOutcome.categoryPlayed) { // Single category game
            const { categoryPlayed, questionsInGame, correctAnswersInGame } = gameOutcome;
            if (typeof questionsInGame !== 'number' || typeof correctAnswersInGame !== 'number' || !categoryPlayed) {
                 return res.status(400).json({ msg: 'Invalid data for single category game outcome.' });
            }
            stats.totalQuestionsAnswered += questionsInGame;
            stats.totalCorrectAnswers += correctAnswersInGame;
            stats.updateCategoryStat(categoryPlayed, correctAnswersInGame, questionsInGame);

        } else if (gameOutcome.categoriesPlayed && Array.isArray(gameOutcome.categoriesPlayed)) { // Multi-category game
            for (const catResult of gameOutcome.categoriesPlayed) {
                const { categoryName, questionsAnswered, correctAnswers } = catResult;
                if (typeof questionsAnswered !== 'number' || typeof correctAnswers !== 'number' || !categoryName) {
                    return res.status(400).json({ msg: 'Invalid data in categoriesPlayed array.' });
                }
                stats.totalQuestionsAnswered += questionsAnswered;
                stats.totalCorrectAnswers += correctAnswers;
                stats.updateCategoryStat(categoryName, correctAnswers, questionsAnswered);
            }
        }

        await stats.save();

        res.json({
            msg: 'Stats updated successfully!',
            updatedStats: stats // Or a formatted version if needed
        });

    } catch (err) {
        console.error('Error updating stats:', err.message);
        res.status(500).send('Server Error');
    }
});


// Optional: Leaderboard route (can be expanded)
/**
 * @route   GET /api/stats/leaderboard/general
 * @desc    Get a general leaderboard (e.g., top N players by total correct answers)
 * @access  Public or Private
 */
router.get('/leaderboard/general', async (req, res) => {
    try {
        const topN = parseInt(req.query.limit) || 10;

        const leaderboardData = await UserStats.find()
            .sort({ totalCorrectAnswers: -1, totalGamesPlayed: -1 }) // Primary sort by correct, secondary by games played
            .limit(topN)
            .populate('user', 'username playerId'); // Populate user details

        const leaderboard = leaderboardData.map(statEntry => ({
            username: statEntry.user ? statEntry.user.username : 'Unknown User',
            playerId: statEntry.user ? statEntry.user.playerId : 'N/A',
            totalCorrectAnswers: statEntry.totalCorrectAnswers,
            totalGamesPlayed: statEntry.totalGamesPlayed,
            // Calculate average accuracy for leaderboard display
            averageAccuracy: statEntry.totalQuestionsAnswered > 0 ?
                Math.round((statEntry.totalCorrectAnswers / statEntry.totalQuestionsAnswered) * 100) : 0,
        }));
        
        res.json(leaderboard);
    } catch (err) {
        console.error('Error fetching leaderboard:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;