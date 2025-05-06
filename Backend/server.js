require('dotenv').config();

const express = require('express'); 
const app = express();
const port = 3000;
const mongoose = require('mongoose'); 

mongoose.connect(process.env.MONGODB_URI, {useNewUrlParser: true});
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => console.log('Connected to MongoDB')); 

app.use(express.json());

const Router = require('./routes/routes.js'); 
app.use('/routes', Router);

app.listen(port, () => console.log(`Server is running`));
