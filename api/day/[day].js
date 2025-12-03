import cheerio from "cheerio";

export default async function handler(req, res) {
  const { day } = req.query;

  const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

  try {
    const html = await fetch(url).then(r => r.text());
    const $ = cheerio.load(html);

    const numbers = [];

    // Jede Gewinn-Row durchgehen
    $("table tbody tr").each((i, row) => {
      const cols = $(row).find("td");

      // wir brauchen nur echte Gewinnzeilen (mind. 3 Spalten)
      if (cols.length < 3) return;

      // ab Spalte 3 beginnen (Index 2)
      cols.slice(2).each((j, col) => {
        const txt = $(col).text().trim();

        // Nur echte Losnummern sind numerisch
        if (/^\d+$/.test(txt)) {
          numbers.push(txt);
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
