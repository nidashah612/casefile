const MODEL = "gemini-2.5-flash";
// Search grounding (tools: [{ google_search: {} }]) is not yet available for
// gemini-3.5-flash on this project (confirmed via the AI Studio "Search
// grounding" tool model picker, which lists 3.1/3/2.5/2 Flash variants but
// not 3.5). Grounded calls use a known-good model instead.
const GROUNDING_MODEL = "gemini-2.5-flash";

// Retries a Gemini fetch call on transient errors (503 = model overloaded,
// 429 = rate limited) with exponential backoff. Other statuses (400, 401,
// 404, etc.) are real problems and fail immediately instead of retrying.
async function fetchWithRetry(url, options, maxRetries = 3) {
  let lastErr;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    const res = await fetch(url, options);
    if (res.ok) return res;

    if ((res.status === 503 || res.status === 429) && attempt < maxRetries) {
      const delayMs = 1000 * Math.pow(2, attempt); // 1s, 2s, 4s
      await new Promise((r) => setTimeout(r, delayMs));
      continue;
    }

    const errText = await res.text().catch(() => "");
    lastErr = new Error(`Gemini API error (${res.status}): ${errText.slice(0, 500)}`);
    throw lastErr;
  }
  throw lastErr;
}

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

  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  const text =
    data?.candidates?.[0]?.content?.parts
      ?.filter((p) => !p.thought)
      ?.map((p) => p.text || "")
      .join("") || "";
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

  const res = await fetchWithRetry(
    `https://generativelanguage.googleapis.com/v1beta/models/${GROUNDING_MODEL}:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    }
  );

  const data = await res.json();
  const candidate = data?.candidates?.[0];
  const text =
    candidate?.content?.parts
      ?.filter((p) => !p.thought)
      ?.map((p) => p.text || "")
      .join("") || "";
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