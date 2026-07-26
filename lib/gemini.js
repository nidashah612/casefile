const MODEL = "gemini-3.1-flash";

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

/**
 * Calls generateContent with Gemini's Google Search grounding tool enabled.
 * Used specifically for the "find real lawyers/authorities" feature, where
 * we need the model to cite live search results rather than recall names
 * from its training data (which it would otherwise be prone to inventing).
 * Returns both the reply text and the list of source links it grounded on.
 */
export async function generateGroundedContent({ systemInstruction, turns }) {
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
    tools: [{ google_search: {} }],
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
  const candidate = data?.candidates?.[0];
  const text = candidate?.content?.parts?.map((p) => p.text || "").join("") || "";
  if (!text) {
    throw new Error(
      `Gemini returned no text (finishReason: ${candidate?.finishReason || "unknown"}).`
    );
  }

  const chunks = candidate?.groundingMetadata?.groundingChunks || [];
  const sources = chunks
    .map((c) => c.web && { title: c.web.title, uri: c.web.uri })
    .filter(Boolean);

  return { text, sources };
}
