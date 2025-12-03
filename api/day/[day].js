import * as cheerio from "cheerio";

// Vercel braucht diese Runtime
export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  const { day } = req.query;

  const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

  try {
    // HTML laden
    const html = await fetch(url).then((r) => r.text());
    const $ = cheerio.load(html);

    const numbers = [];

    // Es gibt mehrere Tabellenzeilen pro Gewinn
    $("table tbody tr").each((i, row) => {
      const cols = $(row).find("td");

      // Mindestens 3 Spalten → sonst Header / leere Zeilen
      if (cols.length < 3) return;

      // Wir brauchen NUR die Losnummern, die ab Spalte 3 beginnen.
      // Spaltenindex 0 = Datum, 1 = Platz/Beschreibung.
      cols.slice(2).each((j, col) => {
        const txt = $(col).text().trim();

        // echte Losnummern sind rein numerisch
        if (/^\d+$/.test(txt)) {
          numbers.push(txt);
        }
      });
    });

    return res.status(200).json({
      day,
      numbers
    });

  } catch (e) {
    return res.status(500).json({
      error: e.message,
      step: "fehler im scraping",
    });
  }
}
