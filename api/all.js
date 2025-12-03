// api/all.js

export default async function handler(req, res) {
  try {
    // Maximal 24 Tage im Adventskalender
    const today = Math.min(new Date().getDate(), 24);

    const baseUrl =
      process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : `http://${req.headers.host}`;

    const allNumbers = [];

    for (let day = 1; day <= today; day++) {
      const resp = await fetch(`${baseUrl}/api/day/${day}`);

      if (!resp.ok) {
        throw new Error(`Fehler beim Laden von /api/day/${day}: ${resp.status}`);
      }

      const data = await resp.json();
      const nums = data.numbers || [];

      for (const num of nums) {
        allNumbers.push({ day, number: num });
      }
    }

    res.status(200).json({
      day: "all",
      numbers: allNumbers,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: e.message });
  }
}
