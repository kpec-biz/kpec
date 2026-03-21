import puppeteer from 'puppeteer';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 5000 });

const htmlPath = path.resolve(__dirname, 'instagram_banners_v2.html');
const fileUrl = 'file:///' + htmlPath.split(path.sep).join('/');
console.log('Loading:', fileUrl);
await page.goto(fileUrl, { waitUntil: 'networkidle2', timeout: 30000 });

const banners = await page.$$('.banner');
const names = ['insta-01-export', 'insta-02-document', 'insta-03-newfund'];

for (let i = 0; i < banners.length && i < 3; i++) {
  const box = await banners[i].boundingBox();
  if (box) {
    await page.screenshot({
      path: path.join(__dirname, 'public/images/instagram', names[i] + '.png'),
      clip: { x: box.x, y: box.y, width: box.width, height: box.height }
    });
    console.log('Saved:', names[i] + '.png', Math.round(box.width) + 'x' + Math.round(box.height));
  }
}

await browser.close();
console.log('Done!');
