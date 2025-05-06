import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const dummyResults = [
  { name: "TriviaFan", score: 42 },
  { name: "HostPlayer", score: 38 },
  { name: "Guest_123", score: 30 },
  { name: "Newbie4", score: 20 }
];

const ResultsPage = () => {
  const [rankings, setRankings] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const sorted = [...dummyResults].sort((a, b) => b.score - a.score);
    setRankings(sorted);
  }, []);

  return (
    <div className="p-8 text-center">
      <h1 className="text-3xl font-bold mb-6">🏆 Game Results 🏆</h1>

      <div className="grid grid-cols-1 gap-4 max-w-md mx-auto">
        {rankings.map((player, index) => {
          const medal =
            index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : "🎖️";

          return (
            <div
              key={index}
              className={`flex justify-between items-center p-4 rounded shadow ${
                index === 0
                  ? "bg-yellow-100"
                  : index === 1
                  ? "bg-gray-200"
                  : index === 2
                  ? "bg-orange-100"
                  : "bg-white"
              }`}
            >
              <span className="text-xl font-semibold">
                {medal} {player.name}
              </span>
              <span className="text-lg font-mono">{player.score} pts</span>
            </div>
          );
        })}
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  );
};

export default ResultsPage;
