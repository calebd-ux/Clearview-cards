const puppeteer = require('puppeteer-core');
const path = require('path');
const fs = require('fs');

const INPUT_FILE = process.argv[2];

if (!INPUT_FILE) {
    console.error("Usage: node scripts/generate_print_ready.js <path_to_html_file>");
    process.exit(1);
}

const OUTPUT_DIR = path.dirname(INPUT_FILE);
const baseName = path.basename(INPUT_FILE, '.html');

// Business card: 3.5" x 2" + 0.125" bleed = 3.75" x 2.25"
const CARD_W = 3.75;
const CARD_H = 2.25;
const CSS_W = Math.round(CARD_W * 96);  // 360px
const CSS_H = Math.round(CARD_H * 96);  // 216px
const SCALE = 4;  // 4x for high-res output (~384 DPI)

(async () => {
    // Try to find a valid Chrome path on macOS
    const chromePaths = [
        '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
        '/Applications/Brave Browser.app/Contents/MacOS/Brave Browser',
        '/Applications/Microsoft Edge.app/Contents/MacOS/Microsoft Edge'
    ];
    
    let executablePath = null;
    for (const cp of chromePaths) {
        if (fs.existsSync(cp)) {
            executablePath = cp;
            break;
        }
    }
    
    if (!executablePath) {
        console.error("Could not find a Chromium-based browser installed on this Mac.");
        process.exit(1);
    }

    const browser = await puppeteer.launch({
        executablePath,
        headless: 'new',
    });

    const htmlPath = path.resolve(INPUT_FILE);

    // --- FRONT ---
    const frontPage = await browser.newPage();
    await frontPage.setViewport({ width: CSS_W, height: CSS_H, deviceScaleFactor: SCALE });
    await frontPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await frontPage.evaluate((w, h) => {
        const allCards = document.querySelectorAll('.card');
        if (allCards[0]) {
            allCards[0].style.width = w + 'px';
            allCards[0].style.height = h + 'px';
        }
        if (allCards[1]) allCards[1].style.display = 'none';
    }, CSS_W, CSS_H);

    await frontPage.screenshot({
        path: path.join(OUTPUT_DIR, `${baseName}_front.png`),
        clip: { x: 0, y: 0, width: CSS_W, height: CSS_H },
    });
    console.log(`✓ Generated ${baseName}_front.png`);
    await frontPage.close();

    // --- BACK ---
    const backPage = await browser.newPage();
    await backPage.setViewport({ width: CSS_W, height: CSS_H, deviceScaleFactor: SCALE });
    await backPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });

    await backPage.evaluate((w, h) => {
        const allCards = document.querySelectorAll('.card');
        if (allCards[0]) allCards[0].style.display = 'none';
        if (allCards[1]) {
            allCards[1].style.display = 'flex'; // Ensure it's visible
            allCards[1].style.width = w + 'px';
            allCards[1].style.height = h + 'px';
        }
    }, CSS_W, CSS_H);

    await backPage.screenshot({
        path: path.join(OUTPUT_DIR, `${baseName}_back.png`),
        clip: { x: 0, y: 0, width: CSS_W, height: CSS_H },
    });
    console.log(`✓ Generated ${baseName}_back.png`);
    await backPage.close();

    // Generate PDF for printing
    const pdfPage = await browser.newPage();
    await pdfPage.goto(`file://${htmlPath}`, { waitUntil: 'networkidle0' });
    await pdfPage.pdf({
        path: path.join(OUTPUT_DIR, `${baseName}.pdf`),
        printBackground: true,
        width: `${CARD_W}in`,
        height: `${CARD_H}in`
    });
    console.log(`✓ Generated ${baseName}.pdf`);
    await pdfPage.close();

    await browser.close();
    console.log(`\nDone! Files generated in ${OUTPUT_DIR}`);
})();
