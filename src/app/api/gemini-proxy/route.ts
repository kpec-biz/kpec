import { NextRequest, NextResponse } from "next/server";

export const maxDuration = 30;

// Worker → Vercel → Gemini API 프록시
// Worker가 한국 리전에서 실행되어 Gemini API 직접 호출 불가
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization");
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await req.json();
  const { model, prompt, json, image } = body as {
    model: string;
    prompt: string;
    json?: boolean;
    image?: boolean;
  };

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "No API key" }, { status: 500 });
  }

  const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

  const genConfig: Record<string, unknown> = image
    ? { responseModalities: ["IMAGE", "TEXT"] }
    : {
        temperature: 0.3,
        maxOutputTokens: 16384,
        ...(json ? { responseMimeType: "application/json" } : {}),
      };

  const res = await fetch(geminiUrl, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ parts: [{ text: prompt }] }],
      generationConfig: genConfig,
    }),
  });

  const data = await res.json();
  return NextResponse.json(data, { status: res.status });
}
