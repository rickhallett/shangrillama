import fs from 'fs/promises';
import path from 'path';

export async function storeRawData({ question, options, answer, style }) {
  const filePath = path.join('data', 'raw', 'raw-data.json');
  let records = [];
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    records = JSON.parse(content);
    if (!Array.isArray(records)) {
      records = [];
    }
  } catch (err) {
    records = [];
  }
  records.push({ question, options, answer, style });
  try {
    await fs.writeFile(filePath, JSON.stringify(records, null, 2));
  } catch (err) {
    console.error("Failed to write raw data file", err);
    throw err;
  }
}
