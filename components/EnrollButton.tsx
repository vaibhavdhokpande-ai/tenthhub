"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function EnrollButton({
  courseId,
  price,
  initiallyEnrolled,
}: {
  courseId: string;
  price: number;
  initiallyEnrolled: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [enrolled, setEnrolled] = useState(initiallyEnrolled);
  const [loading, setLoading] = useState(false);

  async function handleEnroll() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setLoading(true);
    const res = await fetch("/api/enroll", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ courseId }),
    });
    if (res.ok) setEnrolled(true);
    setLoading(false);
  }

  if (enrolled) {
    return (
      <button
        disabled
        className="w-full px-6 py-3 rounded-full bg-white border border-line text-ink/60 font-medium"
      >
        ✓ Enrolled — continue learning
      </button>
    );
  }

  return (
    <button
      onClick={handleEnroll}
      disabled={loading}
      className="w-full px-6 py-3 rounded-full bg-coral text-white font-medium hover:bg-coral-dark transition-colors disabled:opacity-60"
    >
      {loading ? "Enrolling…" : price === 0 ? "Enrol for free" : `Enrol — ₹${price}`}
    </button>
  );
}
