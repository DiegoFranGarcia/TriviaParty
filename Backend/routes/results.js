// routes/results.js
// Backend/routes/results.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const Game = require('../models/Games');   // Your Game model from Backend/models/Game.js

/**
 * @route   GET /api/results/:gameCode
 * @desc    Get the formatted results for a specific completed game.
 * @access  Private (e.g., only players who participated or by some other rule)
 */
router.get('/:gameCode', auth, async (req, res) => {
    try {
        const gameCode = req.params.gameCode.toUpperCase();

        // Fetch the game from the database
        // We need to populate player details (username, playerId) from the User model
        // and host details if you want to display the host's username.
        const game = await Game.findOne({ gameCode })
            .populate('players.userId', 'username playerId') // Populates the 'userId' field within the 'players' array
            .populate('host', 'username playerId');          // Populates the 'host' field

        if (!game) {
            return res.status(404).json({ msg: `Game with code '${gameCode}' not found.` });
        }

        if (game.status !== 'completed') {
            return res.status(400).json({ msg: `Game '${gameCode}' is not yet completed. Results are not available.` });
        }


        // Format the results.
        // The Game model stores players with their scores. We just need to sort them.
        // Your frontend ResultsPage.jsx uses a 'name' field for players.
        const sortedPlayers = [...game.players].sort((a, b) => b.score - a.score);

        const gameResults = {
            gameCode: game.gameCode,
            category: game.category,
            hostUsername: game.host ? game.host.username : 'N/A', // Username of the host
            completedAt: game.completedAt || game.updatedAt, // Prefer completedAt if available
            rankings: sortedPlayers.map(player => ({
                // Use the populated username from player.userId.username if available,
                // otherwise use the denormalized player.username stored in the Game's player array.
                name: player.userId ? player.userId.username : player.username,
                score: player.score,
                playerId: player.userId ? player.userId.playerId : 'N/A' // Optional: if frontend needs it
            }))
        };

        res.json(gameResults);

    } catch (err) {
        console.error('Error fetching game results:', err.message);
        if (err.kind === 'ObjectId') { // Handle invalid ObjectId format for populate if it occurs
            return res.status(400).json({ msg: 'Invalid game or user reference.' });
        }
        res.status(500).send('Server Error');
    }
});

module.exports = router;
