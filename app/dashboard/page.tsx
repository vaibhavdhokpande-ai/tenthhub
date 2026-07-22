import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const board = await prisma.board.findUnique({
    where: { slug: (session.user as any).board ?? "ssc" },
    include: {
      subjects: {
        orderBy: { order: "asc" },
        include: { chapters: { include: { topics: true } } },
      },
    },
  });

  const progressRows = await prisma.progress.findMany({ where: { userId, completed: true } });
  const completedTopicIds = new Set(progressRows.map((p) => p.topicId));

  const recentAttempts = await prisma.quizAttempt.findMany({
    where: { userId },
    orderBy: { takenAt: "desc" },
    take: 5,
    include: { quiz: { include: { topic: true } } },
  });

  return (
    <main className="max-w-3xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold mb-1">
        Welcome back{session.user.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-ink/60 mb-10 font-mono text-sm uppercase">
        {board?.name ?? "Board not set"}
      </p>

      <section className="mb-12">
        <h2 className="font-mono text-xs uppercase text-ink/50 mb-4">Subject progress</h2>
        <div className="space-y-3">
          {board?.subjects.map((s) => {
            const allTopics = s.chapters.flatMap((c) => c.topics);
            const done = allTopics.filter((t) => completedTopicIds.has(t.id)).length;
            const pct = allTopics.length ? Math.round((done / allTopics.length) * 100) : 0;
            return (
              <Link
                key={s.id}
                href={`/${board!.slug}/subjects/${s.slug}`}
                className="block border border-border rounded-sm p-4 bg-white/60 hover:bg-white transition-colors"
              >
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-sm">{s.name}</span>
                  <span className="font-mono text-xs text-ink/50">
                    {done}/{allTopics.length} topics
                  </span>
                </div>
                <div className="h-1.5 bg-border rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success-green"
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="font-mono text-xs uppercase text-ink/50 mb-4">Recent quiz attempts</h2>
        {recentAttempts.length === 0 ? (
          <p className="text-sm text-ink/50 border border-dashed border-border rounded-sm p-6">
            No quizzes attempted yet — pick a topic and test yourself.
          </p>
        ) : (
          <div className="space-y-2">
            {recentAttempts.map((a) => (
              <div
                key={a.id}
                className="flex justify-between items-center border border-border rounded-sm px-4 py-3 bg-white/60"
              >
                <span className="text-sm">{a.quiz.topic.title}</span>
                <span className="font-mono text-xs text-ink/50">
                  {a.score}/{a.total}
                </span>
              </div>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
