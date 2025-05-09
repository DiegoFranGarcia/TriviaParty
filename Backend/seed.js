// seed.js
const path = require('path');
require('dotenv').config({
  path: path.resolve(__dirname, '../.env')
});const mongoose = require('mongoose');
const Category = require('./models/Category');

const staticCategories = [
  {
    name: 'Sports',
    questions: [
      {
        text: 'How many players are on a basketball team on the court per side?',
        choices: ['4', '5', '6', '7'],
        correctAnswer: '5'
      },
      {
        text: 'Which country won the FIFA World Cup in 2018?',
        choices: ['France', 'Croatia', 'Brazil', 'Germany'],
        correctAnswer: 'France'
      },
      {
        text: 'In tennis, what is the term for zero points?',
        choices: ['Love', 'Nil', 'Zero', 'Duck'],
        correctAnswer: 'Love'
      },
      {
        text: 'Which sport uses a shuttlecock?',
        choices: ['Tennis', 'Badminton', 'Squash', 'Table Tennis'],
        correctAnswer: 'Badminton'
      },
      {
        text: 'The Olympic Games are held every how many years?',
        choices: ['2', '3', '4', '5'],
        correctAnswer: '4'
      }
    ]
  },
  {
    name: 'History',
    questions: [
      {
        text: 'Who was the first female Prime Minister of the UK?',
        choices: ['Margaret Thatcher', 'Theresa May', 'Elizabeth II', 'Mary Robinson'],
        correctAnswer: 'Margaret Thatcher'
      },
      {
        text: 'In which year did the American Civil War end?',
        choices: ['1861', '1865', '1870', '1850'],
        correctAnswer: '1865'
      },
      {
        text: 'What wall fell in 1989 symbolizing the end of the Cold War?',
        choices: ['Berlin Wall', 'Great Wall', 'Wailing Wall', 'Hadrian\'s Wall'],
        correctAnswer: 'Berlin Wall'
      },
      {
        text: 'Who discovered penicillin?',
        choices: ['Marie Curie', 'Alexander Fleming', 'Louis Pasteur', 'Isaac Newton'],
        correctAnswer: 'Alexander Fleming'
      },
      {
        text: 'Which ancient civilization built Machu Picchu?',
        choices: ['Inca', 'Maya', 'Aztec', 'Olmec'],
        correctAnswer: 'Inca'
      }
    ]
  },
  {
    name: 'Geography',
    questions: [
      {
        text: 'What is the longest river in the world?',
        choices: ['Nile', 'Amazon', 'Yangtze', 'Mississippi'],
        correctAnswer: 'Nile'
      },
      {
        text: 'Mount Everest is located on which border?',
        choices: ['India–Nepal', 'China–Nepal', 'India–China', 'Pakistan–China'],
        correctAnswer: 'China–Nepal'
      },
      {
        text: 'What is the capital of Australia?',
        choices: ['Sydney', 'Canberra', 'Melbourne', 'Brisbane'],
        correctAnswer: 'Canberra'
      },
      {
        text: 'Which desert is the largest in the world?',
        choices: ['Sahara', 'Gobi', 'Arabian', 'Kalahari'],
        correctAnswer: 'Sahara'
      },
      {
        text: 'Which continent is the country of Egypt mostly located in?',
        choices: ['Asia', 'Europe', 'Africa', 'South America'],
        correctAnswer: 'Africa'
      }
    ]
  },
  {
    name: 'Science',
    questions: [
      {
        text: 'What is the chemical symbol for gold?',
        choices: ['Au', 'Ag', 'Gd', 'Go'],
        correctAnswer: 'Au'
      },
      {
        text: 'What gas do plants absorb from the atmosphere?',
        choices: ['Oxygen', 'Nitrogen', 'Carbon Dioxide', 'Hydrogen'],
        correctAnswer: 'Carbon Dioxide'
      },
      {
        text: 'How many planets are in our solar system?',
        choices: ['7', '8', '9', '10'],
        correctAnswer: '8'
      },
      {
        text: 'What part of the cell contains genetic material?',
        choices: ['Mitochondria', 'Ribosome', 'Nucleus', 'Cytoplasm'],
        correctAnswer: 'Nucleus'
      },
      {
        text: 'What force keeps us on the ground?',
        choices: ['Magnetism', 'Friction', 'Gravity', 'Inertia'],
        correctAnswer: 'Gravity'
      }
    ]
  }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI, {
    useNewUrlParser:    true,
    useUnifiedTopology: true
  });

  // Remove old data, then insert our static trivia
  await Category.deleteMany({});
  await Category.insertMany(staticCategories);

  console.log('✅ Database seeded with categories and questions');
  await mongoose.disconnect();
}

seed().catch(err => {
  console.error('Seeding error:', err);
  process.exit(1);
});
