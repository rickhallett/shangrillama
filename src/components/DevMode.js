import React, { useState } from 'react';
import { useQuiz } from '../hooks/useQuiz';
import fs from 'fs/promises';

function DevMode() {
  if (!localStorage.getItem('shangri-dev-mode')) return null;

  const { setTotalQuestions, setUserDetails } = useQuiz();
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
    const rawDataPath = 'data/raw/raw-data.json';
    const vectorisedDataPath = 'data/vectorised-data.json';
    try {
      let rawData;
      try {
        const content = await fs.readFile(rawDataPath, 'utf-8');
        rawData = JSON.parse(content);
      } catch (err) {
        rawData = [];
      }
      if (!rawData.length) {
        setRawDataMsg("No raw data available – please run the quiz first.");
        return;
      }
      const { encodeAndStoreData } = await import('../services/ragieGenerate');
      const success = await encodeAndStoreData(rawData);
      if (success) {
        setRawDataMsg("Data has been submitted");
        await fs.writeFile(rawDataPath, JSON.stringify([], null, 2));
        let vectorData;
        try {
          const vContent = await fs.readFile(vectorisedDataPath, 'utf-8');
          vectorData = JSON.parse(vContent);
        } catch (err) {
          vectorData = [];
        }
        vectorData.push(...rawData);
        await fs.writeFile(vectorisedDataPath, JSON.stringify(vectorData, null, 2));
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
