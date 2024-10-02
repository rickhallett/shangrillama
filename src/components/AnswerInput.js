// components/AnswerInput.js
import React, { useState } from 'react';

function AnswerInput({ onAnswer, options }) {
  const [textAnswer, setTextAnswer] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onAnswer(textAnswer);
    setTextAnswer('');
  };

  if (options && options.length > 0) {
    return (
      <div className="answer-input">
        {options.map((option, index) => (
          <button key={index} onClick={() => onAnswer(option)} className="answer-button">
            {option}
          </button>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="answer-input">
      <input
        type="text"
        value={textAnswer}
        onChange={(e) => setTextAnswer(e.target.value)}
        placeholder="Type your answer here..."
        className="answer-text-input"
      />
      <button type="submit" className="submit-button">Submit</button>
    </form>
  );
}

export default AnswerInput;