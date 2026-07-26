import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateContent, stripJsonFence } from "@/lib/gemini";
import { CASE_ANALYST_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { title, category, counterpart, location, description, wants } =
      await req.json();

    if (!description || description.trim().length < 10) {
      return NextResponse.json(
        { error: "Describe what happened in a bit more detail." },
        { status: 400 }
      );
    }

    const userTurn = `Case title: ${title || "(none given)"}
Category: ${category || "(not specified)"}
Other party: ${counterpart || "(not specified)"}
Location: ${location || "(not specified)"}
What the person wants to happen: ${wants || "(not specified)"}

Description of the dispute:
${description}`;

    const raw = await generateContent({
      systemInstruction: CASE_ANALYST_SYSTEM_PROMPT,
      turns: [{ role: "user", text: userTurn }],
      json: true,
    });

    let parsed;
    try {
      parsed = JSON.parse(stripJsonFence(raw));
    } catch {
      return NextResponse.json(
        { error: "The AI response could not be read. Please try again." },
        { status: 502 }
      );
    }

    return NextResponse.json({ analysis: parsed });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Something went wrong analyzing the case." },
      { status: 500 }
    );
  }
}
