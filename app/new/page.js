"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Header from "@/components/Header";
import { saveCase, newId } from "@/lib/storage";

const CATEGORIES = [
  "Landlord / rental",
  "Employer / workplace",
  "Consumer / vendor",
  "School / university",
  "Other",
];

export default function NewCase() {
  const router = useRouter();
  const [form, setForm] = useState({
    title: "",
    category: CATEGORIES[0],
    counterpart: "",
    location: "",
    wants: "",
    description: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not analyze the case.");

      const id = newId();
      const caseObj = {
        id,
        title: form.title || `${form.category} dispute`,
        category: form.category,
        counterpart: form.counterpart || "the other party",
        location: form.location,
        wants: form.wants,
        description: form.description,
        createdAt: Date.now(),
        analysis: data.analysis,
        currentStage: 0,
        timeline: [
          {
            id: newId(),
            date: new Date().toISOString().slice(0, 10),
            note: "Case opened in Casefile.",
          },
        ],
        chatByStage: {},
        documents: [],
      };
      saveCase(caseObj);
      router.push(`/case/${id}`);
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-2xl mx-auto w-full px-6 py-12">
        <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-2">
          Intake
        </p>
        <h1 className="font-display text-3xl font-700 mb-6">Open a case</h1>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium mb-1">
              Case title (optional)
            </label>
            <input
              value={form.title}
              onChange={(e) => update("title", e.target.value)}
              placeholder="e.g. Security deposit not returned"
              className="w-full border border-hairline rounded-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              value={form.category}
              onChange={(e) => update("category", e.target.value)}
              className="w-full border border-hairline rounded-sm px-3 py-2"
            >
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">
                Who's the other party?
              </label>
              <input
                value={form.counterpart}
                onChange={(e) => update("counterpart", e.target.value)}
                placeholder="e.g. Mr. Ahmed, my landlord"
                className="w-full border border-hairline rounded-sm px-3 py-2"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">
                Location (optional)
              </label>
              <input
                value={form.location}
                onChange={(e) => update("location", e.target.value)}
                placeholder="e.g. Rawalpindi, Pakistan"
                className="w-full border border-hairline rounded-sm px-3 py-2"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              What do you want to happen?
            </label>
            <input
              value={form.wants}
              onChange={(e) => update("wants", e.target.value)}
              placeholder="e.g. Get my full deposit back"
              className="w-full border border-hairline rounded-sm px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Describe what happened
            </label>
            <textarea
              value={form.description}
              onChange={(e) => update("description", e.target.value)}
              rows={7}
              placeholder="Give as much detail as you can: dates, what was agreed, what went wrong, any messages exchanged..."
              className="w-full border border-hairline rounded-sm px-3 py-2"
              required
            />
          </div>

          {error && <p className="text-sm text-oxblood">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-ink text-paper py-3 rounded-sm font-mono text-sm uppercase tracking-wide hover:bg-oxblood transition-colors disabled:opacity-50"
          >
            {loading ? "Analyzing your case…" : "Open case & analyze"}
          </button>
        </form>
      </main>
    </>
  );
}
