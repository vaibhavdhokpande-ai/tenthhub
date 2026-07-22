import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";

export default async function SubjectPage({
  params,
}: {
  params: { board: string; subject: string };
}) {
  const board = await prisma.board.findUnique({ where: { slug: params.board } });
  if (!board) notFound();

  const subject = await prisma.subject.findUnique({
    where: { boardId_slug: { boardId: board.id, slug: params.subject } },
    include: {
      chapters: {
        orderBy: { order: "asc" },
        include: { topics: { orderBy: { order: "asc" } } },
      },
    },
  });
  if (!subject) notFound();

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link href={`/${board.slug}/subjects`} className="font-mono text-xs text-ink/50 hover:text-ink">
        ← {board.name} subjects
      </Link>
      <h1 className="font-display text-3xl font-semibold mt-3 mb-10">{subject.name}</h1>

      {subject.chapters.length === 0 && (
        <p className="text-ink/50 border border-dashed border-border rounded-sm p-6">
          Syllabus for this subject is being added. Check back soon.
        </p>
      )}

      <div className="space-y-8">
        {subject.chapters.map((ch, i) => (
          <div key={ch.id} className="rule-margin">
            <div className="font-mono text-xs text-ink/40 mb-1">
              CHAPTER {String(i + 1).padStart(2, "0")}
            </div>
            <h2 className="font-display text-xl font-semibold mb-3">{ch.title}</h2>
            <ul className="space-y-1">
              {ch.topics.map((t) => (
                <li key={t.id}>
                  <Link
                    href={`/${board.slug}/subjects/${subject.slug}/${ch.slug}/${t.slug}`}
                    className="text-sm text-ruled-blue hover:underline underline-offset-2"
                  >
                    {t.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </main>
  );
}
