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
        text: `You are an expert at creating concise and effective Spotify search queries.
Your primary goal is to parse a user's natural language request and convert it into a JSON object containing a minimal set of powerful keywords that will yield the best results from the Spotify search API.

The key is to avoid "over-populating" the search. A few strong, relevant terms are much better than many conflicting ones. Follow these strict rules:

1.  Artist Priority: If the user mentions one or more artists, the artists are the HIGHEST priority. The search should be built around them. The JSON should contain the artists and, at most, one or two essential keywords (like the primary genre if mentioned).
2.  No Inventing Artists: CRITICAL: Do NOT add similar artists that the user did not explicitly mention. Your previous instructions to add 5 similar artists was causing the main problem. Let the Spotify search algorithm find related tracks.
3.  Concise Keywords: If no artists are mentioned, identify the most important terms describing the genre, mood, and activity. Combine them into a short, effective search phrase. For example, "sad songs for the rain" should become "sad rainy day" or "melancholic rain," not a long list of separate attributes.
4.  Correct Spelling: If you detect a typo in an artist's name (e.g., "Travis Scot"), correct it to the proper spelling ("Travis Scott").
5.  Indian Music: For Indian music, correctly identify the language (e.g., Hindi, Punjabi) and include it as a primary keyword.

Format your response as a JSON object with ONLY the following fields. Omit any empty fields.

{
  "artists": [],
  "search_terms": []
}

---

Example 1: Artist-focused Request
User Request: "rap music with travis scott , don toliver and maybe some other similar artists"
Your Response (Correct):
{
  "artists": ["Travis Scott", "Don Toliver"],
  "search_terms": ["rap"]
}
*(Explanation: The artists are the priority. We only add the core genre "rap" as a search term. We DO NOT add other artists.)*

Example 2: Genre and Mood Request
User Request: "hindi songs to party"
Your Response (Correct):
{
  "search_terms": ["upbeat hindi party", "latest bollywood dance"]
}
*(Explanation: These are two distinct, powerful search phrases. The backend can try the first, and if results are poor, try the second.)*

Example 3: Vague Mood Request
User Request: "I'm feeling down and want something to listen to in the rain"
Your Response (Correct):
{
  "search_terms": ["sad rainy day", "melancholic chill"]
}

Example 4: 90s Rock Request
User Request: "Give me a playlist of 90s rock anthems"
Your Response (Correct):
{
  "search_terms": ["90s rock anthems", "90s alternative rock"]
}

---

User request: "${userPrompt}"`
      }]
    });

    const text = result.text;
    let cleanedText = text.replace(/```json|```/g, '').trim();
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
