import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
});

const extractJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    const match = str.match(/\{[\s\S]*\}/);
    return match ? JSON.parse(match[0]) : null;
  }
};

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { conversationHistory, questionCount, answer } = req.body;
  if (!conversationHistory || typeof questionCount !== "number" || !answer) {
    return res.status(400).json({ error: "Missing required fields in request body" });
  }
  conversationHistory.push({ role: 'user', content: answer });
  const newQuestionCount = questionCount + 1;
  try {
    if (newQuestionCount >= 10) {
      // Final assessment branch
      const chatCompletion = await client.chat.completions.create({
        messages: [
          ...conversationHistory,
          { role: 'user', content: 'Based on all the answers provided, generate a detailed compatibility assessment. Your response MUST be a valid JSON object and include ONLY the following keys: "compatibilityScore" (a percentage string), "strengths" (an array of strings), and "potentialAreasForGrowth" (an array of strings).' }
        ],
        model: 'o3-mini',
      });
      let assessmentResult;
      try {
        assessmentResult = JSON.parse(chatCompletion.choices[0].message.content);
        if (!assessmentResult.compatibilityScore ||
          typeof assessmentResult.strengths === 'undefined' ||
          typeof assessmentResult.potentialAreasForGrowth === 'undefined'
        ) {
          throw new Error("Incomplete assessment result");
        }
      } catch (error) {
        assessmentResult = { compatibilityScore: "N/A", strengths: [], potentialAreasForGrowth: [] };
      }
      return res.status(200).json({ isComplete: true, results: assessmentResult });
    } else {
      // Generate the next question
      const chatCompletion = await client.chat.completions.create({
        messages: [
          ...conversationHistory,
          { role: 'user', content: `That was question number ${questionCount}. Please provide the next question.` }
        ],
        model: 'o3-mini',
      });
      const result = extractJSON(chatCompletion.choices[0].message.content);
      if (!result) {
        throw new Error("Failed to parse AI response");
      }
      result.questionCount = newQuestionCount;
      conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });
      return res.status(200).json({
        ...result,
        conversationHistory
      });
    }
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}
