#!/usr/bin/env node
// 이미지 WebP 변환 + Cloudflare R2 업로드
// 사용법: node scripts/optimize-images.mjs
// public/images PNG -> WebP 변환 -> R2 업로드

import { readFileSync } from "fs";
import { resolve, join, relative, dirname, basename, extname } from "path";
import { fileURLToPath } from "url";
import { readdirSync, statSync, mkdirSync, writeFileSync } from "fs";
import sharp from "sharp";
import {
  S3Client,
  PutObjectCommand,
  HeadObjectCommand,
} from "@aws-sdk/client-s3";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

// .env 파싱
function loadEnv() {
  const envPath = join(ROOT, ".env");
  const envContent = readFileSync(envPath, "utf-8");
  const vars = {};
  for (const line of envContent.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const eqIdx = trimmed.indexOf("=");
    if (eqIdx === -1) continue;
    vars[trimmed.slice(0, eqIdx)] = trimmed.slice(eqIdx + 1);
  }
  return vars;
}

const env = loadEnv();
const R2_PUBLIC_URL = env.R2_PUBLIC_URL;
const R2_ENDPOINT = env.R2_S3_ENDPOINT;
const R2_ACCESS_KEY = env.R2_ACCESS_KEY_ID;
const R2_SECRET_KEY = env.R2_SECRET_ACCESS_KEY;
const R2_BUCKET = "kpec-r2";

if (!R2_ENDPOINT || !R2_ACCESS_KEY || !R2_SECRET_KEY) {
  console.error("R2 credentials missing in .env");
  process.exit(1);
}

const s3 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY,
    secretAccessKey: R2_SECRET_KEY,
  },
});

// 이미지 파일 수집
function collectImages(dir, base = dir) {
  const files = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      files.push(...collectImages(full, base));
    } else if (/\.(png|jpg|jpeg)$/i.test(entry)) {
      files.push(full);
    }
  }
  return files;
}

// WebP 변환
async function convertToWebP(inputPath) {
  const buffer = await sharp(inputPath)
    .webp({ quality: 82, effort: 6 })
    .toBuffer();
  const info = await sharp(inputPath).metadata();
  return { buffer, width: info.width, height: info.height };
}

// R2 업로드
async function uploadToR2(key, buffer, contentType) {
  try {
    // 이미 존재하는지 확인
    await s3.send(new HeadObjectCommand({ Bucket: R2_BUCKET, Key: key }));
    console.log(`  ⏭  이미 존재: ${key}`);
    return true;
  } catch {
    // 존재하지 않으면 업로드
  }

  await s3.send(
    new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: key,
      Body: buffer,
      ContentType: contentType,
      CacheControl: "public, max-age=31536000, immutable",
    }),
  );
  return false;
}

async function main() {
  const imagesDir = join(ROOT, "public", "images");
  const files = collectImages(imagesDir);

  console.log(`\n📦 ${files.length}개 이미지 처리 시작\n`);

  const manifest = {};
  let uploaded = 0;
  let skipped = 0;

  for (const file of files) {
    const relPath = relative(join(ROOT, "public"), file);
    const webpKey = relPath.replace(extname(relPath), ".webp").replace(/\\/g, "/");
    const origSize = statSync(file).size;

    process.stdout.write(`  🔄 ${relPath} (${(origSize / 1024).toFixed(0)}KB) → `);

    try {
      const { buffer, width, height } = await convertToWebP(file);
      const webpSize = buffer.length;
      const savings = ((1 - webpSize / origSize) * 100).toFixed(0);

      const existed = await uploadToR2(webpKey, buffer, "image/webp");
      if (existed) {
        skipped++;
      } else {
        uploaded++;
        console.log(
          `${(webpSize / 1024).toFixed(0)}KB (-${savings}%) ✅`,
        );
      }

      manifest[`/${relPath.replace(/\\/g, "/")}`] = {
        webp: `${R2_PUBLIC_URL}/${webpKey}`,
        width,
        height,
      };
    } catch (err) {
      console.log(`❌ ${err.message}`);
    }
  }

  // 매니페스트 저장
  const manifestPath = join(ROOT, "src", "lib", "image-manifest.json");
  writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));

  console.log(`\n✅ 완료: ${uploaded}개 업로드, ${skipped}개 스킵`);
  console.log(`📄 매니페스트: src/lib/image-manifest.json\n`);
}

main().catch(console.error);
