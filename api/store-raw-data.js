import fs from 'fs/promises';
import path from 'path';

export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { question, options, answer, style } = req.body;
  if (!question || !answer || !style) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const filePath = path.join(process.cwd(), 'data', 'raw', 'raw-data.json');
  let records = [];
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    records = JSON.parse(content);
    if (!Array.isArray(records)) {
      records = [];
    }
  } catch (err) {
    // If file doesn't exist or error reading, we start with an empty array.
    records = [];
  }
  records.push({ question, options, answer, style });
  try {
    await fs.writeFile(filePath, JSON.stringify(records, null, 2));
    return res.status(200).json({ success: true });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
}
