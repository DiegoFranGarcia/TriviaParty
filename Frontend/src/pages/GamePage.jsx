import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from '../api/axiosConfig';

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const selectedCategory = queryParams.get('category') || 'Sports';

  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [correctCount, setCorrectCount] = useState(0);

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await axios.get(`/questions?category=${encodeURIComponent(selectedCategory)}&limit=10`);
        const formatted = res.data.map((q, i) => ({
          id: i,
          question: q.text,
          correct: q.correctAnswer,
          choices: shuffle([q.correctAnswer, ...q.choices.filter(c => c !== q.correctAnswer)])
        }));
        setQuestions(formatted);
      } catch (err) {
        console.error('Failed to fetch questions', err);
      }
    };

    fetchQuestions();
  }, [selectedCategory]);

  const shuffle = (array) => {
    const a = [...array];
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  };

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
    if (answer === questions[currentIndex].correct) {
      setCorrectCount((prev) => prev + 1);
    }
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const finalScore = correctCount * 10; // 10 points per correct answer
      localStorage.setItem('lastScore', finalScore);
      navigate('/results');
    }
  };

  if (questions.length === 0) {
    return <div className="p-8 text-center">Loading questions for {selectedCategory}...</div>;
  }

  const current = questions[currentIndex];

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h2 className="text-xl font-semibold mb-4">Question {currentIndex + 1} of {questions.length}</h2>
      <p className="text-lg mb-6">{current.question}</p>
      <div className="space-y-4 mb-6">
        {current.choices.map((choice, idx) => (
          <button
            key={idx}
            className={`block w-full px-4 py-2 rounded border ${
              selectedAnswer === choice
                ? choice === current.correct
                  ? 'bg-green-200 border-green-600'
                  : 'bg-red-200 border-red-600'
                : 'bg-white hover:bg-gray-100'
            }`}
            onClick={() => handleAnswer(choice)}
            disabled={!!selectedAnswer}
          >
            {choice}
          </button>
        ))}
      </div>
      <div className="flex justify-end">
        {selectedAnswer && (
          <button
            onClick={handleNext}
            className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            {currentIndex + 1 < questions.length ? 'Next' : 'See Results'}
          </button>
        )}
      </div>
    </div>
  );
};

export default GamePage;
