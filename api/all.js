import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    const results = [];

    const toDay = Math.min(new Date().getDate(), 24);

    for (let day = 1; day <= toDay; day++) {
      const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

      $("table tbody tr").each((i, row) => {
        const cols = $(row).find("td");
        if (cols.length < 3) return;

        cols.slice(2).each((i, col) => {
          const txt = $(col).text().trim();

          // Nur echte Losnummern 3–4-stellig
          if (/^\d{3,4}$/.test(txt)) {
            results.push({ day, number: txt });
          }
        });
      });
    }

    res.status(200).json({
      day: "all",
      numbers: results
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
