import Link from "next/link";
import Stamp from "./Stamp";

export default function CaseCard({ c }) {
  const stageLabel =
    c.analysis?.ladder?.[c.currentStage ?? 0]?.label || "Getting started";
  return (
    <Link
      href={`/case/${c.id}`}
      className="folder-tab block bg-paper-dark border border-ink/70 border-b-4 p-5 pt-6 hover:-translate-y-0.5 hover:shadow-[4px_4px_0_0_rgba(33,28,19,0.25)] transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-widest text-ink-soft">
            Case No. {c.id.slice(0, 6).toUpperCase()}
          </p>
          <h3 className="font-display text-xl font-600 mt-1">{c.title}</h3>
          <p className="text-sm text-ink-soft mt-1">vs. {c.counterpart}</p>
        </div>
        {c.analysis?.strength && (
          <Stamp strength={c.analysis.strength} animate={false} />
        )}
      </div>
      <div className="mt-4 pt-3 border-t border-hairline flex items-center justify-between text-xs font-mono uppercase tracking-wide text-ink-soft">
        <span>Stage: {stageLabel}</span>
        <span>{new Date(c.createdAt).toLocaleDateString()}</span>
      </div>
    </Link>
  );
}
