// App.js
import React from 'react';
import QuestionDisplay from './components/QuestionDisplay';
import AnswerInput from './components/AnswerInput';
import Results from './components/Results';
import { StyleSelector } from './components/StyleSelector';
import { useQuiz } from './hooks/useQuiz';
import UserDetailsForm from './components/UserDetailsForm';
import QuizBlocker from './components/QuizBlocker';
// import './App.css'; // merged into index.css
import './index.css';

function App() {
  const {
    currentQuestion,
    questionCount,
    quizHistory,
    options,
    loading,
    results,
    style,
    error,
    handleAnswer,
    setStyle,
    userDetails,
    setUserDetails,
    quizCompleted,
    quizStarted,
  } = useQuiz();

  if (quizCompleted && userDetails) {
    return (
      <div className="App">
        <QuizBlocker />
      </div>
    );
  }

  if (!userDetails) {
    return (
      <div className="App">
        <UserDetailsForm onSubmit={setUserDetails} />
      </div>
    );
  }

  // Set quiz started in localStorage when quiz begins
  if (quizStarted && !localStorage.getItem('quizStarted')) {
    localStorage.setItem('quizStarted', 'true');
  }

  if (!quizStarted && !style) {
    return (
      <div className="App">
        <StyleSelector onStyleSelect={setStyle} userName={userDetails?.name} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>You have but one chance, {userDetails?.name}.</h1>
      {loading && <p className='loading-text'>Loading... Please wait.</p>}      {error && <p className="error">{error}</p>}
      {results && <Results results={results} quizHistory={quizHistory} userDetails={userDetails} />}
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
