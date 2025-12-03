import cheerio from "cheerio";

export default async function handler(req, res) {
    const base = "https://saarbruecker-adventskalender.de";
    const allNumbers = {};

    for (let day = 1; day <= 24; day++) {
        const url = `${base}/${day}-dezember/`;
        try {
            const html = await fetch(url).then(r => r.text());
            const $ = cheerio.load(html);

            const arr = [];

            $("table tbody tr").each((i, row) => {
                const cols = $(row).find("td");
                if (cols.length < 3) return;

                cols.slice(2).each((j, col) => {
                    const txt = $(col).text().trim();
                    if (/^\d{1,5}$/.test(txt)) arr.push(txt);
                });
            });

            allNumbers[day] = arr;

        } catch (e) {
            allNumbers[day] = [];
        }
    }

    res.status(200).json(allNumbers);
}
