import { load } from "cheerio";

export default async function handler(req, res) {
  try {
    const { day } = req.query;

    const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;
    const html = await fetch(url).then(r => r.text());

    const $ = load(html);

    const numbers = [];

    // Jede Tabellenzeile durchgehen
    $("table tbody tr").each((i, row) => {
      const cols = $(row).find("td");

      // Nur Zeilen mit mind. 3 Spalten = echte Gewinnzeilen
      if (cols.length < 3) return;

      // Ab Spalte 3 beginnen (Index 2)
      cols.slice(2).each((j, col) => {
        const t = $(col).text().trim();

        // Filter: nur echte Losnummern
        // ❗ Regeln:
        //  - rein numerisch
        //  - nicht der Preis (endet auf €)
        //  - nicht die laufende Gewinnnummer (1,2,3,...)
        //  - max 4 Stellen (keine 5-stelligen Produktpreise)
        if (/^\d+$/.test(t)) {
          const num = Number(t);

          if (
            num > 100 &&      // keine 1–99 (Preisangaben etc.)
            num < 10000       // max 4-stellig
          ) {
            numbers.push(t);
          }
        }
      });
    });

    res.status(200).json({
      day,
      numbers,
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
