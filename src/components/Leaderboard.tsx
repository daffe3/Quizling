import React, { useState, useEffect, useContext } from "react";
import {
  FirebaseContext,
  FirebaseContextType,
} from "../context/FirebaseContext";
import {
  collection,
  query,
  orderBy,
  limit,
  onSnapshot,
  DocumentData,
} from "firebase/firestore";

interface LeaderboardEntry extends DocumentData {
  id: string;
  playerName: string;
  score: number;
  totalQuestions: number;
  timestamp: any;
  userId: string;
}

interface LeaderboardProps {
  onGoHome: () => void;
  showMessage: (title: string, text: string) => void;
}

const Leaderboard: React.FC<LeaderboardProps> = ({ onGoHome, showMessage }) => {
  const { db, isAuthReady, appId } = useContext(
    FirebaseContext
  ) as FirebaseContextType;
  const [scores, setScores] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    if (!isAuthReady || !db) {
      showMessage(
        "Firebase Not Ready",
        "Firebase not ready or configured. Cannot load leaderboard."
      );
      setLoading(false);
      return;
    }

    if (!appId) {
      showMessage(
        "App ID Missing",
        "Application ID is not available. Cannot load leaderboard."
      );
      setLoading(false);
      return;
    }

    const leaderboardCollectionRef = collection(
      db,
      `artifacts/${appId}/public/data/leaderboard`
    );

    const q = query(
      leaderboardCollectionRef,
      orderBy("score", "desc"),
      orderBy("timestamp", "desc"),
      limit(10)
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const fetchedScores: LeaderboardEntry[] = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as LeaderboardEntry[];
        setScores(fetchedScores);
        setLoading(false);
      },
      (err) => {
        console.error("Error fetching leaderboard:", err);
        showMessage("Error", "Failed to load leaderboard. Please try again.");
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, [db, isAuthReady, appId, showMessage]);

  if (loading) {
    return (
      <div className="text-center text-gray-700 text-xl">
        Loading leaderboard...
      </div>
    );
  }

  return (
    <div
      className="card-panel"
      style={{
        minHeight: "400px",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <h2 className="main-heading">Top 10 Leaderboard</h2>
      {scores.length === 0 ? (
        <p
          className="text-gray-700 text-lg text-center"
          style={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          No scores yet. Be the first to play!
        </p>
      ) : (
        <ol className="leaderboard-list">
          {scores.map((entry, index) => (
            <li key={entry.id} className="leaderboard-item">
              <span className="leaderboard-player-name">
                {entry.playerName}
              </span>
              <span className="leaderboard-score">
                {entry.score} / {entry.totalQuestions}
              </span>
            </li>
          ))}
        </ol>
      )}
      <button
        onClick={onGoHome}
        className="btn btn-blue"
        style={{ marginTop: "2rem" }}
      >
        Back to Home
      </button>
    </div>
  );
};

export default Leaderboard;
