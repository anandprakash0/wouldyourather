// src/components/HomePage.js
import React, { useState } from 'react';

function HomePage({ onJoinGame, onCreateGame }) {
  const [name, setName] = useState('');
  const [gameCode, setGameCode] = useState('');

  const handleCreate = () => {
    if (name.trim()) {
      onCreateGame(name.trim());
    } else {
      alert("Please enter your name.");
    }
  };

  const handleJoin = () => {
    if (name.trim() && gameCode.trim()) {
      onJoinGame(name.trim(), gameCode.trim().toUpperCase());
    } else {
      alert("Please enter your name and a game code.");
    }
  };

  return (
    <div>
      <h2>Create or Join a Game</h2>
      <div className="input-group">
        <input
          type="text"
          placeholder="Enter your name"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button className="btn" onClick={handleCreate}>
          Create New Game
        </button>
      </div>
      
      <div className="divider">OR</div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter game code"
          value={gameCode}
          onChange={(e) => setGameCode(e.target.value)}
        />
        <button className="btn" onClick={handleJoin}>
          Join Game
        </button>
      </div>
    </div>
  );
}

export default HomePage;