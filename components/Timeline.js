"use client";
import { useState } from "react";

export default function Timeline({ entries, onAdd }) {
  const [note, setNote] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const sorted = [...entries].sort((a, b) => new Date(b.date) - new Date(a.date));

  function submit(e) {
    e.preventDefault();
    if (!note.trim()) return;
    onAdd({ id: Date.now().toString(36), date, note: note.trim() });
    setNote("");
  }

  return (
    <div>
      <form onSubmit={submit} className="flex flex-col sm:flex-row gap-2 mb-5">
        <input
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="border border-hairline rounded-sm px-3 py-2 font-mono text-sm"
        />
        <input
          type="text"
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Log what happened (e.g. Sent first email, no reply yet)"
          className="flex-1 border border-hairline rounded-sm px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="bg-ink text-paper px-4 py-2 rounded-sm text-sm font-medium hover:bg-oxblood transition-colors"
        >
          Log entry
        </button>
      </form>

      {sorted.length === 0 ? (
        <p className="text-sm text-ink-soft italic">
          Nothing logged yet. Add a dated entry every time you send something,
          hear back, or gather evidence — this becomes your paper trail.
        </p>
      ) : (
        <ul>
          {sorted.map((e) => (
            <li key={e.id} className="ledger-row flex gap-4 py-3 text-sm">
              <span className="font-mono text-ink-soft w-24 shrink-0">
                {new Date(e.date).toLocaleDateString(undefined, {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span>{e.note}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
