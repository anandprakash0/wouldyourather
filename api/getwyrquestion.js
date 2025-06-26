// api/getwyrquestion.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(req, res) {
  // It gets this key from Vercel's environment variables (GEMINI_KEY)
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a "Would You Rather" style question. The question should be fun, thought-provoking, and suitable for a general audience. Provide the output in a strict JSON format with two keys: "optionA" and "optionB". Do not include any other text, explanations, or markdown formatting like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const question = JSON.parse(text);

    // Send a 200 OK status with the JSON question
    res.status(200).json(question);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Send a 500 Internal Server Error response if something fails
    res.status(500).json({ error: "Failed to generate question." });
  }
}