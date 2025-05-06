import React from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
  const navigate = useNavigate();

  const handleHostGame = () => {
    const dummyGameId = '12345'; // Placeholder
    navigate(`/game/${dummyGameId}`);
  };

  const handleJoinGame = () => {
    const gameId = prompt("Enter Game Code:");
    if (gameId) {
      navigate(`/game/${gameId}`);
    }
  };

  return (
    <div className="p-8 flex flex-col items-center gap-4">
      <h1 className="text-4xl font-bold mb-6">🎉 Trivia Party 🎉</h1>
      <button
        onClick={handleHostGame}
        className="px-6 py-3 bg-blue-500 text-white rounded-xl hover:bg-blue-600"
      >
        Host Game
      </button>
      <button
        onClick={handleJoinGame}
        className="px-6 py-3 bg-green-500 text-white rounded-xl hover:bg-green-600"
      >
        Join Game
      </button>
      <button
        onClick={() => navigate('/login')}
        className="mt-6 underline text-sm text-gray-700"
      >
        Login
      </button>
    </div>
  );
};

export default HomePage;
