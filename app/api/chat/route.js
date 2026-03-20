// app/api/chat/route.js
import { NextResponse } from "next/server";

export async function POST(req) {
  const { messages } = await req.json();

  const contents = messages.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const response = await fetch(
    // ✅ Updated model string — stable, 1000 req/day free tier
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.1-flash-lite-preview:generateContent?key=${process.env.GEMINI_API_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents,
        generationConfig: {
          maxOutputTokens: 1024,
          temperature: 0.7,
        },
      }),
    }
  );

  if (!response.ok) {
    const error = await response.json();
    // User-friendly error messages
    const msg = error.error?.message ?? "API error";
    const isQuota = msg.includes("quota") || msg.includes("RESOURCE_EXHAUSTED");
    return NextResponse.json(
      { error: isQuota
          ? "⚠️ Daily request limit reached. Please try again tomorrow or upgrade your Gemini plan."
          : `Error: ${msg}` },
      { status: response.status }
    );
  }

  const data = await response.json();
  const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return NextResponse.json({ role: "assistant", content: text });
}