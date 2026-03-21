import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { readdirSync, readFileSync } from "fs";
import path from "path";
import { config } from "dotenv";

config();

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const BUCKET = "kpecr2";
const dir = "public/images/instagram";
const files = readdirSync(dir).filter(f => f.endsWith(".png")).sort();

console.log(`Uploading ${files.length} images to R2 (${BUCKET})`);

for (const file of files) {
  const filePath = path.join(dir, file);
  const key = `images/instagram/${file.replace(/\.png$/i, ".webp")}`;
  const webpBuf = await sharp(filePath).webp({ quality: 85 }).toBuffer();

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: webpBuf,
      ContentType: "image/webp",
      CacheControl: "public, max-age=31536000, immutable",
    })
  );
  console.log(`OK: ${key} (${(webpBuf.length / 1024).toFixed(1)}KB)`);
}
console.log("Done!");
