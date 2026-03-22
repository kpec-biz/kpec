/**
 * 분석 콘텐츠 이미지 재생성 — gemini-3-pro-image-preview (실사 이미지)
 * 규칙: 태극기/한글문자 금지, 영어 최소화, 한국인/한국배경, 실사 사진
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

// 실사 이미지 프롬프트 — 한국인/한국배경, 태극기/한글/영어 텍스트 없음
const imagePrompts = {
  ANALYSIS_001: "Professional photograph of a Korean businesswoman in her 40s reviewing financial documents at a modern Seoul office conference room. Glass windows showing city skyline. Documents and laptop on table. Natural daylight, editorial photography, Canon 5D Mark IV, 35mm lens, f/2.8. No text, no flags, no logos.",
  ANALYSIS_002: "Professional photograph of a Korean male entrepreneur in his 30s shaking hands with a government official in a bright modern Korean office lobby. Both wearing business suits. Clean interior with plants. Natural warm lighting, editorial style. No text, no flags, no signage.",
  ANALYSIS_003: "Professional aerial photograph of a modern Korean industrial complex with clean factory buildings and green landscaping in Gyeonggi Province. Blue sky with light clouds. Automated production line visible through large windows. Drone photography, editorial quality. No text, no logos.",
  ANALYSIS_004: "Professional photograph of a Korean businesswoman in her 30s checking a wall calendar in a modern Seoul co-working space. Laptop and coffee on desk. Morning sunlight through large windows. Shallow depth of field focusing on calendar. Editorial photography. No text overlay, no flags.",
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
  if (!imgPart) throw new Error("No image in response");
  return Buffer.from(imgPart.inlineData.data, "base64");
}

async function main() {
  console.log(`=== 분석 이미지 재생성 (${IMAGE_MODEL}, 실사) ===`);

  const res = await fetch(
    `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}?filterByFormula=%7Bcategory%7D%3D%22%EB%B6%84%EC%84%9D%22`,
    { headers: { Authorization: `Bearer ${process.env.AIRTABLE_PAT}` } },
  );
  const data = await res.json();
  const records = data.records || [];
  console.log(`${records.length}건`);

  for (const record of records) {
    const id = record.fields.pblancId;
    const title = record.fields.title;
    const prompt = imagePrompts[id];
    if (!prompt) { console.log(`  ${id}: 프롬프트 없음`); continue; }

    process.stdout.write(`  ${id}: ${title?.slice(0, 40)}...`);
    try {
      const imgBuffer = await generateImage(prompt);

      // 캐시 우회를 위해 v2 키 사용
      const imgKey = `thumbnails/${id}_v2.png`;
      await s3.send(new PutObjectCommand({
        Bucket: "kpecr2",
        Key: imgKey,
        Body: imgBuffer,
        ContentType: "image/png",
        CacheControl: "public, max-age=604800",
      }));
      const imgUrl = `${process.env.R2_PUBLIC_URL}/${imgKey}`;

      // Airtable 업데이트
      await fetch(
        `${AIRTABLE_API}/${process.env.AIRTABLE_BASE_ID}/${TABLE_ID}/${record.id}`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${process.env.AIRTABLE_PAT}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ fields: { originalUrl: imgUrl } }),
        },
      );
      console.log(` OK (${(imgBuffer.length / 1024).toFixed(0)}KB)`);
    } catch (e) {
      console.log(` FAIL: ${e.message.slice(0, 100)}`);
    }
    await new Promise((r) => setTimeout(r, 3000));
  }
  console.log("\n완료!");
}

main().catch((e) => { console.error(e); process.exit(1); });
