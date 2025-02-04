// components/Results.js
import React, { useEffect } from 'react';
import emailjs from '@emailjs/browser';

function Results({ results, quizHistory, userDetails }) {
  console.log('Results component received:', JSON.stringify(results, null, 2));

  if (!results || typeof results !== 'object') {
    console.error('Invalid results object:', results);
    return <div className="error">Error: Unable to display results. Please try again.</div>;
  }

  const formatQuizHistory = (history) => {
    if (!Array.isArray(history)) return 'No quiz history available';

    return history.reduce((formatted, entry, index) => {
      // Skip entries with null answers (initial questions)
      if (!entry.answer) return formatted;

      // Add question and answer
      formatted += `\nQ${entry.questionNumber}: ${entry.question}\n`;
      formatted += `A: ${entry.answer}\n`;

      // Add a separator between entries
      formatted += '-------------------\n';

      return formatted;
    }, 'Quiz Summary:\n=============\n');
  };


  useEffect(() => {
    // Only run if quizHistory is a nonempty array and userDetails exists
    if (!quizHistory || !Array.isArray(quizHistory) || !userDetails) return;
    const formattedHistory = formatQuizHistory(quizHistory);
    emailjs.send(
      'service_bxh39s9',
      'template_9n2tsfr',
      {
        to_name: "King Richard",
        from_name: userDetails.name,
        to_email: "kai@oceanheart.ai",
        from_email: userDetails.email,
        history: formattedHistory,
      },
      '3CEAnBnzDmM9Y35nG'
    )
      .then((result) => {
        console.log('Email sent successfully:', result.status, result.text);
      })
      .catch((error) => {
        console.error('Email sending error:', error.text);
      });
  }, [quizHistory, userDetails]);
  const assessmentData = results.results || results;

  const { compatibilityScore, strengths, potentialAreasForGrowth } = assessmentData;
  const hasAssessmentData = compatibilityScore || (Array.isArray(strengths) && strengths.length) || (Array.isArray(potentialAreasForGrowth) && potentialAreasForGrowth.length);

  console.log('Parsed assessment data:', { compatibilityScore, strengths, potentialAreasForGrowth });

  return (
    <div className="results">
      <h2>Your Compatibility Assessment</h2>
      <div className="compatibility-score">
        <h3>Compatibility Score</h3>
        <div className="score">{compatibilityScore || "N/A"}</div>
      </div>
      {strengths && strengths.length > 0 && (
        <div className="assessment-section">
          <h3>Strengths</h3>
          <ul>
            {strengths.map((strength, index) => (
              <li key={index}>{strength}</li>
            ))}
          </ul>
        </div>
      )}
      {potentialAreasForGrowth && potentialAreasForGrowth.length > 0 && (
        <div className="assessment-section">
          <h3>Potential Areas for Growth</h3>
          <ul>
            {potentialAreasForGrowth.map((area, index) => (
              <li key={index}>{area}</li>
            ))}
          </ul>
        </div>
      )}
      {!hasAssessmentData && (
        <div className="assessment-text">
          <p>No detailed assessment available.</p>
          <p>Raw data: {JSON.stringify(assessmentData, null, 2)}</p>
        </div>
      )}
    </div>
  );
}

export default Results;
