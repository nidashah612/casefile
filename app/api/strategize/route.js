import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateContent } from "@/lib/gemini";
import { STRATEGIST_CHAT_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseFile, stage, history, message } = await req.json();

    if (!message || !message.trim()) {
      return NextResponse.json({ error: "Message is empty." }, { status: 400 });
    }

    const systemInstruction = STRATEGIST_CHAT_SYSTEM_PROMPT({ caseFile, stage });

    const turns = [
      ...(history || []).map((h) => ({
        role: h.role === "assistant" ? "model" : "user",
        text: h.content,
      })),
      { role: "user", text: message },
    ];

    const reply = await generateContent({
      systemInstruction,
      turns,
      json: false,
    });

    return NextResponse.json({ reply });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong talking to the strategist." },
      { status: 500 }
    );
  }
}
