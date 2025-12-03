// api/all/index.js
export default async function handler(req, res) {

  // --- CORS FIX ---
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  // --- ENDE CORS FIX ---

  try {
    const today = Math.min(new Date().getDate(), 24); // max. 24 Tage
    const allNumbers = [];

    // FÜR JEDEN TAG BIS HEUTE /api/day/:day AUFRUFEN
    for (let day = 1; day <= today; day++) {
      // feste Domain nehmen – das ist dein Vercel-Projekt
      const url = `https://advent-scraper.vercel.app/api/day/${day}`;

      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Fehler beim Laden von /api/day/${day}: ${response.status}`);
      }

      const data = await response.json();

      // Alle Zahlen dieses Tages in die Gesamt-Liste schieben
      for (const num of data.numbers) {
        allNumbers.push({ day, number: num });
      }
    }

    res.status(200).json({
      day: "all",
      numbers: allNumbers,
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
