import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { generateGroundedContent } from "@/lib/gemini";
import { LOCAL_RESOURCES_SYSTEM_PROMPT } from "@/lib/prompts";

export async function POST(req) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { caseFile } = await req.json();
    if (!caseFile?.location || !caseFile.location.trim()) {
      return NextResponse.json(
        {
          error:
            "This case doesn't have a location set. Add one to the case to look up local lawyers and authorities.",
        },
        { status: 400 }
      );
    }

    const userTurn = `Case category: ${caseFile.category || "(not specified)"}
Location: ${caseFile.location}
Other party: ${caseFile.counterpart || "(not specified)"}
What the person wants to happen: ${caseFile.wants || "(not specified)"}
Dispute description: ${caseFile.description || "(not given)"}`;

    const { text, sources } = await generateGroundedContent({
      systemInstruction: LOCAL_RESOURCES_SYSTEM_PROMPT,
      turns: [{ role: "user", text: userTurn }],
    });

    return NextResponse.json({ text, sources });
  } catch (err) {
    return NextResponse.json(
      { error: err.message || "Could not look up local resources." },
      { status: 500 }
    );
  }
}
