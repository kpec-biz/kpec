/**
 * 뉴스 콘텐츠 이미지 재생성 — gemini-3-pro-image-preview (실사 이미지)
 */
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { config } from "dotenv";
config();

const AIRTABLE_API = "https://api.airtable.com/v0";
const TABLE_ID = "tblqm10vZyVADXMKQ";
const IMAGE_MODEL = "gemini-3-pro-image-preview";

const s3 = new S3Client({
  region: "auto",
  endpoint: process.env.R2_S3_ENDPOINT,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  },
});

const imagePrompts = {
  NEWS_001: "A photo of a modern Korean government press conference room with official podium, Korean flag, and a large screen displaying budget numbers and financial charts. Professional press photography, clean composition, bright institutional lighting.",
  NEWS_002: "A photo of a Korean tech startup office with developers working on multiple monitors showing AI code and neural network visualizations. Modern open office, natural light, editorial photography style.",
  NEWS_003: "A close-up photo of a Korean venture business certification plaque hanging on an office wall, next to framed business licenses and awards. Professional corporate photography, warm ambient lighting, shallow depth of field.",
  NEWS_004: "A photo of ISO certification documents and quality management manuals spread on a conference table, with a quality auditor's clipboard and checklist visible. Professional documentary photography, overhead angle, clean and organized.",
  NEWS_005: "A photo of a cozy Korean small business cafe interior with a modern POS system, a barista preparing coffee, and a laptop showing online ordering dashboard. Warm editorial photography, inviting atmosphere, natural light from windows.",
};

async function generateImage(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${IMAGE_MODEL}:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { responseModalities: ["IMAGE", "TEXT"] },
      }),
    },
  );
  if (!res.ok) throw new Error(`Gemini error: ${res.status}`);
  const data = await res.json();
  const imgPart = (data.candidates?.[0]?.content?.parts || []).find(
    (p) => p.inlineData?.mimeType?.startsWith("image/"),
  );
  if (!imgPart) throw new Error("No image");
  return Buffer.from(imgPart.inlineData.data, "base64");
}

async function main() {
  console.log(`=== 뉴스 이미지 재생성 (${IMAGE_MODEL}) ===`);

  const res = await fetch(
    `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?filterByFormula=%7Bcategory%7D%3D%22%EB%89%B4%EC%8A%A4%22`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
  );
  const data = await res.json();
  const records = data.records || [];
  console.log(`${records.length}건 뉴스 레코드`);

  for (const record of records) {
    const id = record.fields.pblancId;
    const title = record.fields.title;
    const prompt = imagePrompts[id];
    if (!prompt) { console.log(`  ${id}: 건너뜀`); continue; }

    process.stdout.write(`  ${id}: ${title?.slice(0, 40)}...`);
    try {
      const imgBuffer = await generateImage(prompt);
      const imgKey = `thumbnails/${id}.png`;
      await s3.send(new PutObjectCommand({
        Bucket: "kpecr2", Key: imgKey, Body: imgBuffer,
        ContentType: "image/png", CacheControl: "public, max-age=604800",
      }));
      const imgUrl = `${process.env.R2_PUBLIC_URL}/${imgKey}`;
      await fetch(`${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}/${record.id}`, {
        method: "PATCH",
        headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}`, "Content-Type": "application/json" },
        body: JSON.stringify({ fields: { originalUrl: imgUrl } }),
      });
      console.log(` OK (${(imgBuffer.length / 1024).toFixed(0)}KB)`);
    } catch (e) { console.log(` FAIL: ${e.message.slice(0, 100)}`); }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log("\n완료!");
}

main().catch((e) => { console.error(e); process.exit(1); });
