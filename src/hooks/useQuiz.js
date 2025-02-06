import { useReducer, useEffect, useCallback } from 'react';
import { storeRawData } from '../services/api';
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
  totalQuestions: null,
  userDetails: null,
  conversationHistory: [],
};

function quizReducer(state, action) {
  switch (action.type) {
    case 'START_QUIZ_REQUEST':
      return { ...state, loading: true, error: null };
    case 'START_QUIZ_SUCCESS':
      return {
        ...state,
        loading: false,
        quizHistory: [{
          questionNumber: 1,
          question: action.payload.result.nextQuestion,
          options: action.payload.result.options || [],
          answer: null,
          response: action.payload.result
        }],
        currentQuestion: action.payload.result.nextQuestion,
        options: action.payload.result.options || [],
        questionCount: action.payload.questionCount,
        quizStarted: true,
        conversationHistory: action.payload.conversationHistory,
      };
    case 'START_QUIZ_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'SUBMIT_ANSWER_REQUEST':
      return { ...state, loading: true, error: null };
    case 'SUBMIT_ANSWER_SUCCESS':
      return {
        ...state,
        loading: false,
        questionCount: action.payload.questionCount,
        currentQuestion: action.payload.nextQuestion,
        options: (Array.isArray(action.payload.options) && action.payload.options.length > 0)
            ? action.payload.options
            : defaultOptions,
        conversationHistory: action.payload.conversationHistory,
      };
    case 'SUBMIT_ANSWER_SUCCESS_COMPLETED':
      return {
        ...state,
        loading: false,
        results: action.payload.results,
        currentQuestion: null,
        options: [],
        quizStarted: false,
      };
    case 'SUBMIT_ANSWER_FAILURE':
      return { ...state, loading: false, error: action.payload.error };
    case 'SET_USER_DETAILS':
      return { ...state, userDetails: action.payload };
    case 'SET_STYLE':
      return { ...state, style: action.payload };
    case 'SET_TOTAL_QUESTIONS':
      return { ...state, totalQuestions: action.payload };
    default:
      return state;
  }
}


export function useQuiz(isDevMode = false) {
  const [state, dispatch] = useReducer(quizReducer, initialState);

  const startQuiz = useCallback(async () => {
    dispatch({ type: 'START_QUIZ_REQUEST' });
    try {
      const startRes = await fetch("/api/start-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: state.style }),
      });
      const data = await startRes.json();
      if (data.error) {
        dispatch({ type: 'START_QUIZ_FAILURE', payload: { error: data.error } });
        return;
      }
      const { result, conversationHistory, questionCount } = data;
      if (!result || !result.nextQuestion) {
        dispatch({
          type: 'START_QUIZ_FAILURE',
          payload: { error: "Invalid response from API: " + JSON.stringify(result) }
        });
        return;
      }
      console.log('useQuiz: Received response:', result);
      dispatch({
        type: 'START_QUIZ_SUCCESS',
        payload: { result, conversationHistory, questionCount }
      });
    } catch (err) {
      dispatch({ type: 'START_QUIZ_FAILURE', payload: { error: "Failed to start the quiz. Please try again." } });
    }
  }, [state.style]);

  useEffect(() => {
    if (state.style) {
      startQuiz();
    }
  }, [state.style, startQuiz]);

  const setUserDetails = (details) => {
    dispatch({ type: 'SET_USER_DETAILS', payload: details });
  };

  const handleAnswer = async (answer) => {
    if (localStorage.getItem('shangri-dev-mode')) {
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
      const answerRes = await fetch("/api/submit-answer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationHistory: state.conversationHistory,
          questionCount: state.questionCount,
          answer
        })
      });
      const json = await answerRes.json();
      if (json.isComplete) {
        dispatch({ type: 'SUBMIT_ANSWER_SUCCESS_COMPLETED', payload: { results: json.results } });
      } else {
        dispatch({ type: 'SUBMIT_ANSWER_SUCCESS', payload: {
          questionCount: json.questionCount,
          nextQuestion: json.nextQuestion,
          options: json.options || [],
          conversationHistory: json.conversationHistory,
        }});
      }
    } catch (err) {
      dispatch({
        type: 'SUBMIT_ANSWER_FAILURE',
        payload: {
          error: err.message === "Request timed out"
            ? "The request took too long to respond. Please try again."
            : "Failed to submit your answer. Please try again."
        }
      });
    }
  };

  const setStyle = (style) => {
    dispatch({ type: 'SET_STYLE', payload: style });
  };

  const setTotalQuestions = (value) => {
    dispatch({ type: 'SET_TOTAL_QUESTIONS', payload: value });
  };

  return {
    ...state,
    handleAnswer,
    setStyle,
    setUserDetails,
    setTotalQuestions,
  };
} 
