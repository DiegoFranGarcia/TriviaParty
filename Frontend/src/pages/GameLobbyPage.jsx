import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const GameLobbyPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);

  useEffect(() => {
    setPlayers([
      { id: 1, name: 'HostPlayer' },
      { id: 2, name: 'TriviaFan' },
      { id: 3, name: 'Guest_123' }
    ]);
  }, [gameId]);

  const handleStartGame = () => {
    navigate(`/play/${gameId}`);
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold text-center mb-4">Lobby for Game #{gameId}</h1>

      <div className="max-w-md mx-auto bg-white rounded shadow p-4 mb-6">
        <h2 className="text-xl font-semibold mb-2">Players Joined:</h2>
        <ul className="list-disc pl-6">
          {players.map((player) => (
            <li key={player.id}>{player.name}</li>
          ))}
        </ul>
      </div>

      <div className="flex justify-center">
        <button
          className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700"
          onClick={handleStartGame}
        >
          Start Game
        </button>
      </div>
    </div>
  );
};

export default GameLobbyPage;
