import cheerio from "cheerio";

export default async function handler(req, res) {
  const { day } = req.query;
  const url = `https://saarbruecker-adventskalender.de/${day}-dezember/`;

  try {
    const response = await fetch(url);
    const html = await response.text();
    const $ = cheerio.load(html);

    const numbers = [];

    $("table tbody tr").each((i, row) => {
      const cols = $(row).find("td");

      // Wir ignorieren Zeilen mit weniger als 3 Spalten
      if (cols.length < 3) return;

      // Nur rechte Spalten ab Index 2 = echte Losnummern
      cols.slice(2).each((j, col) => {

        // Exakt den Zellen-Text extrahieren
        const cellText = $(col).clone().children().remove().end().text().trim();

        // Alle "isolierten" 3- oder 4-stelligen Zahlen extrahieren
        const matches = cellText.match(/\b\d{3,4}\b/g);

        if (matches) {
          numbers.push(...matches);
        }
      });
    });

    return res.status(200).json({ day, numbers });

  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
