export default function EscalationLadder({ ladder, currentStage, onSelectStage }) {
  return (
    <ol className="relative pl-0">
      {ladder.map((step, i) => {
        const isPast = i < currentStage;
        const isCurrent = i === currentStage;
        return (
          <li key={i} className="relative pl-14 pb-7 last:pb-0">
            {i < ladder.length - 1 && (
              <span
                className="absolute left-[19px] top-9 bottom-0 w-[2px]"
                style={{
                  background: isPast ? "var(--ledger-green)" : "var(--hairline)",
                }}
              />
            )}
            <button
              onClick={() => onSelectStage(i)}
              className={`absolute left-0 top-0 w-10 h-10 rounded-full border-2 font-mono text-sm font-semibold flex items-center justify-center transition-colors
                ${
                  isCurrent
                    ? "bg-oxblood border-oxblood text-paper"
                    : isPast
                    ? "bg-ledger border-ledger text-paper"
                    : "bg-paper border-ink/50 text-ink-soft hover:border-oxblood"
                }`}
              aria-current={isCurrent ? "step" : undefined}
            >
              {i + 1}
            </button>
            <div
              className={`rounded-sm border p-4 ${
                isCurrent
                  ? "border-oxblood bg-paper-dark/60"
                  : "border-hairline bg-paper/50"
              }`}
            >
              <p className="font-display font-600 text-lg">{step.label}</p>
              <p className="text-sm text-ink-soft mt-1">{step.description}</p>
              {isCurrent && (
                <p className="mt-2 text-xs font-mono uppercase tracking-wide text-oxblood">
                  You are here
                </p>
              )}
            </div>
          </li>
        );
      })}
    </ol>
  );
}
