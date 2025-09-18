// client/src/router.jsx
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import About from './components/About';
import Contact from './components/Contact';
import Login from './components/Login';
import Signup from './components/Signup';
import Board from './components/Board';
import GameBoard from './components/GameBoard';
import GameModeSelection from './components/GameModeSelection';
import RegisteredGameModes from './components/RegisteredGameModes';
import Leaderboard from './components/Leaderboard';
import Tutorial from './components/Tutorial';

const Router = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/tutorial" element={<Tutorial />} />
      <Route path="/leaderboard" element={<Leaderboard />} />
      
      {/* Game routes */}
      <Route path="/game-mode-selection" element={<GameModeSelection />} />
      <Route path="/registered-game-modes" element={<RegisteredGameModes />} />
      <Route path="/game/free-trial" element={<GameBoard />} />
      <Route path="/game/classic" element={<GameBoard />} />
      <Route path="/game/time-trial" element={<GameBoard />} />
      <Route path="/game/puzzle-mode" element={<GameBoard />} />
      <Route path="/game/multiplayer" element={<GameBoard />} />
      <Route path="/game/:mode" element={<Board />} />
      <Route path="/game" element={<Board />} />
    </Routes>
  );
};

export default Router;
