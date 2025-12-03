import { load } from "cheerio";

export default async function handler(req, res) {
  try {
    const { day } = req.query;

    const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;
    const html = await fetch(url).then(r => r.text());
    const $ = load(html);

    let numbers = [];

    $("table tbody tr").each((i, row) => {
      const tds = $(row).find("td");

      // Nur echte Losnummer-Spalten: ab Index 3
      tds.slice(3).each((j, col) => {
        const txt = $(col).text().trim();

        const found = txt.match(/\b\d+\b/g);
        if (found) {
          numbers.push(...found);
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
