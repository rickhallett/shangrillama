import React, { createContext, useReducer, useCallback } from 'react';
import { startQuestionnaire, submitAnswer, storeRawData } from '../services/api';
import { questions } from '../services/questionData';  // if you plan to derive from questionData
// Define default multiple-choice options; adjust as needed.
const defaultOptions = ['Yes', 'No', 'Maybe'];

const initialState = {
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
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ_REQUEST':
      return { ...state, loading: true, error: null, style: action.payload.style };
    case 'START_QUIZ_SUCCESS':
      return {
        ...state,
        loading: false,
        currentQuestion: action.payload.result.nextQuestion,
        options: (Array.isArray(action.payload.result.options) && action.payload.result.options.length > 0)
            ? action.payload.result.options
            : defaultOptions,
        quizHistory: [{ question: action.payload.result.nextQuestion, answer: null }],
        quizStarted: true,
        conversationHistory: [action.payload.result],
        questionCount: action.payload.result.questionCount || 1
      };
    case 'START_QUIZ_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'SUBMIT_ANSWER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'SUBMIT_ANSWER_SUCCESS_COMPLETED':
      return {
        ...state,
        loading: false,
        results: action.payload.results,
        currentQuestion: null,
        options: [],
        quizStarted: false,
        quizCompleted: true
      };
    case 'SUBMIT_ANSWER_SUCCESS':
      return {
        ...state,
        loading: false,
        currentQuestion: action.payload.nextQuestion,
        options: (Array.isArray(action.payload.options) && action.payload.options.length > 0)
            ? action.payload.options
            : defaultOptions,
        conversationHistory: action.payload.conversationHistory,
        quizHistory: state.quizHistory.concat({ question: action.payload.nextQuestion, answer: action.payload.answer }),
        questionCount: action.payload.questionCount
      };
    case 'SUBMIT_ANSWER_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'SET_USER_DETAILS':
      return { ...state, userDetails: action.payload };
    case 'SET_TOTAL_QUESTIONS':
      return { ...state, totalQuestions: action.payload };
    case 'SET_MODE':
      return { ...state, mode: action.payload };
    case 'SET_STYLE':
      return { ...state, style: action.payload };
    default:
      return state;
  }
}

export const QuizContext = createContext();

export function QuizProvider({ children }) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const startQuiz = useCallback(async (style) => {
    dispatch({ type: 'START_QUIZ_REQUEST', payload: { style } });
    try {
      const result = await startQuestionnaire(style);
      dispatch({
        type: 'START_QUIZ_SUCCESS',
        payload: { result }
      });
    } catch (error) {
      dispatch({ type: 'START_QUIZ_FAILURE', payload: { error: error.message } });
    }
  }, []);

  const submitQuizAnswer = async (answer) => {
    if (state.mode === 'dev') {
      await storeRawData({
        question: state.currentQuestion,
        options: state.options,
        answer,
        style: state.style
      });
      return;
    }
    dispatch({ type: 'SUBMIT_ANSWER_REQUEST' });
    try {
      const result = await submitAnswer(answer);
      if (result.isComplete) {
        dispatch({
          type: 'SUBMIT_ANSWER_SUCCESS_COMPLETED',
          payload: { results: result.results }
        });
      } else {
        dispatch({
          type: 'SUBMIT_ANSWER_SUCCESS',
          payload: {
            answer,
            nextQuestion: result.nextQuestion,
            options: result.options || [],
            conversationHistory: [...state.conversationHistory, result],
            questionCount: result.questionCount
          }
        });
      }
    } catch (error) {
      dispatch({
        type: 'SUBMIT_ANSWER_FAILURE',
        payload: { error: error.message }
      });
    }
  };

  const setUserDetails = (details) => {
    dispatch({ type: 'SET_USER_DETAILS', payload: details });
  };

  const setTotalQuestions = (total) => {
    dispatch({ type: 'SET_TOTAL_QUESTIONS', payload: total });
  };

  const setMode = (mode) => {
    dispatch({ type: 'SET_MODE', payload: mode });
  };

  const setStyle = (style) => {
    dispatch({ type: 'SET_STYLE', payload: style });
  };

  return (
    <QuizContext.Provider value={{ state, startQuiz, submitQuizAnswer, setUserDetails, setTotalQuestions, setMode, setStyle }}>
      {children}
    </QuizContext.Provider>
  );
}
