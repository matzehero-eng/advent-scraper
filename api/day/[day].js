import { chromium } from "playwright";

// optional, aber hilft Vercel zu wissen, dass es Node ist
export const config = {
  runtime: "nodejs18.x"
};

export default async function handler(req, res) {
  const day = req.query.day || "1";

  try {
    const targetUrl = `https://saarbruecker-adventskalender.de/${day}-dezember/`;
    console.log("Scraping URL:", targetUrl);

    const browser = await chromium.launch({
      headless: true,
      args: ["--no-sandbox", "--disable-setuid-sandbox"]
    });

    const page = await browser.newPage({
      viewport: { width: 390, height: 844 }
    });

    // Seite laden
    await page.goto(targetUrl, { waitUntil: "networkidle" });
    // ein bisschen extra warten, falls JS noch bastelt
    await page.waitForTimeout(2000);

    const html = await page.content();

    await browser.close();

    // --- Losnummern extrahieren ----------------------
    // Erstmal alles, was wie 3-5 stellige Zahl aussieht:
    const rawNumbers = [...html.matchAll(/\b\d{3,5}\b/g)].map(m => m[0]);

    // Eindeutige Werte
    const numbers = [...new Set(rawNumbers)];

    res.status(200).json({
      day,
      count: numbers.length,
      numbers
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.toString(), day });
  }
}
