"use client";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function Header() {
  const { data: session } = useSession();

  return (
    <header className="border-b-2 border-ink/80 bg-paper-dark/40">
      <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <span
            className="stamp text-oxblood px-2 py-0.5 text-xs font-semibold inline-block group-hover:rotate-0 transition-transform"
            style={{ transform: "rotate(-4deg)" }}
          >
            Exhibit A
          </span>
          <span className="font-display font-700 text-2xl tracking-tight">
            Case<span className="italic">file</span>
          </span>
        </Link>
        <nav className="flex items-center gap-5 font-mono text-xs uppercase tracking-wider text-ink-soft">
          <Link href="/" className="hover:text-oxblood transition-colors">
            All cases
          </Link>
          <Link
            href="/new"
            className="bg-ink text-paper px-3 py-1.5 rounded-sm hover:bg-oxblood transition-colors"
          >
            + New case
          </Link>
          {session?.user?.email && (
            <>
              <span className="normal-case text-ink-soft/80 hidden sm:inline">
                {session.user.email}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: "/login" })}
                className="hover:text-oxblood transition-colors"
              >
                Log out
              </button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
