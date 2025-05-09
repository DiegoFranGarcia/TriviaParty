import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-8 bg-gray-50">
      <h1 className="text-4xl font-bold mb-6">🎉 Trivia Party</h1>

      <div className="space-y-4 w-full max-w-sm">
        <button
          className="w-full px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          onClick={() => navigate('/lobby/12345')}
        >
          Host Game
        </button>

        <button
          className="w-full px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700"
          onClick={() => navigate('/lobby/67890')}
        >
          Join Game
        </button>

        <button
          className="w-full px-6 py-3 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600"
          onClick={() => navigate('/manage-questions')}
        >
          ✏️ Manage Questions
        </button>
      </div>
    </div>
  );
};

export default HomePage;
