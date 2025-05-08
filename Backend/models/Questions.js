const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionSchema = new Schema({
    questionText: {
        type: String,
        required: true,
        trim: true
    },
    options: [{ // Array of strings for the multiple-choice options
        type: String,
        required: true,
        trim: true
    }],
    correctAnswer: { // Store the correct answer text directly
        type: String,
        required: true,
        trim: true
    },
    category: {
        type: String,
        enum: ['sports', 'history', 'science', 'geography'], 
        required: true,
        trim: true,
    },
}, {
    timestamps: true // Adds createdAt and updatedAt
});

// Ensure that the correctAnswer is one of the options (optional validation)
QuestionSchema.pre('save', function(next) {
    if (this.options && this.correctAnswer && !this.options.includes(this.correctAnswer)) {
        return next(new Error('Correct answer must be one of the provided options.'));
    }
    next();
});

module.exports = mongoose.model('Question', QuestionSchema);