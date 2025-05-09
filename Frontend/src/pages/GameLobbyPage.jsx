import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from '../api/axiosConfig';

const GameLobbyPage = () => {
  const { gameId } = useParams();
  const navigate = useNavigate();
  const [players, setPlayers] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [displayName, setDisplayName] = useState('');

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await axios.get('/questions/categories');
        setCategories(res.data);
        if (res.data.length > 0) {
          setSelectedCategory(res.data[0]);
        }
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };

    fetchCategories();
  }, []);

  const handleStartGame = () => {
    if (!displayName.trim()) {
      alert('Please enter your display name before starting.');
      return;
    }

    localStorage.setItem('displayName', displayName);
    navigate(`/play/${gameId}?category=${encodeURIComponent(selectedCategory)}`);
  };

  return (
    <div className="p-8">
      <h2 className="text-3xl font-bold text-center mb-4">Lobby for Game #{gameId}</h2>

      <div className="max-w-md mx-auto bg-white rounded shadow p-4 mb-6">
        <label className="block text-lg font-semibold mb-2">Enter Your Display Name:</label>
        <input
          type="text"
          value={displayName}
          onChange={(e) => {
            setDisplayName(e.target.value);
            setPlayers([{ id: 1, name: e.target.value }]);
          }}
          className="w-full border rounded p-2 mb-4"
          placeholder="must be three characters or more"
        />

        <label className="block text-lg font-semibold mb-2">Choose a Category:</label>
        <select
          className="w-full border rounded p-2"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          {categories.map((cat) => (
            <option key={cat} value={cat}>
              {cat}
            </option>
          ))}
        </select>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <h3 className="text-xl font-semibold mb-2">Players Joined:</h3>
        <ul className="list-disc pl-6">
          {players.map((player) => (
            <li key={player.id}>{player.name || 'Waiting...'}</li>
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
