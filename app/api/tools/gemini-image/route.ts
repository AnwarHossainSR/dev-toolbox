import { NextResponse } from "next/server";

type GeminiRequest = {
  toolSlug?: string;
  prompt?: string;
  imageMeta?: Record<string, string> | null;
};

export async function POST(req: Request) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Missing GEMINI_API_KEY" },
      { status: 500 },
    );
  }

  let body: GeminiRequest;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const prompt = body.prompt?.trim();
  if (!prompt) {
    return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
  }

  const toolSlug = body.toolSlug || "image-tool";
  const imageMetaText = body.imageMeta
    ? Object.entries(body.imageMeta)
        .map(([k, v]) => `${k}: ${v}`)
        .join("\n")
    : "No image metadata supplied.";

  const modelPrompt = [
    "You are an expert image-editing assistant for a browser-based toolbox.",
    `Current tool: ${toolSlug}`,
    "Provide concise, practical guidance with: 1) best settings, 2) step-by-step workflow, 3) quality pitfalls to avoid.",
    "If watermark/logo removal is requested, remind the user to only edit content they own or have rights to modify.",
    `Image metadata:\n${imageMetaText}`,
    `User request:\n${prompt}`,
  ].join("\n\n");

  try {
    const geminiRes = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: modelPrompt }],
            },
          ],
        }),
      },
    );

    const json = await geminiRes.json();
    if (!geminiRes.ok) {
      return NextResponse.json(
        { error: json?.error?.message || "Gemini request failed" },
        { status: geminiRes.status },
      );
    }

    const text =
      json?.candidates?.[0]?.content?.parts
        ?.map((p: { text?: string }) => p?.text || "")
        .join("\n")
        .trim() || "No response from Gemini.";

    return NextResponse.json({ text });
  } catch {
    return NextResponse.json(
      { error: "Failed to connect to Gemini API" },
      { status: 502 },
    );
  }
}
