"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

type Question = {
  id: string;
  text: string;
  options: string[];
  answer: number;
  explanation: string | null;
};

export default function QuizPanel({
  quizId,
  questions,
}: {
  quizId: string;
  questions: Question[];
}) {
  const { data: session } = useSession();
  const [selected, setSelected] = useState<Record<string, number>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saved, setSaved] = useState(false);

  const score = questions.reduce(
    (acc, q) => acc + (selected[q.id] === q.answer ? 1 : 0),
    0
  );

  function choose(qId: string, optIdx: number) {
    if (submitted) return;
    setSelected((prev) => ({ ...prev, [qId]: optIdx }));
  }

  async function handleSubmit() {
    setSubmitted(true);
    if (!session?.user) return; // scores only saved when logged in
    const res = await fetch("/api/quiz/submit", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ quizId, score, total: questions.length }),
    });
    if (res.ok) setSaved(true);
  }

  return (
    <div className="space-y-6">
      {questions.map((q, qi) => (
        <div key={q.id} className="border border-border rounded-sm p-4 bg-white/60">
          <p className="font-medium mb-3">
            {qi + 1}. {q.text}
          </p>
          <div className="space-y-2">
            {q.options.map((opt, oi) => {
              const isChosen = selected[q.id] === oi;
              const isCorrect = submitted && oi === q.answer;
              const isWrongChoice = submitted && isChosen && oi !== q.answer;
              return (
                <button
                  key={oi}
                  onClick={() => choose(q.id, oi)}
                  className={`w-full text-left px-3 py-2 rounded-sm border text-sm transition-colors
                    ${isChosen && !submitted ? "border-ruled-blue bg-ruled-blue/5" : "border-border"}
                    ${isCorrect ? "border-success-green bg-success-green/10" : ""}
                    ${isWrongChoice ? "border-margin-red bg-margin-red/10" : ""}
                  `}
                >
                  {opt}
                </button>
              );
            })}
          </div>
          {submitted && q.explanation && (
            <p className="text-xs text-ink/60 mt-3 rule-margin">{q.explanation}</p>
          )}
        </div>
      ))}

      {!submitted ? (
        <button
          onClick={handleSubmit}
          disabled={Object.keys(selected).length < questions.length}
          className="font-mono text-sm bg-ink text-paper px-5 py-2.5 rounded-sm disabled:opacity-30"
        >
          Submit Quiz
        </button>
      ) : (
        <div className="font-mono text-sm border-t border-border pt-4 space-y-1">
          <div>
            Score: <span className="font-semibold">{score}</span> / {questions.length}
          </div>
          {!session?.user && (
            <div className="text-xs text-ink/50">Log in to save your score and track progress.</div>
          )}
          {session?.user && saved && <div className="text-xs text-success-green">Score saved ✓</div>}
        </div>
      )}
    </div>
  );
}
