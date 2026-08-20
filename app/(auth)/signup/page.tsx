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
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/auth/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
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
      <h1 className="font-display text-3xl font-semibold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          placeholder="Full name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          className="w-full bg-white rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-coral"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          className="w-full bg-white rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-coral"
        />
        <input
          type="password"
          placeholder="Password (min 6 characters)"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={6}
          className="w-full bg-white rounded-full px-5 py-3 text-sm outline-none focus:ring-2 focus:ring-coral"
        />
        {error && <p className="text-sm text-coral">{error}</p>}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-coral text-white rounded-full py-3 font-medium hover:bg-coral-dark transition-colors disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Sign up"}
        </button>
      </form>
      <p className="text-sm text-ink/60 mt-6">
        Already have an account?{" "}
        <Link href="/login" className="text-coral font-medium hover:underline">
          Log in
        </Link>
      </p>
    </main>
  );
}
