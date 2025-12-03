export default async function handler(req, res) {
  const { day } = req.query;

  const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

  // Desktop User-Agent (sehr wichtig!)
  const html = await fetch(url, {
    headers: {
      "User-Agent":
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    },
  }).then((r) => r.text());

  // Alle 3–5 stelligen Nummern extrahieren
  const matches = [...html.matchAll(/\b\d{3,5}\b/g)];
  const numbers = [...new Set(matches.map((m) => m[0]))];

  res.status(200).json({ day, numbers });
}
