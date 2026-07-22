"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";

export default function MarkComplete({
  topicId,
  initiallyCompleted,
}: {
  topicId: string;
  initiallyCompleted: boolean;
}) {
  const { data: session } = useSession();
  const router = useRouter();
  const [completed, setCompleted] = useState(initiallyCompleted);
  const [saving, setSaving] = useState(false);

  async function toggle() {
    if (!session?.user) {
      router.push("/login");
      return;
    }
    setSaving(true);
    const next = !completed;
    const res = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topicId, completed: next }),
    });
    if (res.ok) setCompleted(next);
    setSaving(false);
  }

  return (
    <button
      onClick={toggle}
      disabled={saving}
      className={`font-mono text-xs px-3 py-1.5 rounded-sm border transition-colors
        ${completed ? "border-success-green bg-success-green/10 text-success-green" : "border-border text-ink/60"}
      `}
    >
      {completed ? "✓ Completed" : "Mark as complete"}
    </button>
  );
}
