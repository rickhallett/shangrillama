// services/api.js
import OpenAI from 'openai';

const client = new OpenAI({
    apiKey: process.env.REACT_APP_OPENAI_API_KEY,
    dangerouslyAllowBrowser: true
});

let conversationHistory = [];
let questionCount = 0;

const systemPrompt = `You are an AI assistant managing a romantic partner questionnaire. Your task is to:
1. Provide a series of 10 unique questions based on the user's previous answers and context.
2. Maintain a coherent conversation style (one of: formal, funny, flirty, outrageous, romantic) as chosen by the user.
3. After all questions are answered, provide a compatibility assessment.

IMPORTANT INSTRUCTIONS:
- Your complete response MUST be a single, valid JSON object with NO additional text, commentary, or formatting.
- Do NOT include markdown, code fences, or any explanations.
- For an ongoing quiz, output an object with the following exact keys:
    "nextQuestion": (string) the text of the next question,
    "options": (array) if available (or an empty array),
    "isComplete": false,
    "questionCount": (number) the current question index.
- When the quiz is complete (after 10 questions), output an object with these keys:
    "isComplete": true,
    "results": {
          "compatibilityScore": (string, percentage),
          "strengths": (array of strings),
          "potentialAreasForGrowth": (array of strings)
    }

Do not output anything else, only the valid JSON.`;

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
        model: 'gpt-4o',
    });

    console.log("Raw AI response:", chatCompletion.choices[0].message.content);
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
            { role: 'user', content: 'Based on all the answers provided, generate a detailed compatibility assessment. Your response MUST be a valid JSON object and include ONLY the following keys: "compatibilityScore" (a percentage string), "strengths" (an array of strings), and "potentialAreasForGrowth" (an array of strings). DO NOT include any additional keys (such as "nextQuestion" or "isComplete") or any extraneous text.' }
          ],
          model: 'gpt-4o',
        }));
  
        console.log('API: Raw AI response:', chatCompletion.choices[0].message.content);
  
        let assessmentResult;
        try {
          assessmentResult = JSON.parse(chatCompletion.choices[0].message.content);
          if (!assessmentResult.compatibilityScore || typeof assessmentResult.strengths === 'undefined' || typeof assessmentResult.potentialAreasForGrowth === 'undefined') {
            console.error("API: Incomplete assessment result:", assessmentResult);
            throw new Error("Incomplete assessment result");
          }
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
          model: 'gpt-4o',
        }));
  
        console.log("Raw AI response:", chatCompletion.choices[0].message.content);
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
