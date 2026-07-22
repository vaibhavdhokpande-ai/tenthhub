import Link from "next/link";
import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import ReactMarkdown from "react-markdown";
import QuizPanel from "@/components/QuizPanel";
import MarkComplete from "@/components/MarkComplete";

export default async function TopicPage({
  params,
}: {
  params: { board: string; subject: string; chapter: string; topic: string };
}) {
  const board = await prisma.board.findUnique({ where: { slug: params.board } });
  if (!board) notFound();

  const subject = await prisma.subject.findUnique({
    where: { boardId_slug: { boardId: board.id, slug: params.subject } },
  });
  if (!subject) notFound();

  const chapter = await prisma.chapter.findUnique({
    where: { subjectId_slug: { subjectId: subject.id, slug: params.chapter } },
  });
  if (!chapter) notFound();

  const topic = await prisma.topic.findUnique({
    where: { chapterId_slug: { chapterId: chapter.id, slug: params.topic } },
    include: { quiz: { include: { questions: true } }, resources: true },
  });
  if (!topic) notFound();

  const session = await getServerSession(authOptions);
  let initiallyCompleted = false;
  if (session?.user) {
    const userId = (session.user as any).id as string;
    const progress = await prisma.progress.findUnique({
      where: { userId_topicId: { userId, topicId: topic.id } },
    });
    initiallyCompleted = progress?.completed ?? false;
  }

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <Link
        href={`/${board.slug}/subjects/${subject.slug}`}
        className="font-mono text-xs text-ink/50 hover:text-ink"
      >
        ← {chapter.title}
      </Link>
      <div className="flex items-center justify-between mt-3 mb-8">
        <h1 className="font-display text-3xl font-semibold">{topic.title}</h1>
        <MarkComplete topicId={topic.id} initiallyCompleted={initiallyCompleted} />
      </div>

      {topic.videoUrl && (
        <div className="aspect-video mb-8 border border-border rounded-sm overflow-hidden">
          <iframe
            className="w-full h-full"
            src={topic.videoUrl}
            title={topic.title}
            allowFullScreen
          />
        </div>
      )}

      <article className="prose prose-neutral max-w-none mb-12 prose-headings:font-display prose-a:text-ruled-blue">
        <ReactMarkdown>{topic.notesMd}</ReactMarkdown>
      </article>

      {topic.resources.length > 0 && (
        <div className="mb-12 border-t border-border pt-6">
          <h3 className="font-mono text-xs uppercase text-ink/50 mb-3">Resources</h3>
          <ul className="space-y-1">
            {topic.resources.map((r) => (
              <li key={r.id}>
                <a href={r.url} className="text-sm text-ruled-blue hover:underline">
                  {r.label}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {topic.quiz && topic.quiz.questions.length > 0 && (
        <div className="border-t border-border pt-8">
          <h3 className="font-display text-xl font-semibold mb-4">Practice Quiz</h3>
          <QuizPanel
            quizId={topic.quiz.id}
            questions={topic.quiz.questions.map((q) => ({
              id: q.id,
              text: q.text,
              options: q.options,
              answer: q.answer,
              explanation: q.explanation,
            }))}
          />
        </div>
      )}
    </main>
  );
}
