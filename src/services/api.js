// services/api.js
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

let conversationHistory = [];
let questionCount = 0;

const systemPrompt = `You are an AI assistant managing a romantic partner questionnaire. Your task is to:
1. Provide a series of 10 unique questions based on the user's previous answers and the overall context of a romantic compatibility test.
2. Maintain a coherent conversation style (formal, funny, flirty, or outrageous) as chosen by the user.
3. After all questions are answered, provide a compatibility assessment.

The questions should cover topics like authenticity, openness, humor, mindfulness, adventure, shared interests (meditation, technology, fitness, etc.), and unique preferences.

Subtract points for topics that are dealbreakers for the quiz creator: veganism, technophobia, lack of humor, inflexibility.

Include some playful questions related to physical strength and adventurousness, but keep them tasteful.

IMPORTANT: 
- Ensure each question is unique and not repeated.
- Keep track of the number of questions asked and stop after 10 questions.
- Your response must be a valid JSON object and nothing else. Do not include any explanatory text outside the JSON. 

The JSON object should contain:
{
  "nextQuestion": "Text of the next question",
  "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
  "isComplete": false,
  "questionCount": 1
}

When all 10 questions have been asked, set "isComplete" to true and include a "results" field with a compatibility assessment.`;

const extractJSON = (str) => {
    try {
        return JSON.parse(str);
    } catch (e) {
        const match = str.match(/\{[\s\S]*\}/);
        return match ? JSON.parse(match[0]) : null;
    }
};

export const startQuestionnaire = async (style) => {
    conversationHistory = [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Let's start the questionnaire. Use a ${style} style for the questions.` }
    ];
    questionCount = 0;

    const chatCompletion = await client.chat.completions.create({
        messages: conversationHistory,
        model: 'gpt-4o-mini',
    });

    const result = extractJSON(chatCompletion.choices[0].message.content);
    if (!result) {
        throw new Error("Failed to parse AI response");
    }
    questionCount = result.questionCount || 1;
    conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });

    return result;
};

const timeoutPromise = (ms, promise) => {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        reject(new Error("Request timed out"));
      }, ms);
      promise.then(
        (res) => {
          clearTimeout(timeoutId);
          resolve(res);
        },
        (err) => {
          clearTimeout(timeoutId);
          reject(err);
        }
      );
    });
  };



  export const submitAnswer = async (answer) => {
    console.log('API: Submitting answer:', answer);
    conversationHistory.push({ role: 'user', content: answer });
    questionCount++;
  
    console.log('API: Question count:', questionCount);
  
    try {
      if (questionCount >= 10) {
        console.log('API: Generating final assessment');
        const chatCompletion = await timeoutPromise(30000, client.chat.completions.create({
          messages: [
            ...conversationHistory,
            { role: 'user', content: 'Based on all the answers provided, generate a detailed compatibility assessment. Include a compatibility score as a percentage, and provide a breakdown of strengths and potential areas for growth in the relationship. Format your response as a JSON object with keys "compatibilityScore", "strengths" (an array), and "potentialAreasForGrowth" (an array).' }
          ],
          model: 'gpt-4o-mini',
        }));
  
        console.log('API: Raw AI response:', chatCompletion.choices[0].message.content);
  
        let assessmentResult;
        try {
          assessmentResult = JSON.parse(chatCompletion.choices[0].message.content);
        } catch (error) {
          console.error("API: Failed to parse AI response:", error);
          assessmentResult = { compatibilityScore: "N/A", strengths: [], potentialAreasForGrowth: [] };
        }
  
        console.log('API: Parsed assessment result:', assessmentResult);
  
        return {
          isComplete: true,
          results: assessmentResult
        };
      } else {
        console.log('API: Generating next question');
        const chatCompletion = await timeoutPromise(30000, client.chat.completions.create({
          messages: [
            ...conversationHistory,
            { role: 'user', content: `That was question number ${questionCount}. Please provide the next question.` }
          ],
          model: 'gpt-4o-mini',
        }));
  
        const result = extractJSON(chatCompletion.choices[0].message.content);
        if (!result) {
          throw new Error("Failed to parse AI response");
        }
        result.questionCount = questionCount;
        conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });
  
        console.log('API: Next question:', result);
  
        return result;
      }
    } catch (error) {
      console.error('API: Error in submitAnswer:', error);
      throw error;
    }
  };