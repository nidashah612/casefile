"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import CaseCard from "@/components/CaseCard";
import { listCases } from "@/lib/storage";

export default function Home() {
  const [cases, setCases] = useState(null);

  useEffect(() => {
    listCases().then(setCases);
  }, []);

  return (
    <>
      <Header />
      <main className="flex-1 max-w-5xl mx-auto w-full px-6 py-12">
        <div className="mb-10">
          <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-2">
            Your filing cabinet
          </p>
          <h1 className="font-display text-4xl sm:text-5xl font-700 leading-tight max-w-2xl">
            Turn an unfair situation into a documented case.
          </h1>
          <p className="mt-4 text-ink-soft max-w-xl leading-relaxed">
            A landlord, a boss, a shop that won't refund you, a grade you think
            is wrong. Open a case, and the strategist assesses your position,
            tells you what evidence to gather, and drafts what to send at
            every step — from the first polite ask to the last resort.
          </p>
        </div>

        {cases === null ? null : cases.length === 0 ? (
          <div className="border-2 border-dashed border-hairline rounded-sm p-10 text-center">
            <p className="font-display text-xl mb-2">No cases open yet.</p>
            <p className="text-ink-soft mb-6">
              Your cases are saved to your account, so they're here whenever
              you log back in — from any device.
            </p>
            <Link
              href="/new"
              className="inline-block bg-ink text-paper px-5 py-2.5 rounded-sm font-mono text-sm uppercase tracking-wide hover:bg-oxblood transition-colors"
            >
              Open your first case
            </Link>
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-5">
            {cases.map((c) => (
              <CaseCard key={c.id} c={c} />
            ))}
          </div>
        )}
      </main>
      <footer className="border-t border-hairline py-6 text-center text-xs font-mono text-ink-soft uppercase tracking-widest">
        Casefile — not a substitute for a real lawyer
      </footer>
    </>
  );
}
