// components/QuestionDisplay.js
import React from 'react';

function QuestionDisplay({ questionText }) {
  return (
    <div className="question-display">
      <h2>{questionText}</h2>
    </div>
  );
}

export default QuestionDisplay;