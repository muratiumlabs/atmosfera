/**
 * /api/config — Returns runtime config needed by the client.
 *
 * The Lyria real-time music SDK (`@google/genai` live.music) opens a WebSocket
 * directly from the browser and requires the API key at construction time.
 * This endpoint delivers that key without it ever touching source code or git.
 *
 * Note: restrict access with Vercel's deployment protection or an IP allowlist
 * if you want additional security beyond keeping the key out of source control.
 */
export default function handler(req, res) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }
  res.status(200).json({ lyriaKey: apiKey });
}
