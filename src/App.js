// App.js
import React from 'react';
import QuestionDisplay from './components/QuestionDisplay';
import AnswerInput from './components/AnswerInput';
import Results from './components/Results';
import { StyleSelector } from './components/StyleSelector';
import { useQuiz } from './hooks/useQuiz';
import './index.css';

function App() {
  const {
    currentQuestion,
    questionCount,
    options,
    loading,
    results,
    style,
    error,
    quizStarted,
    quizHistory,
    handleAnswer,
    setStyle,
  } = useQuiz();

  if (!quizStarted && !style) {
    return (
      <div className="App">
        <StyleSelector onStyleSelect={setStyle} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>You have but one chance, Monta.</h1>
      {loading && <p className='loading-text'>Loading... Please wait.</p>}
      {error && <p className="error">{error}</p>}
      {results && <Results results={results} quizHistory={quizHistory} />}
      {currentQuestion && (
        <>
          <p className="question-count">Question {questionCount} of 10</p>
          <QuestionDisplay questionText={currentQuestion} />
          <AnswerInput onAnswer={handleAnswer} options={options} />
        </>
      )}
    </div>
  );
}

export default App;
