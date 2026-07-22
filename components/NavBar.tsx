"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-border">
      <div className="max-w-4xl mx-auto px-6 h-14 flex items-center justify-between">
        <Link href="/" className="font-display font-semibold text-sm">
          10th Prep
        </Link>
        <div className="flex items-center gap-4 text-sm font-mono">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link href="/dashboard" className="text-ink/70 hover:text-ink">
                Dashboard
              </Link>
              <button onClick={() => signOut({ callbackUrl: "/" })} className="text-ink/50 hover:text-ink">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="text-ink/70 hover:text-ink">
                Log in
              </Link>
              <Link href="/signup" className="bg-ink text-paper px-3 py-1.5 rounded-sm">
                Sign up
              </Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
