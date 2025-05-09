// models/Category.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

// Sub‐schema for each question
const QuestionSchema = new Schema({
  text:          { type: String,   required: true },
  choices:       [{ type: String,   required: true }],   // e.g. ["A","B","C","D"]
  correctAnswer: { type: String,   required: true }      // must match one of the choices
}, { _id: false });

const CategorySchema = new Schema({
  name:      { type: String, required: true, unique: true },
  questions: [QuestionSchema]
});

module.exports = mongoose.model('Category', CategorySchema);
