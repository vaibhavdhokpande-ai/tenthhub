"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { ChevronDown } from "lucide-react";

export default function NavBar() {
  const { data: session, status } = useSession();

  return (
    <header className="max-w-6xl mx-auto px-6 pt-6">
      <nav className="flex items-center justify-between">
        <Link href="/" className="font-display text-xl font-semibold">
          <span className="text-coral">Learn</span>
          <span className="text-ink">ify</span>
        </Link>

        <div className="hidden md:flex items-center gap-7 text-sm font-medium text-ink/80">
          <Link href="/subjects" className="flex items-center gap-1 hover:text-ink">
            Subjects <ChevronDown size={14} />
          </Link>
          <Link href="/courses" className="flex items-center gap-1 hover:text-ink">
            Courses <ChevronDown size={14} />
          </Link>
          <Link href="/subjects" className="hover:text-ink">
            Degrees
          </Link>
          <Link href="/courses" className="hover:text-ink">
            For business
          </Link>
        </div>

        <div className="flex items-center gap-3 text-sm font-medium">
          {status === "loading" ? null : session?.user ? (
            <>
              <Link
                href="/dashboard"
                className="px-4 py-2 rounded-full bg-white hover:bg-white/70 transition-colors"
              >
                Dashboard
              </Link>
              <button
                onClick={() => signOut({ callbackUrl: "/" })}
                className="px-5 py-2 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/signup"
                className="px-4 py-2 rounded-full bg-white hover:bg-white/70 transition-colors"
              >
                Sign up
              </Link>
              <Link
                href="/login"
                className="px-5 py-2 rounded-full bg-coral text-white hover:bg-coral-dark transition-colors"
              >
                Login
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
