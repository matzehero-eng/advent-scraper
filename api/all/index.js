
import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const numbers = [];
    const today = Math.min(new Date().getDate(), 24); // max. 24 Tage

    for (let day = 1; day <= today; day++) {
      // WICHTIG: keine Jahreszahl!
      const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

      const response = await fetch(url);

      // Wenn der Tag noch nicht online ist oder es einen Fehler gibt: überspringen
      if (!response.ok) {
        continue;
      }

      const html = await response.text();
      const $ = cheerio.load(html);

      $("table tbody tr").each((i, row) => {
        const cols = $(row).find("td");
        if (cols.length < 3) return; // wir brauchen mindestens 3 Spalten

        // ab Spalte 3 stehen die Losnummern
        cols.slice(2).each((j, col) => {
          const txt = $(col).text().trim();

          // nur echte 3–4-stellige Nummern
          if (/^\d{3,4}$/.test(txt)) {
            numbers.push({
              day,
              number: txt,
            });
          }
        });
      });
    }

    res.status(200).json({
      day: "all",
      numbers,
    });
  } catch (err) {
    res.status(500).json({ error: String(err) });
  }
}
