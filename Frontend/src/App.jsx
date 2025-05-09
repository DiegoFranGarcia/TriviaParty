import React from "react";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";

import HomePage from "./pages/HomePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import GameLobbyPage from "./pages/GameLobbyPage";
import GamePage from "./pages/GamePage";
import ResultsPage from "./pages/ResultsPage";
import StatsPage from "./pages/StatsPage";
import AddQuestionsPage from './pages/AddQuestionsPage';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/game/:gameId" element={<GameLobbyPage />} />
        <Route path="/play/:gameId" element={<GamePage />} />
        <Route path="/results" element={<ResultsPage />} />
        <Route path="/stats/:userId" element={<StatsPage />} />
        <Route path="/manage-questions" element={<AddQuestionsPage />} />
      </Routes>
    </Router>
  );
};

export default App;
