"use client";
import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Header from "@/components/Header";
import Stamp from "@/components/Stamp";
import EscalationLadder from "@/components/EscalationLadder";
import ChatPanel from "@/components/ChatPanel";
import Timeline from "@/components/Timeline";
import Documents from "@/components/Documents";
import Resources from "@/components/Resources";
import { getCase, saveCase, deleteCase, newId } from "@/lib/storage";

const TABS = ["Overview", "Strategy", "Resources", "Timeline", "Documents"];

export default function CaseDetail() {
  const { id } = useParams();
  const router = useRouter();
  const [c, setC] = useState(null);
  const [tab, setTab] = useState("Overview");
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    getCase(id).then((found) => {
      if (!found) {
        setNotFound(true);
        return;
      }
      if (!found.chatByStage) found.chatByStage = {};
      if (!found.documents) found.documents = [];
      setC(found);
    });
  }, [id]);

  function update(patch) {
    setC((prev) => {
      const next = { ...prev, ...patch };
      saveCase(next).catch(() => {});
      return next;
    });
  }

  if (notFound) {
    return (
      <>
        <Header />
        <main className="flex-1 max-w-2xl mx-auto px-6 py-16 text-center">
          <p className="font-display text-2xl mb-2">Case not found.</p>
          <p className="text-ink-soft">
            Either it was deleted, or it belongs to a different account than
            the one you're logged into.
          </p>
        </main>
      </>
    );
  }

  if (!c) return null;

  const { analysis } = c;
  const stage = analysis.ladder[c.currentStage] || analysis.ladder[0];
  const stageKey = String(c.currentStage);
  const stageHistory = c.chatByStage[stageKey] || [];

  return (
    <>
      <Header />
      <main className="flex-1 max-w-4xl mx-auto w-full px-6 py-10">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-1">
              Case No. {c.id.slice(0, 6).toUpperCase()} · {c.category}
            </p>
            <h1 className="font-display text-3xl sm:text-4xl font-700">{c.title}</h1>
            <p className="text-ink-soft mt-1">vs. {c.counterpart}</p>
          </div>
          <Stamp strength={analysis.strength} size="lg" />
        </div>

        <div className="flex gap-1 mb-8 border-b border-hairline">
          {TABS.map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 font-mono text-xs uppercase tracking-wide -mb-px border-b-2 transition-colors ${
                tab === t
                  ? "border-oxblood text-oxblood"
                  : "border-transparent text-ink-soft hover:text-ink"
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {tab === "Overview" && (
          <div className="space-y-8">
            <section>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-2">
                Strategist's read on your position
              </p>
              <p className="leading-relaxed">{analysis.strengthReason}</p>
            </section>
            <section>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-2">
                Summary
              </p>
              <p className="leading-relaxed">{analysis.summary}</p>
            </section>
            <section>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-2">
                Evidence to gather
              </p>
              <ul className="list-disc pl-5 space-y-1">
                {analysis.missingEvidence.map((ev, i) => (
                  <li key={i}>{ev}</li>
                ))}
              </ul>
            </section>
            <section className="border-l-2 border-oxblood pl-4">
              <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-1">
                Recommended first action
              </p>
              <p className="leading-relaxed">{analysis.firstAction}</p>
            </section>
            <p className="text-xs text-ink-soft italic border-t border-hairline pt-4">
              {analysis.disclaimer}
            </p>
          </div>
        )}

        {tab === "Strategy" && (
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-4">
                Escalation ladder
              </p>
              <EscalationLadder
                ladder={analysis.ladder}
                currentStage={c.currentStage}
                onSelectStage={(i) => update({ currentStage: i })}
              />
            </div>
            <div className="border border-hairline rounded-sm p-4 bg-paper-dark/30 h-fit md:sticky md:top-6">
              <p className="font-mono text-xs uppercase tracking-widest text-ink-soft mb-3">
                Working stage {c.currentStage + 1}: {stage.label}
              </p>
              <ChatPanel
                caseFile={c}
                stage={stage}
                history={stageHistory}
                onNewMessages={(hist) =>
                  update({
                    chatByStage: { ...c.chatByStage, [stageKey]: hist },
                  })
                }
                onSaveDocument={(content) => {
                  const doc = {
                    id: newId(),
                    title: `${stage.label} — draft`,
                    content,
                    stage: c.currentStage,
                    createdAt: Date.now(),
                  };
                  update({ documents: [...c.documents, doc] });
                }}
              />
            </div>
          </div>
        )}

        {tab === "Resources" && <Resources caseFile={c} onUpdate={update} />}

        {tab === "Timeline" && (
          <Timeline
            entries={c.timeline}
            onAdd={(entry) => update({ timeline: [...c.timeline, entry] })}
          />
        )}

        {tab === "Documents" && <Documents documents={c.documents} />}

        <div className="mt-16 pt-6 border-t border-hairline">
          <button
            onClick={async () => {
              if (confirm("Delete this case? This can't be undone.")) {
                await deleteCase(c.id);
                router.push("/");
              }
            }}
            className="text-xs font-mono uppercase tracking-wide text-ink-soft hover:text-oxblood transition-colors"
          >
            Delete this case
          </button>
        </div>
      </main>
    </>
  );
}
