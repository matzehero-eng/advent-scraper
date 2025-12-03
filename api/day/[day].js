import * as cheerio from "cheerio";

export const config = {
  runtime: "nodejs"
};

export default async function handler(req, res) {
  const { day } = req.query;
  const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const numbers = [];

    $("table tbody tr").each((i, row) => {
      const cols = $(row).find("td");

      // Nur echte Gewinnzeilen
      if (cols.length < 3) return;

      // Alle Losnummern stehen in den Spalten ab Index 2
      cols.slice(2).each((j, col) => {
        const txt = $(col).text().trim();

        // Einzelne Nummern per Split holen (Leerzeichen-getrennt)
        const parts = txt.split(/\s+/);

        parts.forEach(n => {
          if (/^\d+$/.test(n)) {
            numbers.push(n);
          }
        });
      });
    });

    res.status(200).json({ day, numbers });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
