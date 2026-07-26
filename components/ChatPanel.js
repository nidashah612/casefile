"use client";
import { useState, useRef, useEffect } from "react";

export default function ChatPanel({ caseFile, stage, history, onNewMessages, onSaveDocument }) {
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const endRef = useRef(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [history, loading]);

  async function send(text) {
    const message = text ?? input;
    if (!message.trim() || loading) return;
    setError("");
    setInput("");
    const userMsg = { role: "user", content: message, ts: Date.now() };
    const nextHistory = [...history, userMsg];
    onNewMessages(nextHistory);
    setLoading(true);
    try {
      const res = await fetch("/api/strategize", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseFile, stage, history, message }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      const assistantMsg = { role: "assistant", content: data.reply, ts: Date.now() };
      onNewMessages([...nextHistory, assistantMsg]);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto space-y-4 mb-4 max-h-[420px] pr-1">
        {history.length === 0 && (
          <p className="text-sm text-ink-soft italic">
            Ask the strategist for advice on this stage, or ask it to draft the
            document you need to send.
          </p>
        )}
        {history.map((m, i) => (
          <div
            key={i}
            className={`text-sm leading-relaxed whitespace-pre-wrap p-3 rounded-sm border ${
              m.role === "user"
                ? "bg-paper-dark/60 border-hairline ml-6"
                : "bg-paper/60 border-ink/20 mr-2"
            }`}
          >
            <p className="font-mono text-[10px] uppercase tracking-widest text-ink-soft mb-1">
              {m.role === "user" ? "You" : "Case Strategist"}
            </p>
            {m.content}
            {m.role === "assistant" && (
              <button
                onClick={() => onSaveDocument(m.content)}
                className="mt-2 block font-mono text-[10px] uppercase tracking-wide text-ledger hover:text-oxblood transition-colors"
              >
                Save as document →
              </button>
            )}
          </div>
        ))}
        {loading && (
          <p className="text-sm text-ink-soft font-mono">Strategist is thinking…</p>
        )}
        {error && (
          <p className="text-sm text-oxblood font-mono">Error: {error}</p>
        )}
        <div ref={endRef} />
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        <button
          onClick={() => send(`Draft the document I need for this stage: "${stage.label}".`)}
          className="text-xs font-mono uppercase tracking-wide border border-ink/40 px-3 py-1.5 rounded-sm hover:border-oxblood hover:text-oxblood transition-colors"
        >
          Draft this stage's document
        </button>
        <button
          onClick={() => send("What should I do next, specifically, given where things stand?")}
          className="text-xs font-mono uppercase tracking-wide border border-ink/40 px-3 py-1.5 rounded-sm hover:border-oxblood hover:text-oxblood transition-colors"
        >
          What's my next move?
        </button>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send();
        }}
        className="flex gap-2"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask the strategist anything about this case…"
          className="flex-1 border border-hairline rounded-sm px-3 py-2 text-sm"
        />
        <button
          type="submit"
          disabled={loading}
          className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-oxblood transition-colors disabled:opacity-50"
        >
          Send
        </button>
      </form>
    </div>
  );
}
