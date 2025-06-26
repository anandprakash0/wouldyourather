// src/App.js
import React, { useState, useEffect } from 'react';
import HomePage from './components/HomePage';
import GamePage from './components/GamePage';
import { v4 as uuidv4 } from 'uuid';
import './App.css';

function App() {
  const [user, setUser] = useState(null);
  const [gameId, setGameId] = useState(null);

  useEffect(() => {
    // Persist user ID across sessions
    let userId = localStorage.getItem('userId');
    if (!userId) {
      userId = uuidv4();
      localStorage.setItem('userId', userId);
    }
    // We only need the ID, the name is handled on the join screen
    setUser({ id: userId });
  }, []);

  const handleJoinGame = (name, id) => {
    setUser(prevUser => ({ ...prevUser, name }));
    setGameId(id);
  };
  
  const handleCreateGame = (name) => {
    setUser(prevUser => ({...prevUser, name}));
    // GamePage will handle creating the game in Firestore
    const newGameId = Math.random().toString(36).substr(2, 6).toUpperCase();
    setGameId(newGameId);
  }

  const handleLeaveGame = () => {
    setGameId(null);
    // Name is kept so user doesn't have to re-enter it
  };

  return (
    <div className="App">
      <h1>Would You Rather?</h1>
      {!gameId ? (
        <HomePage 
          onJoinGame={handleJoinGame} 
          onCreateGame={handleCreateGame}
          user={user}
        />
      ) : (
        <GamePage 
          gameId={gameId} 
          user={user} 
          onLeaveGame={handleLeaveGame}
        />
      )}
    </div>
  );
}

export default App;