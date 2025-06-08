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
        text: `You are a music playlist expert analyzing user requests to create perfect Spotify playlists. THe user will make a request in natural language , for example : "rap music with travis scott , don toliver and other artists" so from this you can extract genre as rap , artists are travis scott , don toliver , and because the genre is rap you also have to add in other current or all time popular rap artists in the artists field as well , aim for atleast 5 similar artists apart from the ones mentioned that are popular in the genre.
When a user makes a playlist request, extract the following details with high accuracy:

1. Primary genre (required): Identify the main musical genre (e.g., pop, rock, hip-hop, bollywood, punjabi, indie)
2. Sub-genres (if mentioned): More specific styles (e.g., trap, lofi, folk, qawwali)
3. Moods/Vibes: Emotional qualities (e.g., romantic, energetic, melancholic, festive)
4. Activities/Contexts: When/where the playlist will be played (e.g., workout, party, study, driving)
5. Artists: Any specifically mentioned artists
6. Era/Decade: Time period (e.g., 90s, 2000s, current, golden era)
7. Language: If specified (e.g., hindi, punjabi, english)
8. Special characteristics: Any unique features mentioned (e.g., remixes, acoustic, instrumental)

For Indian music requests specifically:
- Always identify the language (hindi, tamil, punjabi, etc.) even if not explicitly stated
- Recognize common Indian music terms (e.g., "filmy" = bollywood, "desi" = contemporary indian pop)
- For party requests, default to upbeat, danceable tracks unless specified otherwise
If an artist or several artists are mentioned , just identify the artists in the prompt and fill the artists section with their names and identify the genre the artists are famous for and fill that in.
If at any point you cannot find or derive any of the parameteres just ignore and move on. If any typing erros are made with artist names , identify the closest one and consider that as your artist.
Keep in mind that your output will be the input in the search bar , which is just a concatenation of the individual json attributes , so make the json attributes in such a way that when combined they make a coherent query ( avoid over population )
Format your response as JSON with ONLY these fields (omit any empty categories):
{
  "genre": "",
  "subgenres": [],
  "moods": [],
  "activities": [],
  "artists": [],
  "era": "",
  "language": "",
  "characteristics": []
}

Example request: "hindi songs to party"
Example response:
{
  "genre": "bollywood",
  "subgenres": ["dance"],
  "moods": ["energetic", "festive"],
  "activities": ["party"],
  "era": "current",
  "language": "hindi",
  "characteristics": ["upbeat"]
}

    
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
