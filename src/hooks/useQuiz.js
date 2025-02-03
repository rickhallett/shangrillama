import { useState, useEffect, useCallback } from 'react';
import { startQuestionnaire, submitAnswer } from '../services/api';


export function useQuiz() {
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
    userDetails: null,
  });

  const startQuiz = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await startQuestionnaire(state.style);
      setState(prev => ({
        ...prev,
        quizHistory: [{
          questionNumber: 1,
          question: response.nextQuestion,
          options: response.options || [],
          answer: null,
          response
        }],
        currentQuestion: response.nextQuestion,
        options: response.options || [],
        questionCount: 1,
        quizStarted: true,
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: "Failed to start the quiz. Please try again."
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  }, [state.style]);

  useEffect(() => {
    if (state.style) {
      startQuiz();
    }
  }, [state.style, startQuiz]);

  const setUserDetails = (details) => {
    setState(prev => ({ ...prev, userDetails: details }));
  };

  const handleAnswer = async (answer) => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const response = await submitAnswer(answer);
      setState(prev => ({
        ...prev,
        quizHistory: [...prev.quizHistory, {
          questionNumber: prev.questionCount,
          question: prev.currentQuestion,
          options: prev.options,
          answer,
          response
        }],
        ...(response.isComplete
          ? {
            results: response.results,
            currentQuestion: null,
            options: [],
            quizStarted: false,
          }
          : {
            questionCount: prev.questionCount + 1,
            currentQuestion: response.nextQuestion,
            options: response.options || [],
          }
        ),
      }));
    } catch (err) {
      setState(prev => ({
        ...prev,
        error: err.message === "Request timed out"
          ? "The request took too long to respond. Please try again."
          : "Failed to submit your answer. Please try again.",
      }));
    } finally {
      setState(prev => ({ ...prev, loading: false }));
    }
  };

  return {
    ...state,
    handleAnswer,
    setStyle: (style) => setState(prev => ({ ...prev, style })),
    setUserDetails,
  };
} 
