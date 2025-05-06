import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const generateQuestions = (category) => {
  return Array.from({ length: 50 }, (_, i) => ({
    id: `${category}-${i}`,
    question: `Question ${i + 1} for ${category}?`,
    correct: "Correct Answer",
    choices: shuffle([
      "Correct Answer",
      "Wrong Option A",
      "Wrong Option B",
      "Wrong Option C"
    ])
  }));
};

const shuffle = (array) => {
  const a = [...array];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

const GamePage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const categories = ["General", "History", "Science", "Pop Culture"];

  // Change category here to simulate fetching from backend
  const [selectedCategory] = useState("General");
  const [questions, setQuestions] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);

  useEffect(() => {
    const qPool = generateQuestions(selectedCategory);
    setQuestions(qPool);
  }, [selectedCategory]);

  const handleAnswer = (answer) => {
    setSelectedAnswer(answer);
  };

  const handleNext = () => {
    setSelectedAnswer(null);
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex(currentIndex + 1);
    } else {
      navigate('/results');
    }
  };

  if (questions.length === 0) return <p className="p-6">Loading questions...</p>;

  const currentQ = questions[currentIndex];

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">
        Game #{gameId} – {selectedCategory} Category
      </h1>
      <h2 className="text-lg mb-2 font-medium">
        Question {currentIndex + 1} of {questions.length}
      </h2>
      <p className="mb-6">{currentQ.question}</p>
      <div className="grid grid-cols-1 gap-3">
        {currentQ.choices.map((choice, i) => (
          <button
            key={i}
            onClick={() => handleAnswer(choice)}
            className={`py-2 px-4 rounded border ${
              selectedAnswer === choice
                ? choice === currentQ.correct
                  ? "bg-green-300 border-green-700"
                  : "bg-red-300 border-red-700"
                : "bg-white hover:bg-gray-100"
            }`}
            disabled={selectedAnswer !== null}
          >
            {choice}
          </button>
        ))}
      </div>
      {selectedAnswer && (
        <div className="mt-6 text-center">
          <button
            onClick={handleNext}
            className="px-6 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {currentIndex + 1 === questions.length ? "See Results" : "Next Question"}
          </button>
        </div>
      )}
    </div>
  );
};

export default GamePage;
