import React from 'react';

function QuizBlocker() {
  // Get results from localStorage
  const results = JSON.parse(localStorage.getItem('results'));
  const compatibilityScore = results?.compatibilityScore || 'N/A';

  return (
    <div className="quiz-blocker">
      <h2>You've had your turn.</h2>
      <div className="compatibility-score">
        <h3>Your Final Compatibility Score</h3>
        <div className="score">{compatibilityScore}</div>
      </div>
      <p>Did you score over 75%? If so, maybe swipe right...</p>
    </div>
  );
}

export default QuizBlocker;
