import Link from "next/link";

const boards = [
  {
    slug: "ssc",
    name: "SSC",
    full: "Maharashtra State Board",
    accent: "border-ruled-blue",
  },
  {
    slug: "cbse",
    name: "CBSE",
    full: "Central Board of Secondary Education",
    accent: "border-margin-red",
  },
];

export default function Home() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-20">
      <p className="font-mono text-sm text-margin-red uppercase tracking-widest mb-2">
        Std X · 2026-27
      </p>
      <h1 className="font-display text-5xl font-semibold mb-4 leading-tight">
        Pick up right where
        <br /> your syllabus left off.
      </h1>
      <p className="text-lg text-ink/70 mb-12 max-w-xl">
        Chapter-wise notes, video lessons and practice quizzes for every subject
        in your 10th Standard board exam.
      </p>

      <div className="grid sm:grid-cols-2 gap-4">
        {boards.map((b) => (
          <Link
            key={b.slug}
            href={`/${b.slug}/subjects`}
            className={`group border-2 ${b.accent} bg-white/60 rounded-sm p-6 hover:bg-white transition-colors`}
          >
            <div className="font-mono text-xs text-ink/50 mb-1">BOARD</div>
            <div className="font-display text-2xl font-semibold mb-1">{b.name}</div>
            <div className="text-sm text-ink/60">{b.full}</div>
            <div className="mt-4 text-sm font-medium group-hover:translate-x-1 transition-transform">
              Browse subjects →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
