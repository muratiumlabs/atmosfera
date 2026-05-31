/**
 * /api/weather — OpenWeatherMap proxy
 *
 * GET  ?lat=<number>&lon=<number>          → fetch by coordinates
 * GET  ?city=<string>                      → fetch by city name (fallback)
 *
 * Passes through the raw OWM JSON response unchanged.
 */
export default async function handler(req, res) {
  const apiKey = process.env.OPENWEATHER_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'OPENWEATHER_API_KEY is not configured' });
  }

  const { lat, lon, city } = req.query;

  let url;
  if (lat && lon) {
    url = `https://api.openweathermap.org/data/2.5/weather?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lon)}&units=metric&lang=tr&appid=${apiKey}`;
  } else {
    const cityName = city || 'Istanbul';
    url = `https://api.openweathermap.org/data/2.5/weather?q=${encodeURIComponent(cityName)}&units=metric&lang=tr&appid=${apiKey}`;
  }

  let upstream;
  try {
    upstream = await fetch(url);
  } catch (e) {
    return res.status(502).json({ error: 'Upstream fetch failed: ' + e.message });
  }

  const data = await upstream.json();
  res.status(upstream.status).json(data);
}
