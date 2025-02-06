import React, { createContext, useState, useCallback } from 'react';
import { startQuestionnaire, submitAnswer, storeRawData } from '../services/api';

export const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [state, setState] = useState({
    currentQuestion: null,
    questionCount: 0,
    quizHistory: [],
    options: [],
    loading: false,
    results: null,
    style: null,
    error: null,
    quizStarted: false,
    quizCompleted: false,
    totalQuestions: 10,
    userDetails: null,
    conversationHistory: [],
    mode: 'production'
  });

  const startQuiz = useCallback(async (style) => {
    setState(prev => ({ ...prev, loading: true, error: null, style }));
    try {
      const result = await startQuestionnaire(style);
      setState(prev => ({
         ...prev,
         currentQuestion: result.nextQuestion,
         options: result.options || [],
         quizHistory: [{ question: result.nextQuestion, answer: null }],
         quizStarted: true,
         loading: false,
         conversationHistory: [result]
      }));
    } catch (error) {
      setState(prev => ({ ...prev, error: error.message, loading: false }));
    }
  }, []);

  const submitQuizAnswer = async (answer) => {
    if(state.mode === 'dev') {
       // In dev mode, simply store the raw data.
       await storeRawData({
         question: state.currentQuestion,
         options: state.options,
         answer,
         style: state.style
       });
       return;
    } else {
      setState(prev => ({ ...prev, loading: true, error: null }));
      try {
         const result = await submitAnswer(answer);
         if(result.isComplete) {
            setState(prev => ({
              ...prev,
              results: result.results,
              currentQuestion: null,
              options: [],
              quizStarted: false,
              quizCompleted: true,
              loading: false
            }));
         } else {
            setState(prev => ({
              ...prev,
              currentQuestion: result.nextQuestion,
              options: result.options || [],
              quizHistory: [...prev.quizHistory, { question: result.nextQuestion, answer }],
              conversationHistory: [...prev.conversationHistory, result],
              loading: false
            }));
         }
      } catch (error) {
         setState(prev => ({
           ...prev,
           error: error.message,
           loading: false
         }));
      }
    }
  };

  const setUserDetails = (details) => {
    setState(prev => ({ ...prev, userDetails: details }));
  };

  const setTotalQuestions = (total) => {
    setState(prev => ({ ...prev, totalQuestions: total }));
  };

  const setMode = (mode) => {
    setState(prev => ({ ...prev, mode }));
  };

  return (
    <QuizContext.Provider value={{ state, startQuiz, submitQuizAnswer, setUserDetails, setTotalQuestions, setMode }}>
      {children}
    </QuizContext.Provider>
  );
}
