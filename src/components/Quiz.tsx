import React, { useState, useCallback } from "react";

interface Question {
  category: string;
  type: string;
  difficulty: string;
  question: string;
  correct_answer: string;
  incorrect_answers: string[];
}

interface QuizProps {
  questions: Question[];
  onQuizEnd: (score: number) => void;
  isPvP?: boolean;
  playerTurn?: number;
  playerName?: string;
}

const Quiz: React.FC<QuizProps> = ({
  questions,
  onQuizEnd,
  isPvP = false,
  playerTurn = 1,
  playerName = "",
}) => {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [showNextButton, setShowNextButton] = useState<boolean>(false);
  const [answeredCorrectly, setAnsweredCorrectly] = useState<boolean | null>(
    null
  );

  const currentQuestion = questions[currentQuestionIndex];

  const decodeHtmlEntities = (html: string): string => {
    const textarea = document.createElement("textarea");
    textarea.innerHTML = html;
    return textarea.value;
  };

  const shuffleArray = useCallback((array: string[]): string[] => {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }, []);

  const answers: string[] = currentQuestion
    ? shuffleArray([
        ...currentQuestion.incorrect_answers.map(decodeHtmlEntities),
        decodeHtmlEntities(currentQuestion.correct_answer),
      ])
    : [];

  const handleAnswerClick = (answer: string) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(answer);
    const isCorrect =
      answer === decodeHtmlEntities(currentQuestion.correct_answer);
    setAnsweredCorrectly(isCorrect);
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }
    setShowNextButton(true);
  };

  const handleNextQuestion = () => {
    setSelectedAnswer(null);
    setAnsweredCorrectly(null);
    setShowNextButton(false);
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex((prevIndex) => prevIndex + 1);
    } else {
      onQuizEnd(score);
    }
  };

  if (!currentQuestion) {
    return (
      <div className="text-center text-gray-700 text-xl">
        Loading question...
      </div>
    );
  }

  const getAnswerButtonClass = (answer: string): string => {
    if (selectedAnswer === null) {
      return "quiz-answer-button default";
    } else if (selectedAnswer === answer) {
      return answeredCorrectly
        ? "quiz-answer-button selected-correct"
        : "quiz-answer-button selected-incorrect";
    } else if (decodeHtmlEntities(currentQuestion.correct_answer) === answer) {
      return "quiz-answer-button correct-after-selection";
    } else {
      return "quiz-answer-button disabled-other";
    }
  };

  return (
    <div className="card-panel" style={{ maxWidth: "48rem" }}>
      {isPvP && (
        <h3 className="pvp-player-turn-heading">
          Player {playerTurn}: {playerName}'s Turn
        </h3>
      )}
      <div className="quiz-score">
        Score: <span className="quiz-score-value">{score}</span> /{" "}
        {questions.length}
      </div>
      <div className="quiz-question-text">
        Question {currentQuestionIndex + 1} of {questions.length}:{" "}
        {decodeHtmlEntities(currentQuestion.question)}
      </div>
      <div className="quiz-answers-grid">
        {answers.map((answer, index) => (
          <button
            key={index}
            onClick={() => handleAnswerClick(answer)}
            className={getAnswerButtonClass(answer)}
            disabled={selectedAnswer !== null}
          >
            {answer}
          </button>
        ))}
      </div>
      {showNextButton && (
        <button onClick={handleNextQuestion} className="btn btn-blue">
          {currentQuestionIndex < questions.length - 1
            ? "Next Question"
            : "Finish Quiz"}
        </button>
      )}
    </div>
  );
};

export default Quiz;
