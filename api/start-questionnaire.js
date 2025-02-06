import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.REACT_APP_OPENAI_API_KEY,
  // Remove dangerouslyAllowBrowser if not needed on server
});

const systemPrompt = `Your system prompt text … (same as in services/api.js)`;

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
  const { style } = req.body;
  if (!style) {
    return res.status(400).json({ error: "Missing style in request body" });
  }
  // Build initial conversation history
  const conversationHistory = [
    { role: 'system', content: systemPrompt },
    { role: 'user', content: `Let's start the questionnaire. Use a ${style} style for the questions.` }
  ];
  let questionCount = 0;
  try {
    const chatCompletion = await client.chat.completions.create({
      messages: conversationHistory,
      model: 'o3-mini',
    });
    const result = extractJSON(chatCompletion.choices[0].message.content);
    if (!result) {
      throw new Error("Failed to parse AI response");
    }
    questionCount = result.questionCount || 1;
    conversationHistory.push({ role: 'assistant', content: JSON.stringify(result) });
    return res.status(200).json({
      result,
      conversationHistory,
      questionCount
    });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
