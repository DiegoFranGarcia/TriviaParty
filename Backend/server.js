require('dotenv').config({
    path: require('path').resolve(__dirname, '../.env')
  });
const express = require('express'); 
const app = express();
const port = 5000;
const mongoose = require('mongoose'); 

mongoose.connect(process.env.MONGODB_URI);
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB')); 

app.use(express.json());

const userRouter = require('./routes/users.js'); 
app.use('/users', userRouter);

app.listen(port, () => console.log(`Server is running`));
