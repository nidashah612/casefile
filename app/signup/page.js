"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function update(field, value) {
    setForm((f) => ({ ...f, [field]: value }));
  }

  async function submit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Could not create your account.");

      const signInRes = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
      });
      if (signInRes?.error) {
        throw new Error("Account created — please log in.");
      }
      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <main className="flex-1 max-w-sm mx-auto w-full px-6 py-16">
      <Link
        href="/"
        className="font-display font-700 text-2xl tracking-tight mb-10 inline-block"
      >
        Case<span className="italic">file</span>
      </Link>
      <p className="font-mono text-xs uppercase tracking-widest text-oxblood mb-2">
        Get started
      </p>
      <h1 className="font-display text-3xl font-700 mb-6">Create an account</h1>

      <form onSubmit={submit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
            className="w-full border border-hairline rounded-sm px-3 py-2"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={8}
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            className="w-full border border-hairline rounded-sm px-3 py-2"
          />
          <p className="text-xs text-ink-soft mt-1">At least 8 characters.</p>
        </div>

        {error && <p className="text-sm text-oxblood">{error}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-ink text-paper py-3 rounded-sm font-mono text-sm uppercase tracking-wide hover:bg-oxblood transition-colors disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
      </form>

      <p className="text-sm text-ink-soft mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-oxblood underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
