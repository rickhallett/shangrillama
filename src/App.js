// App.js
import React, { useState, useEffect } from 'react';
import QuestionDisplay from './components/QuestionDisplay';
import AnswerInput from './components/AnswerInput';
import Results from './components/Results';
import { startQuestionnaire, submitAnswer } from './services/api';
import './index.css';

function App() {
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [questionCount, setQuestionCount] = useState(0);
  const [options, setOptions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState(null);
  const [style, setStyle] = useState(null);
  const [error, setError] = useState(null);
  const [quizStarted, setQuizStarted] = useState(false);

  useEffect(() => {
    if (style) {
      startQuiz();
    }
  }, [style]);

  const startQuiz = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await startQuestionnaire(style);
      setCurrentQuestion(response.nextQuestion);
      setOptions(response.options || []);
      setQuestionCount(1);
      setQuizStarted(true);
    } catch (error) {
      console.error("Failed to start quiz:", error);
      setError("Failed to start the quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleStyleSelection = (selectedStyle) => {
    setStyle(selectedStyle);
  };



  const handleAnswer = async (answer) => {
    console.log('App: Handling answer:', answer);
    setLoading(true);
    setError(null);
    try {
      const response = await submitAnswer(answer);
      console.log('App: API response:', JSON.stringify(response, null, 2));
      if (response.isComplete) {
        console.log('App: Questionnaire complete, setting results');
        console.log('App: Results object:', JSON.stringify(response.results, null, 2));
        setResults(response.results);
        setCurrentQuestion(null);
        setOptions([]);
        setQuizStarted(false);
      } else {
        console.log('App: Setting next question');
        setQuestionCount(prevCount => prevCount + 1);
        setCurrentQuestion(response.nextQuestion);
        setOptions(response.options || []);
      }
    } catch (error) {
      console.error("App: Failed to submit answer:", error);
      setError(error.message === "Request timed out" 
        ? "The request took too long to respond. Please try again." 
        : "Failed to submit your answer. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (!quizStarted && !style) {
    return (
      <div className="App">
        <h1>You have but one chance, Ellie</h1>
        <h2>Choose your preferred style:</h2>
        <div className="style-buttons">
          {['formal', 'funny', 'flirty', 'outrageous'].map(s => (
            <button key={s} onClick={() => handleStyleSelection(s)}>{s}</button>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="App">
      <h1>52 Sami Pick Up</h1>
      {loading ? (
        <p className='loading-text'>Loading... Please wait.</p>
      ) : error ? (
        <p className="error">{error}</p>
      ) : results ? (
        <Results results={results} />
      ) : currentQuestion ? (
        <>
          <p className="question-count">Question {questionCount} of 10</p>
          <QuestionDisplay questionText={currentQuestion} />
          <AnswerInput onAnswer={handleAnswer} options={options} />
        </>
      ) : null}
    </div>
  );
}

export default App;