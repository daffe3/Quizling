import React, { useState, useEffect, useCallback, useContext } from "react";
import {
  FirebaseContext,
  FirebaseContextType,
  FirebaseProvider,
} from "./context/FirebaseContext";
import MessageBox from "./components/MessageBox";
import QuizSetup from "./components/QuizSetup";
import Quiz from "./components/Quiz";
import QuizResults from "./components/QuizResults";
import Leaderboard from "./components/Leaderboard";
import LocalPvPSetup from "./components/LocalPvPSetup";
import "./index.css";

interface Category {
  id: number;
  name: string;
}

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface PlayerScore {
  name: string;
  score: number;
  totalQuestions: number;
}

interface PlayerScores {
  player1: PlayerScore;
  player2: PlayerScore;
}

export default function App() {
  const [view, setView] = useState<
    "setup" | "quiz" | "results" | "leaderboard" | "pvp_setup"
  >("setup");
  const [quizQuestions, setQuizQuestions] = useState<Question[]>([]);
  const [quizScore, setQuizScore] = useState<number>(0);
  const [quizTotalQuestions, setQuizTotalQuestions] = useState<number>(0);
  const [categories, setCategories] = useState<Category[]>([]);
  const [message, setMessage] = useState<{
    title: string;
    text: string;
  } | null>(null);

  const [player1Name, setPlayer1Name] = useState<string>("");
  const [player2Name, setPlayer2Name] = useState<string>("");
  const [currentPlayerTurn, setCurrentPlayerTurn] = useState<1 | 2>(1);
  const [player1Score, setPlayer1Score] = useState<number>(0);
  const [player2Score, setPlayer2Score] = useState<number>(0);

  const showMessage = useCallback((title: string, text: string) => {
    setMessage({ title, text });
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch("https://opentdb.com/api_category.php");
        const data = await response.json();
        setCategories(data.trivia_categories);
      } catch (error) {
        console.error("Error fetching categories:", error);
        showMessage(
          "Error",
          "Failed to load quiz categories. Please try again later."
        );
      }
    };
    fetchCategories();
  }, [showMessage]);

  const fetchQuestions = useCallback(
    async (
      amount: number,
      category: string,
      difficulty: string
    ): Promise<Question[]> => {
      let url = `https://opentdb.com/api.php?amount=${amount}&type=multiple`;
      if (category !== "any") {
        url += `&category=${category}`;
      }
      if (difficulty !== "any") {
        url += `&difficulty=${difficulty}`;
      }

      try {
        const response = await fetch(url);
        const data = await response.json();

        if (data.response_code === 0 && data.results.length > 0) {
          return data.results as Question[];
        } else if (data.response_code === 1) {
          showMessage(
            "No Results",
            "Could not find questions for your selected criteria. Please try different options."
          );
          return [];
        } else {
          showMessage("Error", "Failed to fetch questions. Please try again.");
          return [];
        }
      } catch (error) {
        console.error("Error fetching questions:", error);
        showMessage(
          "Network Error",
          "Failed to connect to the quiz API. Please check your internet connection."
        );
        return [];
      }
    },
    [showMessage]
  );

  const handleStartQuiz = useCallback(
    async (amount: number, category: string, difficulty: string) => {
      const questions = await fetchQuestions(amount, category, difficulty);
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setQuizTotalQuestions(questions.length);
        setQuizScore(0);
        setView("quiz");
      } else {
        setView("setup");
      }
    },
    [fetchQuestions]
  );

  const handleQuizEnd = useCallback((score: number) => {
    setQuizScore(score);
    setView("results");
  }, []);

  const handlePvPQuizEnd = useCallback(
    (score: number) => {
      if (currentPlayerTurn === 1) {
        setPlayer1Score(score);
        setCurrentPlayerTurn(2);
        setQuizScore(0);
        setView("quiz");
      } else {
        setPlayer2Score(score);
        setView("results");
      }
    },
    [currentPlayerTurn]
  );

  const handlePlayAgain = () => {
    setQuizQuestions([]);
    setQuizScore(0);
    setQuizTotalQuestions(0);
    setPlayer1Name("");
    setPlayer2Name("");
    setPlayer1Score(0);
    setPlayer2Score(0);
    setCurrentPlayerTurn(1);
    setView("setup");
  };

  const handleShowLeaderboard = () => {
    setView("leaderboard");
  };

  const handleGoHome = () => {
    setView("setup");
  };

  const handleStartLocalPvPSetup = () => {
    setView("pvp_setup");
  };

  const handleStartPvPGame = useCallback(
    async (p1Name: string, p2Name: string) => {
      setPlayer1Name(p1Name);
      setPlayer2Name(p2Name);
      setCurrentPlayerTurn(1);
      setPlayer1Score(0);
      setPlayer2Score(0);

      const questions = await fetchQuestions(10, "any", "any");
      if (questions.length > 0) {
        setQuizQuestions(questions);
        setQuizTotalQuestions(questions.length);
        setQuizScore(0);
        setView("quiz");
      } else {
        setView("pvp_setup");
      }
    },
    [fetchQuestions]
  );

  const renderView = () => {
    switch (view) {
      case "setup":
        return (
          <QuizSetup
            onStartQuiz={handleStartQuiz}
            categories={categories}
            onShowLeaderboard={handleShowLeaderboard}
            onStartLocalPvP={handleStartLocalPvPSetup}
            showMessage={showMessage}
          />
        );
      case "quiz":
        return (
          <Quiz
            questions={quizQuestions}
            onQuizEnd={
              currentPlayerTurn === 1 && player1Name && player2Name
                ? handlePvPQuizEnd
                : handleQuizEnd
            }
            isPvP={player1Name && player2Name ? true : false}
            playerTurn={currentPlayerTurn}
            playerName={currentPlayerTurn === 1 ? player1Name : player2Name}
          />
        );
      case "results":
        const pvpScores: PlayerScores = {
          player1: {
            name: player1Name,
            score: player1Score,
            totalQuestions: quizTotalQuestions,
          },
          player2: {
            name: player2Name,
            score: player2Score,
            totalQuestions: quizTotalQuestions,
          },
        };
        return (
          <QuizResults
            score={quizScore}
            totalQuestions={quizTotalQuestions}
            onPlayAgain={handlePlayAgain}
            onShowLeaderboard={handleShowLeaderboard}
            isPvP={player1Name && player2Name ? true : false}
            playerScores={pvpScores}
            showMessage={showMessage}
          />
        );
      case "leaderboard":
        return (
          <Leaderboard onGoHome={handleGoHome} showMessage={showMessage} />
        );
      case "pvp_setup":
        return (
          <LocalPvPSetup
            onStartPvP={handleStartPvPGame}
            onGoHome={handleGoHome}
            showMessage={showMessage}
          />
        );
      default:
        return null;
    }
  };

  const firebaseContext = useContext(FirebaseContext);

  return (
    <FirebaseProvider>
      <div className="app-container">
        {renderView()}
        {message && (
          <MessageBox
            title={message.title}
            message={message.text}
            onClose={() => setMessage(null)}
          />
        )}
        <div className="user-id-display">
          User ID:{" "}
          {firebaseContext && firebaseContext.isAuthReady
            ? firebaseContext.userId || "N/A"
            : "Loading..."}
        </div>
      </div>
    </FirebaseProvider>
  );
}
