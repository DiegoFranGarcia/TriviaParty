// models/Questions.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const QuestionSchema = new Schema({
  category:    { type: String, required: true },       // e.g. "Science", "History"
  text:        { type: String, required: true },       // the question
  choices:     [{ type: String, required: true }],     // e.g. ["A", "B", "C", "D"]
  correctAnswer:{ type: String, required: true },      // must match one of the choices
});

module.exports = mongoose.model('Question', QuestionSchema);
