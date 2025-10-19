// client/src/router.jsx
import React, { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import Login from './components/Login';
import Signup from './components/Signup';

// Lazy load larger components
const About = lazy(() => import('./components/About'));
const Contact = lazy(() => import('./components/Contact'));
const Board = lazy(() => import('./components/Board'));
const GameBoard = lazy(() => import('./components/GameBoard'));
const GameModeSelection = lazy(() => import('./components/GameModeSelection'));
const RegisteredGameModes = lazy(() => import('./components/RegisteredGameModes'));
const ClassicMode = lazy(() => import('./components/ClassicMode'));
const TimeTrialMode = lazy(() => import('./components/TimeTrialMode'));
const Leaderboard = lazy(() => import('./components/Leaderboard'));
const Tutorial = lazy(() => import('./components/Tutorial'));

// Loading component
const LoadingSpinner = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
  </div>
);

const Router = () => {
  return (
    <Suspense fallback={<LoadingSpinner />}>
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
        <Route path="/classic-mode" element={<ClassicMode />} />
        <Route path="/time-trial-mode" element={<TimeTrialMode />} />
        <Route path="/game/free-trial" element={<GameBoard />} />
        <Route path="/game/classic" element={<GameBoard />} />
        <Route path="/game/time-trial" element={<GameBoard />} />
        <Route path="/game/puzzle-mode" element={<GameBoard />} />
        <Route path="/game/multiplayer" element={<GameBoard />} />
        <Route path="/game/:mode" element={<Board />} />
        <Route path="/game" element={<Board />} />
      </Routes>
    </Suspense>
  );
};

export default Router;
