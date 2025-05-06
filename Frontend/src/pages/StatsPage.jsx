import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

const mockStats = {
  userId: "u123",
  name: "TriviaFan",
  totalGames: 12,
  totalQuestions: 120,
  totalCorrect: 93,
  categoryStats: {
    General: { correct: 35, total: 40 },
    History: { correct: 20, total: 30 },
    Science: { correct: 18, total: 25 },
    "Pop Culture": { correct: 20, total: 25 }
  }
};

const StatsPage = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);

  useEffect(() => {
    setStats(mockStats);
  }, [userId]);

  if (!stats) return <p className="p-6">Loading user stats...</p>;

  const averageCorrectPercent = Math.round(
    (stats.totalCorrect / stats.totalQuestions) * 100
  );

  const bestCategory = Object.entries(stats.categoryStats)
    .map(([category, data]) => ({
      category,
      percent: (data.correct / data.total) * 100
    }))
    .sort((a, b) => b.percent - a.percent)[0];

  return (
    <div className="p-8 max-w-xl mx-auto">
      <h1 className="text-3xl font-bold text-center mb-6">
        📊 Stats for {stats.name}
      </h1>

      <div className="bg-white rounded-lg shadow p-6 text-lg space-y-4">
        <p>
          <strong>Total Games Played:</strong> {stats.totalGames}
        </p>
        <p>
          <strong>Average Accuracy:</strong> {averageCorrectPercent}%
        </p>
        <p>
          <strong>Best Category:</strong> {bestCategory.category} ({bestCategory.percent.toFixed(1)}%)
        </p>
      </div>

      <button
        onClick={() => navigate('/')}
        className="mt-8 px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
      >
        Back to Home
      </button>
    </div>
  );
};

export default StatsPage;
