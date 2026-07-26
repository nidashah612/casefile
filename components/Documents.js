"use client";
import { useState } from "react";

export default function Documents({ documents }) {
  const [openId, setOpenId] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  if (documents.length === 0) {
    return (
      <p className="text-sm text-ink-soft italic">
        No documents saved yet. In the Strategy tab, ask the strategist to
        draft something, then click "Save as document."
      </p>
    );
  }

  function copy(doc) {
    navigator.clipboard?.writeText(doc.content);
    setCopiedId(doc.id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <ul className="space-y-3">
      {documents
        .slice()
        .reverse()
        .map((doc) => (
          <li key={doc.id} className="border border-hairline rounded-sm bg-paper/50">
            <button
              onClick={() => setOpenId(openId === doc.id ? null : doc.id)}
              className="w-full flex items-center justify-between px-4 py-3 text-left"
            >
              <span>
                <span className="font-display font-600">{doc.title}</span>
                <span className="block font-mono text-[11px] text-ink-soft uppercase tracking-wide">
                  {new Date(doc.createdAt).toLocaleDateString()}
                </span>
              </span>
              <span className="font-mono text-xs text-ink-soft">
                {openId === doc.id ? "hide" : "view"}
              </span>
            </button>
            {openId === doc.id && (
              <div className="border-t border-hairline p-4">
                <pre className="whitespace-pre-wrap text-sm font-body leading-relaxed">
                  {doc.content}
                </pre>
                <button
                  onClick={() => copy(doc)}
                  className="mt-3 text-xs font-mono uppercase tracking-wide border border-ink/40 px-3 py-1.5 rounded-sm hover:border-oxblood hover:text-oxblood transition-colors"
                >
                  {copiedId === doc.id ? "Copied!" : "Copy text"}
                </button>
              </div>
            )}
          </li>
        ))}
    </ul>
  );
}
