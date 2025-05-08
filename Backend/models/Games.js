const mongoose = require('mongoose');
const { Schema } = mongoose;

// Schema for players within a game
const PlayerSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    username: { // Denormalized for easier display in lobby/results
        type: String,
        required: true
    },
    score: {
        type: Number,
        default: 0
    },
    // You could add more player-specific game data here if needed
    // e.g., answersSubmitted: [{ questionId: String, answer: String, isCorrect: Boolean }]
}, { _id: false }); // _id: false because this will be an array of subdocuments

// Subdocument schema for questions within a game (if you store them denormalized)
// Alternatively, you can have a separate Question model and just store an array of question ObjectIds
const GameQuestionSchema = new Schema({
    questionId: { type: String, required: true }, // Could be an ObjectId if referencing a global Question collection
    questionText: { type: String, required: true },
    options: [{ type: String, required: true }],
    correctAnswer: { type: String, required: true },
    category: { type: String, required: true }
    // timeLimit: { type: Number, default: 30 } // Optional: time limit per question
}, { _id: false });


const GameSchema = new Schema({
    gameCode: { // Short, user-friendly code to join a game
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true
    },
    host: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    category: {
        type: String,
        required: true
        // Consider using an enum if you have a fixed set of categories
        // enum: ['General', 'History', 'Science', 'Pop Culture', 'Sports']
    },
    players: [PlayerSchema],
    maxPlayers: {
        type: Number,
        default: 5,
        min: 2,
        max: 10 // Set a reasonable max
    },
    status: {
        type: String,
        required: true,
        enum: ['lobby', 'in-progress', 'completed', 'aborted'],
        default: 'lobby'
    },
    questions: [GameQuestionSchema], // Array of questions for this specific game instance
                                     // This means questions are "copied" or generated for the game
                                     // If you have a global question bank, you might store an array of ObjectIds instead
    currentQuestionIndex: {
        type: Number,
        default: 0
    },
    // Optional: Game settings can be an object for future flexibility
    gameSettings: {
        numberOfQuestions: { type: Number, default: 10 }, // e.g., 10 questions per game
        timePerQuestion: { type: Number, default: 30 } // seconds
        // allowLateJoin: { type: Boolean, default: false }
    },
    // Timestamps for when the game was created and last updated
    // Mongoose adds createdAt and updatedAt automatically if {timestamps: true}
    // You might want specific game start/end times:
    startedAt: { type: Date },
    completedAt: { type: Date }
}, {
    timestamps: true // Adds createdAt and updatedAt timestamps
});

// Index for faster querying by gameCode (already unique, but good for performance)
GameSchema.index({ gameCode: 1 });
// Index for finding active lobbies
GameSchema.index({ status: 1, category: 1 });


// Method to add a player (example instance method)
GameSchema.methods.addPlayer = function(user) {
    if (this.players.length >= this.maxPlayers) {
        throw new Error('Game lobby is full.');
    }
    if (this.status !== 'lobby') {
        throw new Error('Game is not in lobby state. Cannot join.');
    }
    if (this.players.some(player => player.userId.equals(user._id))) {
        throw new Error('User already in this game lobby.');
    }
    this.players.push({ userId: user._id, username: user.username, score: 0 });
};

// Method to check if a user is the host
GameSchema.methods.isHost = function(userId) {
    return this.host.equals(userId);
};


module.exports = mongoose.model('Game', GameSchema);