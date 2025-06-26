// api/getwyrquestion.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

// This is a default Vercel function export
export default async function handler(req, res) {
  // It will get this key from Vercel's environment variables
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const prompt = `Generate a "Would You Rather" question in a strict JSON format with keys "optionA" and "optionB".`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const question = JSON.parse(text);

    // Send a successful response with the question object
    res.status(200).json(question);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    // Send an error response
    res.status(500).json({ error: "Failed to generate question." });
  }
}