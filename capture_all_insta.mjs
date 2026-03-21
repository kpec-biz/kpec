import puppeteer from 'puppeteer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.join(__dirname, 'public/images/instagram');
fs.mkdirSync(outDir, { recursive: true });

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 30000, deviceScaleFactor: 2 });

// Capture from first HTML (12 banners)
const html1 = path.resolve(__dirname, 'instagram_banners.html');
const url1 = 'file:///' + html1.split(path.sep).join('/');
console.log('Loading:', url1);
await page.goto(url1, { waitUntil: 'networkidle2', timeout: 60000 });

const banners1 = await page.$$('.banner');
console.log(`Found ${banners1.length} banners in instagram_banners.html`);

for (let i = 0; i < banners1.length; i++) {
  const num = String(i + 1).padStart(2, '0');
  const filename = `insta-${num}.png`;
  const box = await banners1[i].boundingBox();
  if (box) {
    await page.screenshot({
      path: path.join(outDir, filename),
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    console.log(`Saved: ${filename} (${Math.round(box.width)}x${Math.round(box.height)})`);
  }
}

// Capture from second HTML (3 banners)
const html2 = path.resolve(__dirname, 'instagram_banners_v2.html');
const url2 = 'file:///' + html2.split(path.sep).join('/');
console.log('Loading:', url2);
await page.goto(url2, { waitUntil: 'networkidle2', timeout: 60000 });

const banners2 = await page.$$('.banner');
console.log(`Found ${banners2.length} banners in instagram_banners_v2.html`);

for (let i = 0; i < banners2.length; i++) {
  const num = String(12 + i + 1).padStart(2, '0');
  const filename = `insta-${num}.png`;
  const box = await banners2[i].boundingBox();
  if (box) {
    await page.screenshot({
      path: path.join(outDir, filename),
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    console.log(`Saved: ${filename} (${Math.round(box.width)}x${Math.round(box.height)})`);
  }
}

await browser.close();
console.log('All done! 15 banners captured.');
