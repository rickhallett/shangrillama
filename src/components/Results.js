// components/Results.js
import React from 'react';

const formatQuizHistory = (history) => {
  if (!Array.isArray(history)) return 'No quiz history available';

  return history.reduce((formatted, entry) => {
    if (!entry.answer) return formatted;
    formatted += `\nQ: ${entry.question}\n`;
    formatted += `A: ${entry.answer}\n`;
    formatted += '-------------------\n';
    return formatted;
  }, 'Quiz Summary:\n=============\n');
};

function Results({ results, quizHistory, userDetails }) {
  if (!results || typeof results !== 'object') {
    console.error('Invalid results object:', results);
    return <div className="error">Error: Unable to display results. Please try again.</div>;
  }

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
