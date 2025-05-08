require('dotenv').config({
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

app.use(express.json());


app.use('/api/auth',                 require('./routes/auth'));
app.use('/api/friend-requests',      require('./routes/friendRequests'));
app.use('/api/users',                require('./routes/users'));
app.use('/api/games',                require('./routes/games'));
app.use('/api/results',              require('./routes/results'));
app.use('/api/stats',                require('./routes/stats'));
app.use('/api/questions',            require('./routes/questions'));


app.listen(port, () => console.log(`Server is running`));

