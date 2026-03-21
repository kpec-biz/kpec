import sharp from "sharp";
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { globSync } from "glob";
import { readFileSync } from "fs";
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
const pngs = globSync("public/images/**/*.png");
console.log(`Uploading ${pngs.length} images to ${BUCKET} via S3 API`);

for (const png of pngs) {
  const key = png.replace(/\\/g, "/").replace("public/", "").replace(/\.png$/i, ".webp");
  const tmpFile = `/tmp/_r2_${Date.now()}.webp`;
  await sharp(png).webp({ quality: 85 }).toFile(tmpFile);
  const body = readFileSync(tmpFile);

  await s3.send(
    new PutObjectCommand({
      Bucket: BUCKET,
      Key: key,
      Body: body,
      ContentType: "image/webp",
    })
  );
  console.log("OK:", key, `(${(body.length / 1024).toFixed(1)}KB)`);
}
console.log("Done!");
