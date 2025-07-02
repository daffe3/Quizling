import React, { useState } from "react";

interface Category {
  id: number;
  name: string;
}

interface QuizSetupProps {
  onStartQuiz: (amount: number, category: string, difficulty: string) => void;
  categories: Category[];
  onShowLeaderboard: () => void;
  onStartLocalPvP: () => void;
  showMessage: (title: string, text: string) => void;
}

const QuizSetup: React.FC<QuizSetupProps> = ({
  onStartQuiz,
  categories,
  onShowLeaderboard,
  onStartLocalPvP,
  showMessage,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>("any");
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>("any");
  const [amount, setAmount] = useState<number>(10);

  const handleStart = () => {
    if (amount < 1 || amount > 50) {
      showMessage(
        "Invalid Amount",
        "Please enter a number of questions between 1 and 50."
      );
      return;
    }
    onStartQuiz(amount, selectedCategory, selectedDifficulty);
  };

  return (
    <div className="card-panel">
      <h2 className="main-heading">Configure Your Quiz</h2>

      <div className="form-group">
        <label htmlFor="category-select" className="form-label">
          Category:
        </label>
        <select
          id="category-select"
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="form-select"
        >
          <option value="any">Any Category</option>
          {categories.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="difficulty-select" className="form-label">
          Difficulty:
        </label>
        <select
          id="difficulty-select"
          value={selectedDifficulty}
          onChange={(e) => setSelectedDifficulty(e.target.value)}
          className="form-select"
        >
          <option value="any">Any Difficulty</option>
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
        </select>
      </div>

      <div className="form-group" style={{ marginBottom: "2rem" }}>
        <label htmlFor="amount-input" className="form-label">
          Number of Questions (1-50):
        </label>
        <input
          type="number"
          id="amount-input"
          value={amount}
          onChange={(e) => setAmount(parseInt(e.target.value))}
          min="1"
          max="50"
          className="form-input"
        />
      </div>

      <button
        onClick={handleStart}
        className="btn btn-green"
        style={{ marginBottom: "1rem" }}
      >
        Start Single Player Quiz
      </button>
      <button
        onClick={onStartLocalPvP}
        className="btn btn-purple"
        style={{ marginBottom: "1rem" }}
      >
        Start Local 1v1 Challenge
      </button>
      <button onClick={onShowLeaderboard} className="btn btn-blue">
        View Leaderboard
      </button>
    </div>
  );
};

export default QuizSetup;
