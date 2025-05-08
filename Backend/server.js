
/* require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
  });

const express = require('express'); 
const app = express();
const port = 3000;
const mongoose = require('mongoose'); 

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB')); 
*/
require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
// ... other requires ...

const app = express();
const port = process.env.PORT || 3000; // Fallback is good

// Add a debug line to see the URI right before connection:
console.log(`SERVER.JS: MONGODB_URI from process.env = [${process.env.MONGODB_URI}]`);
console.log(`SERVER.JS: JWT_SECRET from process.env = [${process.env.JWT_SECRET ? 'SET' : 'NOT SET'}]`);
console.log(`SERVER.JS: PORT from process.env = [${process.env.PORT}]`);


if (!process.env.MONGODB_URI) {
    console.error('FATAL ERROR: MONGODB_URI environment variable is not set.');
    process.exit(1); // Exit if critical env var is missing
}

mongoose.connect(process.env.MONGODB_URI) // This should now use the value from docker-compose
  .then(() => console.log('Connected to MongoDB successfully!'))
  .catch(err => {
      console.error('MongoDB connection error:', err.message); // Log only the message for clarity
      // console.error('Full MongoDB connection error object:', err); // For more details if needed
      process.exit(1); // Exit if DB connection fails, as app can't run
  });
  
app.use(express.json());


app.use('/api/auth',                 require('./routes/auth'));
app.use('/api/friend-requests',      require('./routes/friendRequests'));
app.use('/api/users',                require('./routes/users'));
app.use('/api/games',                require('./routes/games'));
app.use('/api/results',              require('./routes/results'));
app.use('/api/stats',                require('./routes/stats'));
app.use('/api/questions',            require('./routes/questions'));


app.listen(port, () => console.log(`Server is running`));

