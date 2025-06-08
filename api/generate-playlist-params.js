import { GoogleGenAI } from '@google/genai';

const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const userPrompt = req.body.prompt;

    if (!userPrompt) {
      return res.status(400).json({ error: "Prompt is required." });
    }

    const result = await genAI.models.generateContent({
      model: "gemini-2.0-flash",
      contents: [{
        text: `You are a music playlist expert analyzing user requests to create perfect Spotify playlists. ... (your full system prompt here) ... User request: "${userPrompt}"`
      }]
    });

    const text = result.text;
    let cleanedText = text.replace(/``````/g, '').trim();
    let playlistParams;
    try {
      playlistParams = JSON.parse(cleanedText);
    } catch (parseError) {
      return res.status(500).json({
        error: "Failed to process Gemini's response. The AI might not have returned valid JSON. Please try a different prompt.",
        geminiRawResponse: text
      });
    }
    res.json(playlistParams);
  } catch (error) {
    res.status(500).json({ error: "Internal server error when communicating with Gemini API." });
  }
}
