// api/getwyrquestion.js
const { GoogleGenerativeAI } = require('@google/generative-ai');

export default async function handler(req, res) {
  const genAI = new GoogleGenerativeAI(process.env.GEMINI_KEY);
  
  try {
    // ---- THE ONLY CHANGE IS ON THIS LINE ----
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash"});
    
    const prompt = `Generate a "Would You Rather" style question. The question should be fun, thought-provoking, and suitable for a general audience. Provide the output in a strict JSON format with two keys: "optionA" and "optionB". Do not include any other text, explanations, or markdown formatting like \`\`\`json.`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text().replace(/```json/g, "").replace(/```/g, "").trim();
    const question = JSON.parse(text);

    res.status(200).json(question);

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to generate question." });
  }
}