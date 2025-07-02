import React, { useState } from "react";

interface LocalPvPSetupProps {
  onStartPvP: (player1Name: string, player2Name: string) => void;
  onGoHome: () => void;
  showMessage: (title: string, text: string) => void;
}

const LocalPvPSetup: React.FC<LocalPvPSetupProps> = ({
  onStartPvP,
  onGoHome,
  showMessage,
}) => {
  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");

  const handleStart = () => {
    if (!player1Name.trim() || !player2Name.trim()) {
      showMessage("Names Required", "Please enter names for both players.");
      return;
    }
    onStartPvP(player1Name.trim(), player2Name.trim());
  };

  return (
    <div className="card-panel">
      <h2 className="main-heading">Local 1v1 Challenge Setup</h2>
      <div className="form-group">
        <label htmlFor="player1-name" className="form-label">
          Player 1 Name:
        </label>
        <input
          type="text"
          id="player1-name"
          value={player1Name}
          onChange={(e) => setPlayer1Name(e.target.value)}
          className="form-input"
          placeholder="e.g., Player One"
        />
      </div>
      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label htmlFor="player2-name" className="form-label">
          Player 2 Name:
        </label>
        <input
          type="text"
          id="player2-name"
          value={player2Name}
          onChange={(e) => setPlayer2Name(e.target.value)}
          className="form-input"
          placeholder="e.g., Player Two"
        />
      </div>
      <button onClick={handleStart} className="btn btn-purple">
        Start Challenge
      </button>
      <button
        onClick={onGoHome}
        className="btn btn-gray"
        style={{ marginTop: "1rem" }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default LocalPvPSetup;
