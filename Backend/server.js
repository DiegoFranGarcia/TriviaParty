// Backend/server.js

// --- Load Environment Variables for Local Development ---
// Import the 'path' module (make sure it's installed or built-in)
const path = require('path');

// Load variables from the .env file located in the parent directory
// This will load MONGODB_URI, JWT_SECRET, PORT etc., into process.env when running locally
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });
// Note: For Docker runs using --env-file or docker-compose environment:,
// the variables set by Docker will usually take precedence over those loaded by dotenv,
// but it's good practice to have this for local dev.
// If you ever have conflicts, you might make this conditional based on NODE_ENV.
// ------------------------------------------------------

const express = require('express');
const mongoose = require('mongoose');

const app = express();
// Use the PORT from the environment file, or default to 3000
const port = process.env.PORT || 3000;

// --- Debugging: Log Environment Variables ---
// Log the values *after* dotenv has potentially loaded them
console.log(`SERVER.JS: MONGODB_URI from process.env = [${process.env.MONGODB_URI}]`);
console.log(`SERVER.JS: JWT_SECRET from process.env = [${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}]`);
console.log(`SERVER.JS: PORT from process.env = [${process.env.PORT}]`);
// --------------------------------------------

// --- MongoDB Connection ---
if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
    console.error('Ensure you have a .env file in the project root (TRIVIAPARTY/)');
    console.error('with MONGODB_URI, JWT_SECRET, and PORT defined.');
    process.exit(1); // Exit if critical env var is missing
}

mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => {
      console.error('MongoDB connection error:', err.message);
      process.exit(1); // Exit if DB connection fails
  });
// -------------------------

// --- Middleware ---
app.use(express.json()); // Parse JSON request bodies
// Add CORS middleware if your frontend (on a different port) will call this locally
// const cors = require('cors');
// app.use(cors({
//    origin: 'http://localhost:3001', // Or your React dev server port
//    credentials: true
// }));
// -----------------

// --- API Routes ---
// Ensure these require paths match your actual lowercase filenames in ./routes/
app.use('/api/auth',            require('./routes/auth.js'));
app.use('/api/friend-requests', require('./routes/friendRequests.js'));
app.use('/api/users',           require('./routes/users.js'));
app.use('/api/games',           require('./routes/games.js'));
app.use('/api/results',         require('./routes/results.js'));
app.use('/api/stats',           require('./routes/stats.js'));
app.use('/api/questions',       require('./routes/questions.js'));
// -----------------

// --- Basic Root Route (Optional) ---
app.get('/', (req, res) => {
    res.send('Trivia Party Backend API is running!');
});
// -----------------------------------

// --- Start Server ---
app.listen(port, () => console.log(`Server is running locally on port ${port}`));
// -------------------