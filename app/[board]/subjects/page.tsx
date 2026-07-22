import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SubjectsPage({
  params,
}: {
  params: { board: string };
}) {
  const board = await prisma.board.findUnique({
    where: { slug: params.board },
    include: { subjects: { orderBy: { order: "asc" }, include: { chapters: true } } },
  });

  if (!board) notFound();

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/" className="font-mono text-xs text-ink/50 hover:text-ink">
        ← Change board
      </Link>
      <h1 className="font-display text-3xl font-semibold mt-3 mb-1">
        {board.name} · Std X Subjects
      </h1>
      <p className="text-ink/60 mb-10">Select a subject to see its full chapter-wise syllabus.</p>

      <div className="grid sm:grid-cols-2 gap-3">
        {board.subjects.map((s) => (
          <Link
            key={s.id}
            href={`/${board.slug}/subjects/${s.slug}`}
            className="flex items-center justify-between border border-border rounded-sm px-5 py-4 bg-white/60 hover:bg-white transition-colors"
          >
            <span className="font-medium">{s.name}</span>
            <span className="font-mono text-xs text-ink/40">
              {s.chapters.length ? `${s.chapters.length} ch` : "coming soon"}
            </span>
          </Link>
        ))}
      </div>
    </main>
  );
}
