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
2. Maintain a coherent conversation style (choose one of: formal, funny, flirty, outrageous, romantic) as determined by the user's selection.
3. Generate each quiz question with multiple choice answers. For every question, you MUST include a non-empty array of strings as the available options.
4. Once all 10 questions have been answered, generate a detailed compatibility assessment.
 
IMPORTANT INSTRUCTIONS:
- Your entire response MUST be a single valid JSON object with no additional text, commentary, or formatting.
- For an ongoing quiz (when the quiz is not complete), output an object with exactly these keys:
    "nextQuestion": a string containing the text of the next question,
    "options": a non-empty array of strings (each string is one multiple choice answer option),
    "isComplete": false,
    "questionCount": a number representing the current question index.
- When the quiz is complete (after 10 questions), output an object with exactly these keys:
    "isComplete": true,
    "results": {
         "compatibilityScore": a string representing a percentage (e.g., "85%"),
         "strengths": an array of strings,
         "potentialAreasForGrowth": an array of strings
    }
- DO NOT include any extra keys, markdown, code fences, or commentary.
Ensure that every response you generate strictly follows this data shape.`;

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
    model: 'o3-mini',
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
        model: 'o3-mini',
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
        model: 'o3-mini',
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

export const storeRawData = async (data) => {
  try {
    const response = await fetch("/api/store-raw-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data)
    });
    return await response.json();
  } catch (err) {
    console.error('storeRawData error:', err);
    throw err;
  }
};

export const encodeAndStoreData = async (rawData) => {
  try {
    const response = await fetch("/api/encode-store-data", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ rawData })
    });
    const json = await response.json();
    return json.success;
  } catch (err) {
    console.error('encodeAndStoreData error:', err);
    return false;
  }
};
