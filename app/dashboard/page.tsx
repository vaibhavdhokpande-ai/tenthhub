import Link from "next/link";
import { redirect } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user) redirect("/login");

  const userId = (session.user as any).id as string;

  const enrollments = await prisma.enrollment.findMany({
    where: { userId },
    include: { course: { include: { category: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <h1 className="font-display text-3xl font-semibold mb-1">
        Welcome back{session.user.name ? `, ${session.user.name}` : ""}
      </h1>
      <p className="text-ink/60 mb-10">{enrollments.length} courses in progress.</p>

      {enrollments.length === 0 ? (
        <div className="bg-white rounded-2xl p-8 text-center">
          <p className="text-ink/60 mb-4">You haven't enrolled in any courses yet.</p>
          <Link
            href="/courses"
            className="inline-block px-6 py-3 rounded-full bg-coral text-white font-medium hover:bg-coral-dark transition-colors"
          >
            Browse courses
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {enrollments.map((e) => (
            <Link
              key={e.id}
              href={`/courses/${e.course.slug}`}
              className="flex items-center justify-between bg-white rounded-2xl p-5 hover:bg-white/70 transition-colors"
            >
              <div>
                <span className="text-xs font-semibold bg-lavender/40 px-2 py-1 rounded-full">
                  {e.course.category.name}
                </span>
                <p className="font-display font-semibold mt-2">{e.course.title}</p>
              </div>
              <div className="text-right shrink-0 ml-4">
                <p className="font-mono text-sm text-ink/60 mb-1">{e.progress}%</p>
                <div className="w-24 h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-coral" style={{ width: `${e.progress}%` }} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}
    </main>
  );
}
