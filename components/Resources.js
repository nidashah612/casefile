"use client";
import { useState } from "react";

export default function Resources({ caseFile, onUpdate }) {
  const cached = caseFile.localResources;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const hasLocation = !!(caseFile.location && caseFile.location.trim());

  async function fetchResources() {
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/resources", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ caseFile }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not look up local resources.");
      onUpdate({
        localResources: { text: data.text, sources: data.sources, fetchedAt: Date.now() },
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-l-2 border-oxblood pl-4">
        <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-1">
          Verify before you rely on this
        </p>
        <p className="text-sm text-ink-soft leading-relaxed">
          These come from a live web search the AI ran on your behalf — not a
          vetted directory. Confirm any lawyer's license, current contact
          details, and standing (e.g. with the local bar association) before
          reaching out or paying anyone.
        </p>
      </div>

      {!hasLocation && (
        <p className="text-sm text-ink-soft">
          This case doesn't have a location set yet. Add one from the
          Overview tab's case details to look up lawyers and authorities near
          you.
        </p>
      )}

      {hasLocation && !cached && !loading && (
        <button
          onClick={fetchResources}
          className="bg-ink text-paper px-5 py-2.5 rounded-sm font-mono text-sm uppercase tracking-wide hover:bg-oxblood transition-colors"
        >
          Find lawyers &amp; authorities for this case
        </button>
      )}

      {loading && (
        <p className="text-ink-soft text-sm font-mono uppercase tracking-wide">
          Searching…
        </p>
      )}

      {error && <p className="text-sm text-oxblood">{error}</p>}

      {cached && (
        <div className="space-y-6">
          <div className="whitespace-pre-wrap leading-relaxed">{cached.text}</div>

          {cached.sources?.length > 0 && (
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-2">
                Sources
              </p>
              <ul className="space-y-1 text-sm">
                {cached.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.uri}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-oxblood underline break-all"
                    >
                      {s.title || s.uri}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="text-xs text-ink-soft">
            Looked up {new Date(cached.fetchedAt).toLocaleString()}.{" "}
            <button onClick={fetchResources} disabled={loading} className="text-oxblood underline">
              Search again
            </button>
          </p>
        </div>
      )}
    </div>
  );
}
