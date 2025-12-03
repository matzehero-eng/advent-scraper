import * as cheerio from "cheerio";

export default async function handler(req, res) {
  try {
    let allNumbers = [];

    // Tage 1 bis heute durchgehen
    const today = new Date();
    const maxDay = Math.min(today.getDate(), 24);

    for (let day = 1; day <= maxDay; day++) {
      const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;
      const html = await fetch(url).then(r => r.text());
      const $ = cheerio.load(html);

      $("table tbody tr").each((i, row) => {
        const cols = $(row).find("td");

        if (cols.length < 3) return;

        cols.slice(2).each((j, col) => {
          const txt = $(col).text().trim();

          // Nur echte Losnummern (3–4 Stellen)
          if (/^\d{3,4}$/.test(txt)) {
            allNumbers.push({ day, number: txt });
          }
        });
      });
    }

    res.status(200).json({
      day: "all",
      numbers: allNumbers,
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
