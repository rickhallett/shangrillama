import React, { useState, useContext } from 'react';
import { QuizContext } from '../context/QuizContext';

function DevMode() {
  if (!localStorage.getItem('shangri-dev-mode')) return null;

  const { setTotalQuestions, setUserDetails } = useContext(QuizContext);
  const [quizRounds, setQuizRounds] = useState("3");
  const [rawDataMsg, setRawDataMsg] = useState("");

  const handleStartQuiz = (e) => {
    e.preventDefault();
    const rounds = Number.parseInt(quizRounds, 10);
    if (!rounds) {
      alert("Please enter a valid number.");
      return;
    }
    setTotalQuestions(rounds);
    setUserDetails({ name: 'Kai', email: 'kai@oceanheart.ai', tel: '07375862225' });
    // Optionally, trigger quiz start here
  };

  const handleSubmitRawData = async () => {
    try {
      const rawDataRes = await fetch("/api/get-raw-data");
      const rawData = await rawDataRes.json();
      if (!rawData.length) {
        setRawDataMsg("No raw data available – please run the quiz first.");
        return;
      }
      const encodeRes = await fetch("/api/encode-store-data", {
         method: "POST",
         headers: { "Content-Type": "application/json" },
         body: JSON.stringify({ rawData })
      });
      const encodeJson = await encodeRes.json();
      if (encodeJson.success) {
         setRawDataMsg("Data has been submitted");
         await fetch("/api/clear-raw-data", { method: "POST" });
      } else {
         setRawDataMsg("Data was not submitted");
      }
    } catch (err) {
      console.error(err);
      setRawDataMsg("An error occurred while submitting raw data");
    }
  };

  return (
    <div>
      <form onSubmit={handleStartQuiz}>
        <label>
          Number of Quiz Rounds:
          <input
            type="number"
            value={quizRounds}
            onChange={(e) => setQuizRounds(e.target.value)}
            defaultValue="3"
          />
        </label>
        <button type="submit">Start Quiz</button>
      </form>
      <button onClick={handleSubmitRawData}>Submit Raw Data</button>
      {rawDataMsg && <p>{rawDataMsg}</p>}
    </div>
  );
}

export default DevMode;
