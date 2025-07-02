import React, { useState, useContext } from "react";
import {
  FirebaseContext,
  FirebaseContextType,
} from "../context/FirebaseContext";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface PlayerScore {
  name: string;
  score: number;
  totalQuestions: number;
}

interface PlayerScores {
  player1: PlayerScore;
  player2: PlayerScore;
}

interface QuizResultsProps {
  score: number;
  totalQuestions: number;
  onPlayAgain: () => void;
  onShowLeaderboard: () => void;
  isPvP?: boolean;
  playerScores?: PlayerScores;
  showMessage: (title: string, text: string) => void;
}

const QuizResults: React.FC<QuizResultsProps> = ({
  score,
  totalQuestions,
  onPlayAgain,
  onShowLeaderboard,
  isPvP = false,
  playerScores,
  showMessage,
}) => {
  const { db, userId, isAuthReady, appId } = useContext(
    FirebaseContext
  ) as FirebaseContextType;
  const [playerName, setPlayerName] = useState<string>("");
  const [scoreSubmitted, setScoreSubmitted] = useState<boolean>(false);
  const [showSubmitForm, setShowSubmitForm] = useState<boolean>(true);

  const handleSubmitScore = async () => {
    if (!isAuthReady || !db) {
      showMessage(
        "Firebase Not Ready",
        "Firebase not ready or configured. Cannot submit score."
      );
      return;
    }
    if (!playerName.trim()) {
      showMessage(
        "Name Required",
        "Please enter your name to submit your score."
      );
      return;
    }

    try {
      if (!appId) {
        showMessage(
          "App ID Missing",
          "Application ID is not available. Cannot submit score."
        );
        return;
      }
      const leaderboardCollectionRef = collection(
        db,
        `artifacts/${appId}/public/data/leaderboard`
      );
      await addDoc(leaderboardCollectionRef, {
        playerName: playerName.trim(),
        score: score,
        totalQuestions: totalQuestions,
        timestamp: serverTimestamp(),
        userId: userId,
      });
      setScoreSubmitted(true);
      setShowSubmitForm(false);
      showMessage("Success!", "Score submitted successfully!");
    } catch (error) {
      console.error("Error submitting score:", error);
      showMessage(
        "Submission Failed",
        "Failed to submit score. Please try again."
      );
    }
  };

  return (
    <div className="card-panel">
      <h2 className="main-heading">Quiz Finished!</h2>

      {isPvP && playerScores ? (
        <>
          <h3 className="pvp-player-turn-heading">Local 1v1 Results</h3>
          {Object.entries(playerScores).map(([playerKey, s]) => (
            <p key={playerKey} className="results-player-score">
              <span className="results-player-name">{s.name}:</span> {s.score} /{" "}
              {s.totalQuestions}
            </p>
          ))}
          <p className="results-pvp-winner">
            Winner:{" "}
            {playerScores.player1.score > playerScores.player2.score
              ? playerScores.player1.name
              : playerScores.player2.score > playerScores.player1.score
              ? playerScores.player2.name
              : "It's a Tie!"}
          </p>
        </>
      ) : (
        <>
          <p className="results-score-text">
            Your final score:{" "}
            <span className="results-score-value">
              {score} / {totalQuestions}
            </span>
          </p>

          {showSubmitForm && (
            <div className="form-group" style={{ marginBottom: "1.5rem" }}>
              <input
                type="text"
                placeholder="Your Name for Leaderboard"
                value={playerName}
                onChange={(e) => setPlayerName(e.target.value)}
                className="submit-score-input"
              />
              <button
                onClick={handleSubmitScore}
                disabled={scoreSubmitted || !isAuthReady}
                className={`btn ${
                  scoreSubmitted || !isAuthReady ? "btn-disabled" : "btn-green"
                }`}
              >
                {scoreSubmitted
                  ? "Score Submitted!"
                  : "Submit Score to Leaderboard"}
              </button>
            </div>
          )}
        </>
      )}

      <button
        onClick={onPlayAgain}
        className="btn btn-blue"
        style={{ marginBottom: "1rem" }}
      >
        Play Again
      </button>
      <button onClick={onShowLeaderboard} className="btn btn-blue">
        View Leaderboard
      </button>
    </div>
  );
};

export default QuizResults;
