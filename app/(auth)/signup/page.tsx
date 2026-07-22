"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function SignupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [board, setBoard] = useState("ssc");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password, board }),
    });
    const data = await res.json();

    if (!res.ok) {
      setError(data.error ?? "Something went wrong.");
      setLoading(false);
      return;
    }

    const signInRes = await signIn("credentials", { email, password, redirect: false });
    setLoading(false);

    if (signInRes?.error) {
      router.push("/login");
      return;
    }
    router.push("/dashboard");
  }

  return (
    <main className="max-w-sm mx-auto px-6 py-20">
      <h1 className="font-display text-2xl font-semibold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-white"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-white"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full border border-border rounded-sm px-3 py-2 text-sm bg-white"
        />
        <div className="flex gap-3">
          {[
            { v: "ssc", l: "SSC" },
            { v: "cbse", l: "CBSE" },
          ].map((b) => (
            <label
              key={b.v}
              className={`flex-1 text-center text-sm font-mono border rounded-sm py-2 cursor-pointer
                ${board === b.v ? "border-ruled-blue bg-ruled-blue/5" : "border-border"}`}
            >
              <input
                type="radio"
                name="board"
                value={b.v}
                checked={board === b.v}
                onChange={() => setBoard(b.v)}
                className="hidden"
              />
              {b.l}
            </label>
          ))}
        </div>
        {error && <p className="text-sm text-margin-red">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full font-mono text-sm bg-ink text-paper px-4 py-2.5 rounded-sm disabled:opacity-50"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-ruled-blue hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
