import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      company,
      industry,
      name,
      phone,
      location,
      years,
      revenue,
      amount,
      situations,
      message,
    } = body;

    if (!company || !name || !phone) {
      return NextResponse.json(
        { error: "필수 항목을 입력해주세요." },
        { status: 400 },
      );
    }

    // 텔레그램 알림
    const telegramToken = process.env.TELEGRAM_BOT_TOKEN;
    const chatId = process.env.TELEGRAM_CHAT_ID;

    if (telegramToken && chatId) {
      const text = [
        "📋 *KPEC 무료상담 신청*",
        "",
        `🏢 회사명: ${company}`,
        `📌 업종: ${industry || "-"}`,
        `👤 대표자: ${name}`,
        `📞 연락처: ${phone}`,
        location ? `📍 소재지: ${location}` : "",
        years ? `⏳ 업력: ${years}` : "",
        revenue ? `💰 연매출: ${revenue}` : "",
        amount ? `🎯 필요자금: ${amount}` : "",
        situations?.length ? `📌 상황: ${situations.join(", ")}` : "",
        message ? `💬 문의: ${message}` : "",
      ]
        .filter(Boolean)
        .join("\n");

      await fetch(`https://api.telegram.org/bot${telegramToken}/sendMessage`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: chatId,
          text,
          parse_mode: "Markdown",
        }),
      });
    }

    return NextResponse.json({
      success: true,
      message: "상담 신청이 완료되었습니다.",
    });
  } catch {
    return NextResponse.json(
      { error: "서버 오류가 발생했습니다." },
      { status: 500 },
    );
  }
}
