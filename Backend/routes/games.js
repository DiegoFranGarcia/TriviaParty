// routes/games.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Your authentication middleware
const Game = require('../models/Game');     // Your Game model
const User = require('../models/User');     // Your User model
const Question = require('../models/Question'); // Your Question model

// Helper function to generate a unique game code
function generateGameCode(length = 5) {
    const characters = 'ABCDEFGHIJKLMNPQRSTUVWXYZ123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}

/**
 * @route   POST /api/games
 * @desc    Create a new game lobby
 * @access  Private
 * @body    { category: "Science", maxPlayers: 5, numberOfQuestions: 10}
 */
router.post('/', auth, async (req, res) => {
    const { category, maxPlayers, numberOfQuestions } = req.body;
    const hostId = req.user._id;

    if (!category) {
        return res.status(400).json({ msg: 'Please provide a game category.' });
    }

    const numQuestions = parseInt(numberOfQuestions) || 10; // Default to 10 questions

    try {
        const hostUser = await User.findById(hostId);
        if (!hostUser) {
            return res.status(404).json({ msg: 'Host user not found.' });
        }

        // Fetch questions for the game based on category and settings
        const queryOptions = { category };

        const gameQuestionsFromDB = await Question.aggregate([
            { $match: queryOptions },
            { $sample: { size: numQuestions } }
        ]);

        if (!gameQuestionsFromDB || gameQuestionsFromDB.length < 1) { // Ensure at least one question
            return res.status(404).json({ msg: `Not enough questions found for category '${category}'` + '. Could not start game.' });
        }
        
        // Map DB questions to the GameQuestionSchema structure within the Game model
        const gameQuestionsForGame = gameQuestionsFromDB.map(q => ({
            questionId: q._id.toString(), // Store the original question ID
            questionText: q.questionText,
            options: q.options,
            correctAnswer: q.correctAnswer,
            category: q.category // Or use the main game category
        }));

        let gameCode;
        let gameCodeIsUnique = false;
        let attempts = 0;
        const maxAttempts = 5; // Prevent infinite loop if code generation has issues

        // Attempt to generate a unique game code
        while(!gameCodeIsUnique && attempts < maxAttempts) {
            gameCode = generateGameCode();
            const existingGame = await Game.findOne({ gameCode });
            if (!existingGame) {
                gameCodeIsUnique = true;
            }
            attempts++;
        }

        if (!gameCodeIsUnique) {
            return res.status(500).json({ msg: 'Could not generate a unique game code. Please try again.'})
        }


        const newGame = new Game({
            gameCode,
            host: hostId,
            category, // Overall game category
            players: [{ userId: hostId, username: hostUser.username, score: 0 }],
            status: 'lobby',
            maxPlayers: parseInt(maxPlayers) || 5,
            questions: gameQuestionsForGame, // Store the selected questions
            currentQuestionIndex: 0,
            gameSettings: {
                numberOfQuestions: gameQuestionsForGame.length, // Actual number of questions fetched
                // timePerQuestion: 30 // Example, if you add this to game settings
            }
        });

        await newGame.save();
        // Populate host details for the response
        const gameResponse = await Game.findById(newGame._id).populate('host', 'username playerId').populate('players.userId', 'username playerId');
        res.status(201).json(gameResponse);

    } catch (err) {
        console.error('Error creating game:', err.message);
        if (err.code === 11000) { // Duplicate key error for gameCode
            return res.status(400).json({ msg: 'Failed to generate a unique game code (race condition), please try again.' });
        }
        res.status(500).send('Server Error');
    }
});

/**
 * @route   GET /api/games/:gameCode
 * @desc    Get game lobby information by game code (for lobby view)
 * @access  Private
 */
router.get('/:gameCode', auth, async (req, res) => {
    try {
        const gameCode = req.params.gameCode.toUpperCase();
        const game = await Game.findOne({ gameCode })
            .populate('host', 'username playerId')
            .populate('players.userId', 'username playerId'); // Populate username and playerId for each player

        if (!game) {
            return res.status(404).json({ msg: 'Game not found.' });
        }

        // For the lobby, we might not send all questions, just player info and game settings
        // Or, if the game is in progress, send the current question (but not answers yet)
        // This endpoint as is will send the whole game object, which is fine for now.

        res.json(game);
    } catch (err) {
        console.error('Error fetching game:', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/games/:gameCode/join
 * @desc    Allow a user to join an existing game lobby
 * @access  Private
 */
router.post('/:gameCode/join', auth, async (req, res) => {
    try {
        const gameCode = req.params.gameCode.toUpperCase();
        const userToJoin = await User.findById(req.user._id);

        if (!userToJoin) {
            return res.status(404).json({ msg: 'User not found.' });
        }

        const game = await Game.findOne({ gameCode });

        if (!game) {
            return res.status(404).json({ msg: 'Game not found.' });
        }

        // Use the instance method from Game.js model for cleaner logic
        try {
            game.addPlayer(userToJoin); // This method throws errors if conditions aren't met
        } catch (joinError) {
            return res.status(400).json({ msg: joinError.message });
        }

        await game.save();
        
        // Populate for response
        const updatedGame = await Game.findOne({ gameCode })
                                    .populate('host', 'username playerId')
                                    .populate('players.userId', 'username playerId');

        // TODO: Emit WebSocket event to lobby members about the new player
        res.json(updatedGame);

    } catch (err) {
        console.error('Error joining game:', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/games/:gameCode/start
 * @desc    Host starts the game
 * @access  Private
 */
router.post('/:gameCode/start', auth, async (req, res) => {
    try {
        const gameCode = req.params.gameCode.toUpperCase();
        const userId = req.user._id;

        const game = await Game.findOne({ gameCode });

        if (!game) {
            return res.status(404).json({ msg: 'Game not found.' });
        }

        if (!game.isHost(userId)) { // Using isHost method from Game model
            return res.status(403).json({ msg: 'Only the host can start the game.' });
        }

        if (game.status !== 'lobby') {
            return res.status(400).json({ msg: `Game is already ${game.status}. Cannot start.` });
        }
        
        if (game.questions.length === 0) {
            return res.status(400).json({ msg: 'Cannot start game with no questions. Please recreate the game.' });
        }

        game.status = 'in-progress';
        game.currentQuestionIndex = 0;
        game.startedAt = new Date();
        await game.save();

        // Populate for response
        const startedGame = await Game.findOne({ gameCode })
                                    .populate('host', 'username playerId')
                                    .populate('players.userId', 'username playerId');

        // TODO: Emit WebSocket event to all players that game has started, and send first question
        res.json(startedGame);

    } catch (err) {
        console.error('Error starting game:', err.message);
        res.status(500).send('Server Error');
    }
});

/**
 * @route   POST /api/games/:gameCode/answer
 * @desc    Player submits an answer for the current question
 * @access  Private
 * @body    { answer: "Player's Answer Text" }
 */
router.post('/:gameCode/answer', auth, async (req, res) => {
    const { answer } = req.body;
    const gameCode = req.params.gameCode.toUpperCase();
    const userId = req.user._id;

    if (!answer) {
        return res.status(400).json({ msg: 'Answer is required.' });
    }

    try {
        const game = await Game.findOne({ gameCode });
        if (!game) return res.status(404).json({ msg: 'Game not found.' });
        if (game.status !== 'in-progress') return res.status(400).json({ msg: 'Game is not currently in progress.' });

        const player = game.players.find(p => p.userId.equals(userId));
        if (!player) return res.status(403).json({ msg: 'You are not a player in this game.' });

        const currentQuestion = game.questions[game.currentQuestionIndex];
        if (!currentQuestion) return res.status(404).json({ msg: 'Current question not found. Game might be over or in an invalid state.' });
        
        let isCorrect = false;
        if (currentQuestion.correctAnswer.toLowerCase() === answer.toLowerCase()) {
            isCorrect = true;
            player.score += 10; // Example: 10 points for a correct answer
        }
        
        // TODO: Here you would typically store the player's answer for this question if needed for review.
        // For now, we just update score.

        // TODO: Implement logic for advancing the question or ending the game.
        // This often involves WebSockets to manage turns or timers.
        // For a simple HTTP version, you might need a separate "next question" endpoint or a more complex state management.
        // For this example, we'll assume the frontend will call a "next question" or "complete game" endpoint.

        await game.save(); // Save the updated score

        res.json({ 
            msg: 'Answer submitted.', 
            correct: isCorrect, 
            yourCurrentScore: player.score
        });

    } catch (err) {
        console.error('Error submitting answer:', err.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   POST /api/games/:gameCode/next
 * @desc    Host (or system) advances to the next question or completes the game
 * @access  Private
 */
router.post('/:gameCode/next', auth, async (req, res) => {
    const gameCode = req.params.gameCode.toUpperCase();
    const userId = req.user._id; // Used for host check

    try {
        const game = await Game.findOne({ gameCode });
        if (!game) return res.status(404).json({ msg: 'Game not found.' });
        if (game.status !== 'in-progress') return res.status(400).json({ msg: 'Game is not currently in progress.' });
        
        // Optional: Only host can trigger next question, or it could be automatic after a timer
        if (!game.isHost(userId)) {
            // return res.status(403).json({ msg: 'Only the host can advance the game question.' });
            // For now, allowing any player to trigger for simplicity if not using WebSockets for host control
        }

        if (game.currentQuestionIndex < game.questions.length - 1) {
            game.currentQuestionIndex += 1;
            await game.save();
             // TODO: Emit WebSocket event with new question to all players
            res.json({ msg: 'Advanced to next question.', gameStatus: game.status, currentQuestionIndex: game.currentQuestionIndex });
        } else {
            // Last question was answered, complete the game
            game.status = 'completed';
            game.completedAt = new Date();
            await game.save();
            // TODO: Emit WebSocket event that game is completed
            // Frontend should then call /api/results/:gameCode and individual players update their stats via /api/stats/me
            res.json({ msg: 'Game completed. All questions answered.', gameStatus: game.status });
        }
    } catch (err) {
        console.error('Error advancing game state:', err.message);
        res.status(500).send('Server Error');
    }
});


/**
 * @route   DELETE /api/games/:gameCode
 * @desc    Delete a game lobby (e.g., by host if in lobby, or system cleanup)
 * @access  Private (Host or Admin)
 */
router.delete('/:gameCode', auth, async (req, res) => {
    try {
        const gameCode = req.params.gameCode.toUpperCase();
        const userId = req.user._id;

        const game = await Game.findOne({ gameCode });

        if (!game) {
            return res.status(404).json({ msg: 'Game not found.' });
        }

        // Authorization: Only host can delete, or admin, or based on game status
        if (!game.isHost(userId)) { // Add admin check if needed: && req.user.role !== 'admin'
            return res.status(403).json({ msg: 'Not authorized to delete this game.' });
        }
        
        // Optional: Maybe only allow deletion if game is in 'lobby' or 'completed' for X days.
        // if (game.status === 'in-progress') {
        //    return res.status(400).json({ msg: 'Cannot delete a game that is currently in progress.' });
        // }

        await Game.findByIdAndDelete(game._id);

        res.json({ msg: `Game '${gameCode}' deleted successfully.` });

    } catch (err) {
        console.error('Error deleting game:', err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;