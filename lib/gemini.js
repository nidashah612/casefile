const MODEL = "gemini-3.5-flash";

/**
 * Calls the Gemini API's generateContent endpoint.
 * @param {string} systemInstruction - the system prompt
 * @param {Array<{role: 'user'|'model', text: string}>} turns - conversation turns
 * @param {boolean} json - whether to force JSON output
 */
export async function generateContent({ systemInstruction, turns, json = false }) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not set. Add it as an environment variable on your hosting provider."
    );
  }

  const body = {
    systemInstruction: {
      parts: [{ text: systemInstruction }],
    },
    contents: turns.map((t) => ({
      role: t.role,
      parts: [{ text: t.text }],
    })),
    ...(json
      ? { generationConfig: { responseMimeType: "application/json" } }
      : {}),
  };

  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Gemini API error (${res.status}): ${errText.slice(0, 500)}`);
  }

  const data = await res.json();
  const text = data?.candidates?.[0]?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) {
    const finishReason = data?.candidates?.[0]?.finishReason;
    throw new Error(
      `Gemini returned no text (finishReason: ${finishReason || "unknown"}).`
    );
  }
  return text;
}

export function stripJsonFence(text) {
  return text
    .trim()
    .replace(/^```json\s*/i, "")
    .replace(/^```\s*/, "")
    .replace(/```\s*$/, "")
    .trim();
}
