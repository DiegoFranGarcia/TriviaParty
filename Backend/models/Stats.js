// Backend/models/UserStats.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Subdocument for stats within a specific category
const CategoryStatDetailSchema = new Schema({
    correct: {
        type: Number,
        default: 0,
        min: 0
    },
    totalAnswered: { // Total questions answered in this category
        type: Number,
        default: 0,
        min: 0
    },
    gamesPlayedIncategory: { // Number of games played that included this category
        type: Number,
        default: 0,
        min: 0
    }
}, { _id: false });

const UserStatsSchema = new Schema({
    user: { // Link to the User model
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true, // Each user should have only one stats document
        index: true
    },
    totalGamesPlayed: {
        type: Number,
        default: 0,
        min: 0
    },
    totalQuestionsAnswered: {
        type: Number,
        default: 0,
        min: 0
    },
    totalCorrectAnswers: {
        type: Number,
        default: 0,
        min: 0
    },
    // Using a Map for categoryStats allows category names to be dynamic keys.
    // The value for each key will be a CategoryStatDetailSchema object.
    categoryStats: {
        type: Map,
        of: CategoryStatDetailSchema,
        default: {}
    },
    lastPlayedAt: { // Timestamp of the last game that updated these stats
        type: Date
    }
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Helper method to update or create category stats
UserStatsSchema.methods.updateCategoryStat = function(categoryName, correctAnswersInGame, questionsAnsweredInGame) {
    if (!this.categoryStats.has(categoryName)) {
        this.categoryStats.set(categoryName, { correct: 0, totalAnswered: 0, gamesPlayedIncategory: 0 });
    }
    const categoryStat = this.categoryStats.get(categoryName);
    categoryStat.correct += correctAnswersInGame;
    categoryStat.totalAnswered += questionsAnsweredInGame;
    categoryStat.gamesPlayedIncategory += 1; // Increment games played in this category
};

module.exports = mongoose.model('UserStats', UserStatsSchema);