// App.js
import React, { useContext } from 'react';
import QuestionDisplay from './components/QuestionDisplay';
import AnswerInput from './components/AnswerInput';
import Results from './components/Results';
import { StyleSelector } from './components/StyleSelector';
import UserDetailsForm from './components/UserDetailsForm';
import { QuizContext } from './context/QuizContext';
import './index.css';

function App() {
  const { state, startQuiz, submitQuizAnswer, setUserDetails } = useContext(QuizContext);
  const { currentQuestion, questionCount, quizHistory, options, loading, results, style, error, quizStarted, quizCompleted, userDetails } = state;

  console.log({ quizStarted, quizCompleted, userDetails, style });

  if (!userDetails) {
    return (
      <div className="App">
        <UserDetailsForm onSubmit={setUserDetails} />
      </div>
    );
  }

  if (!quizStarted && !style) {
    return (
      <div className="App">
        <StyleSelector onStyleSelect={ (selectedStyle) => startQuiz(selectedStyle) } userName={userDetails?.name} />
      </div>
    );
  }

  return (
    <div className="App">
      <h1>You have but one chance, {userDetails?.name}.</h1>
      {loading && <p className='loading-text'>Loading... Please wait.</p>}
      {error && <p className="error">{error}</p>}
      {results && <Results results={results} quizHistory={quizHistory} userDetails={userDetails} />}
      {currentQuestion && (
        <>
          <p className="question-count">Question {questionCount} of 10</p>
          <QuestionDisplay questionText={currentQuestion} />
          <AnswerInput onSubmitAnswer={submitQuizAnswer} options={options} />
        </>
      )}
    </div>
  );
}

export default App;
