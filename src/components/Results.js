// components/Results.js
import React from 'react';
import emailjs from '@emailjs/browser';

function Results({ results, quizHistory }) {
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

  try {
    const formattedHistory = formatQuizHistory(quizHistory);
    
    emailjs.send('service_wwhpzka', 'template_7uozu1o', {
      results: formattedHistory,
      name: 'Ellie',
      email: 'ellie@sexy.com',
      tel: '1234567890',
      message: 'I need help'
    }, '3CEAnBnzDmM9Y35nG')
      .then((result) => {
        console.log('SUCCESS!', result.status, result.text);
      }, (error) => {
        console.log(error.text);
      });
  } catch (error) {
    console.error('Failed to send email:', error);
  }

  // Handle potential nested 'results' object
  const assessmentData = results.results || results;

  const { compatibilityScore, strengths, potentialAreasForGrowth } = assessmentData;

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
      {(!compatibilityScore && (!strengths || !strengths.length) && (!potentialAreasForGrowth || !potentialAreasForGrowth.length)) && (
        <div className="assessment-text">
          <p>No detailed assessment available.</p>
          <p>Raw data: {JSON.stringify(assessmentData, null, 2)}</p>
        </div>
      )}
    </div>
  );
}

export default Results;