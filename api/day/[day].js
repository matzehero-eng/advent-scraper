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

      // Jede Zelle durchgehen
      tds.each((j, col) => {
        const txt = $(col).text().trim();

        // Hol alle Zahlen aus dem TD
        const found = txt.match(/\b\d+\b/g);
        if (found) {
          numbers.push(...found);
        }
      });
    });

    // Jetzt müssen wir Datum, Gewinnnummer (1–8) und Europreise entfernen
    numbers = numbers.filter(n => {
      const num = Number(n);

      // Datum (01.12.2025)
      if (num === 1 || num === 12 || num === 2025) return false;

      // Gewinnnummern (1–24)
      if (num >= 1 && num <= 24) return false;

      // Europreise erkennen wir daran, dass sie in Klammern stehen → vorher schon rausgefiltert
      // Aber falls doch mal 30 oder 50 auftauchen:
      if ([30, 50, 744, 330].includes(num)) return false;

      // Richtige Losnummern sind 3- oder 4-stellig
      return n.length >= 3 && n.length <= 4;
    });

    res.status(200).json({
      day,
      numbers,
    });

  } catch (e) {
    res.status(500).json({ error: e.message });
  }
}
