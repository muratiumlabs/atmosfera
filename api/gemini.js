/**
 * /api/gemini — Gemini generateContent proxy
 *
 * POST body: { model: string, contents: string, config?: { temperature?, responseMimeType? } }
 * Response:  { text: string }
 */
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'GEMINI_API_KEY is not configured' });
  }

  const { model, contents, config = {} } = req.body || {};

  if (!model || !contents) {
    return res.status(400).json({ error: 'Missing required fields: model, contents' });
  }

  const generationConfig = {};
  if (config.temperature !== undefined) generationConfig.temperature = config.temperature;
  if (config.responseMimeType)          generationConfig.responseMimeType = config.responseMimeType;

  let upstream;
  try {
    upstream = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ role: 'user', parts: [{ text: contents }] }],
          generationConfig,
        }),
      }
    );
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed: ' + e.message });
  }

  if (!upstream.ok) {
    const errBody = await upstream.text();
    return res.status(upstream.status).json({ error: errBody });
  }

  const data = await upstream.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';

  res.status(200).json({ text });
}
