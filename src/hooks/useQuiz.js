import { useState, useEffect, useCallback } from 'react';


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
    totalQuestions: null,
    userDetails: null,
    conversationHistory: [],
  });

  const startQuiz = useCallback(async () => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const startRes = await fetch("/api/start-questionnaire", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ style: state.style }),
      });
      const { result, conversationHistory, questionCount } = await startRes.json();
      console.log('useQuiz: Received response:', result);
      setState(prev => ({
        ...prev,
        quizHistory: [{
          questionNumber: 1,
          question: result.nextQuestion,
          options: result.options || [],
          answer: null,
          response: result
        }],
        currentQuestion: result.nextQuestion,
        options: result.options || [],
        questionCount: questionCount,
        quizStarted: true,
        conversationHistory: conversationHistory
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
    if (localStorage.getItem('shangri-dev-mode')) {
      await fetch("/api/store-raw-data", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: state.currentQuestion,
          options: state.options,
          answer,
          style: state.style
        })
      });
      return;
    }
    setState(prev => ({ ...prev, loading: true, error: null }));
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
        setState(prev => ({
          ...prev,
          results: json.results,
          currentQuestion: null,
          options: [],
          quizStarted: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          questionCount: json.questionCount,
          currentQuestion: json.nextQuestion,
          options: json.options || [],
          conversationHistory: json.conversationHistory,
        }));
      }
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

  const setStyle = (style) => {
    setState(prev => ({ ...prev, style }));
  };

  const setTotalQuestions = (value) => setState(prev => ({ ...prev, totalQuestions: value }));

  return {
    ...state,
    handleAnswer,
    setStyle,
    setUserDetails,
    setTotalQuestions,
  };
} 
