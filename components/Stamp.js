const CONFIG = {
  strong: { label: "Strong case", color: "text-ledger", rotate: -5 },
  moderate: { label: "Moderate case", color: "text-brass", rotate: 4 },
  weak: { label: "Needs more evidence", color: "text-oxblood", rotate: -3 },
};

export default function Stamp({ strength, animate = true, size = "md" }) {
  const cfg = CONFIG[strength] || CONFIG.moderate;
  const sizeClasses =
    size === "lg" ? "text-lg px-5 py-2.5" : "text-xs px-3 py-1.5";
  return (
    <div
      className={`stamp ${animate ? "stamp-animate" : ""} ${cfg.color} ${sizeClasses} font-semibold inline-block bg-paper/40`}
      style={{ transform: `rotate(${cfg.rotate}deg)` }}
    >
      {cfg.label}
    </div>
  );
}
