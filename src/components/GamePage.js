// src/components/GamePage.js
import React, { useState, useEffect, useMemo } from 'react';
import { db } from '../firebase';
import { doc, setDoc, onSnapshot, updateDoc } from 'firebase/firestore';
import pikachu from '../assets/pikachu.gif'; // Make sure pikachu.gif is in src/assets/

function GamePage({ gameId, user, onLeaveGame }) {
  const [game, setGame] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const gameRef = useMemo(() => doc(db, "games", gameId), [gameId]);

  useEffect(() => {
    const unsub = onSnapshot(gameRef, async (doc) => {
      if (doc.exists()) {
        const gameData = doc.data();
        if (!gameData.players[user.id]) {
          await updateDoc(gameRef, {
            [`players.${user.id}`]: { name: user.name, vote: null }
          });
        }
        setGame(gameData);
      } else {
        const newGame = {
          id: gameId,
          hostId: user.id,
          state: 'LOBBY',
          currentQuestion: null,
          players: {
            [user.id]: { name: user.name, vote: null }
          },
        };
        await setDoc(gameRef, newGame);
        setGame(newGame);
      }
    });
    return () => unsub();
  }, [gameId, user.id, user.name, gameRef]);
  
  const fetchAndSetQuestion = async () => {
    if (game.hostId !== user.id) return;
    
    setIsLoading(true);
    try {
      const response = await fetch('/api/getwyrquestion'); 
      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }
      const newQuestion = await response.json();
      
      const resetPlayers = Object.fromEntries(
        Object.entries(game.players).map(([id, player]) => [id, { ...player, vote: null }])
      );

      await updateDoc(gameRef, {
        state: 'VOTING',
        currentQuestion: newQuestion,
        players: resetPlayers,
      });

    } catch (error) {
      console.error("Error fetching question:", error);
      alert("Could not fetch a new question. Please try again.");
    } finally {
        setIsLoading(false);
    }
  };

  const handleStartGame = () => fetchAndSetQuestion();
  const handleNextQuestion = () => fetchAndSetQuestion();

  const handleVote = async (option) => {
    await updateDoc(gameRef, {
      [`players.${user.id}.vote`]: option
    });
  };
  
  useEffect(() => {
    if (game?.state === 'VOTING' && game.players) {
      const allVoted = Object.values(game.players).every(p => p.vote !== null);
      if (allVoted) {
        setTimeout(() => {
            updateDoc(gameRef, { state: 'RESULTS' });
        }, 500);
      }
    }
  }, [game, gameRef]);


  // ---- This is the corrected section ----
  
  const renderResults = () => {
    const players = Object.values(game.players);
    const totalVotes = players.length;
    
    const votesA = players.filter(p => p.vote === 'optionA');
    const votesB = players.filter(p => p.vote === 'optionB');

    const percentageA = totalVotes > 0 ? (votesA.length / totalVotes) * 100 : 0;
    const percentageB = totalVotes > 0 ? (votesB.length / totalVotes) * 100 : 0;
    
    return (
      <div className="results-container">
        <div className="result-option">
          <div className="result-info">
            <span>{game.currentQuestion.optionA}</span>
            <span>{votesA.length} Votes</span>
          </div>
          <div className="result-bar-bg">
            <div className="result-bar-fg" style={{ width: `${percentageA}%` }}>
              {percentageA > 15 && `${Math.round(percentageA)}%`}
            </div>
          </div>
          <ul className="voter-list">
            {votesA.map(p => <li key={p.name}>{p.name}</li>)}
          </ul>
        </div>
        <div className="result-option">
          <div className="result-info">
            <span>{game.currentQuestion.optionB}</span>
            <span>{votesB.length} Votes</span>
          </div>
          <div className="result-bar-bg">
            <div className="result-bar-fg" style={{ width: `${percentageB}%` }}>
              {percentageB > 15 && `${Math.round(percentageB)}%`}
            </div>
          </div>
          <ul className="voter-list">
            {votesB.map(p => <li key={p.name}>{p.name}</li>)}
          </ul>
        </div>
      </div>
    );
  };
  
  const checkMarkIcon = (
    <svg className="check-mark" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
      <circle cx="26" cy="26" r="25" fill="none" stroke="white" strokeWidth="2" />
      <path fill="none" stroke="white" strokeWidth="3" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
    </svg>
  );


  // ---- Main return block starts here ----

  if (!game) return <div>Loading Game...</div>;

  const myVote = game.players[user.id]?.vote;
  const isHost = game.hostId === user.id;

  return (
    <div>
      <button className="btn" style={{ position: 'absolute', top: '20px', right: '20px' }} onClick={onLeaveGame}>Leave</button>
      <h2>Game Code: <span className="game-code">{gameId}</span></h2>
      
      {game.state === 'LOBBY' && (
        <div>
          <div className="pikachu-container">
            <img src={pikachu} alt="Waving Pikachu" className="pikachu-image" />
            {game.players[game.hostId] && (
              <div className="speech-bubble">
                You are in {game.players[game.hostId].name}'s idiot game!
              </div>
            )}
          </div>
          <div className="player-list">
            <h3>Players in Lobby:</h3>
            <ul>{Object.values(game.players).map(p => <li key={p.name}>{p.name}</li>)}</ul>
            {isHost && <button className="btn" onClick={handleStartGame} disabled={isLoading}>{isLoading ? 'Starting...' : 'Start Game'}</button>}
            {!isHost && <p>Waiting for the host to start...</p>}
          </div>
        </div>
      )}

      {isLoading && <p>Getting a new question from the AI...</p>}
      
      {!isLoading && game.state === 'VOTING' && game.currentQuestion && (
        <div>
          <h3>Would you rather...</h3>
          <button className={`btn btn-option ${myVote === 'optionA' ? 'selected' : ''}`} onClick={() => handleVote('optionA')} disabled={!!myVote}>
            {checkMarkIcon} {game.currentQuestion.optionA}
          </button>
          <div className="divider">OR</div>
          <button className={`btn btn-option ${myVote === 'optionB' ? 'selected' : ''}`} onClick={() => handleVote('optionB')} disabled={!!myVote}>
            {checkMarkIcon} {game.currentQuestion.optionB}
          </button>
          {!!myVote && <p style={{marginTop: '20px'}}>Waiting for other players...</p>}
        </div>
      )}
      
      {!isLoading && game.state === 'RESULTS' && game.currentQuestion && (
        <div>
          <h3>Results</h3>
          {renderResults()}
          {isHost && <button className="btn" style={{marginTop: '30px'}} onClick={handleNextQuestion} disabled={isLoading}>{isLoading ? 'Getting next...' : 'Next Question'}</button>}
          {!isHost && <p style={{marginTop: '30px'}}>Waiting for the host...</p>}
        </div>
      )}
    </div>
  );
}

export default GamePage;