import Link from "next/link";
import { notFound } from "next/navigation";
import { Star, Clock, Users, BadgeCheck } from "lucide-react";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import EnrollButton from "@/components/EnrollButton";

export default async function CourseDetailPage({ params }: { params: { slug: string } }) {
  const course = await prisma.course.findUnique({
    where: { slug: params.slug },
    include: {
      category: true,
      teacher: true,
      reviews: { include: { user: true }, orderBy: { createdAt: "desc" }, take: 5 },
    },
  });
  if (!course) notFound();

  const session = await getServerSession(authOptions);
  let initiallyEnrolled = false;
  if (session?.user) {
    const userId = (session.user as any).id as string;
    const existing = await prisma.enrollment.findUnique({
      where: { userId_courseId: { userId, courseId: course.id } },
    });
    initiallyEnrolled = !!existing;
  }

  return (
    <main className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/courses" className="text-sm text-ink/50 hover:text-ink">
        ← All courses
      </Link>

      <span className="inline-block mt-4 text-xs font-semibold bg-lavender/40 px-3 py-1 rounded-full">
        {course.category.name}
      </span>
      <h1 className="font-display text-3xl md:text-4xl font-semibold mt-3 mb-4">{course.title}</h1>
      <p className="text-ink/70 text-lg mb-6 max-w-2xl">{course.summary}</p>

      <div className="flex flex-wrap items-center gap-5 text-sm text-ink/60 mb-8">
        <span className="flex items-center gap-1">
          <Star size={15} className="text-sunshine-dark" fill="currentColor" /> {course.rating.toFixed(1)}
        </span>
        <span className="flex items-center gap-1">
          <Users size={15} /> {course.enrolledCount.toLocaleString()} enrolled
        </span>
        <span className="flex items-center gap-1">
          <Clock size={15} /> {course.durationHrs} hours
        </span>
        <span className="px-2 py-0.5 rounded-full bg-white border border-line">{course.level}</span>
      </div>

      <div className="grid md:grid-cols-3 gap-8">
        <div className="md:col-span-2">
          <h2 className="font-display text-xl font-semibold mb-3">About this course</h2>
          <p className="text-ink/70 whitespace-pre-line mb-8">{course.description}</p>

          <h2 className="font-display text-xl font-semibold mb-3">Instructor</h2>
          <div className="flex items-start gap-3 bg-white rounded-2xl p-4 mb-8">
            <div className="w-12 h-12 rounded-full bg-lavender flex items-center justify-center font-display font-semibold shrink-0">
              {course.teacher.name.charAt(0)}
            </div>
            <div>
              <p className="font-medium flex items-center gap-1">
                {course.teacher.name}
                {course.teacher.certified && <BadgeCheck size={15} className="text-coral" />}
              </p>
              {course.teacher.title && <p className="text-sm text-ink/60">{course.teacher.title}</p>}
            </div>
          </div>

          {course.reviews.length > 0 && (
            <>
              <h2 className="font-display text-xl font-semibold mb-3">Learner reviews</h2>
              <div className="space-y-3">
                {course.reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl p-4">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{r.user.name ?? "Learner"}</span>
                      <span className="flex items-center gap-0.5 text-xs text-sunshine-dark">
                        {Array.from({ length: r.rating }).map((_, i) => (
                          <Star key={i} size={12} fill="currentColor" />
                        ))}
                      </span>
                    </div>
                    {r.comment && <p className="text-sm text-ink/70">{r.comment}</p>}
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        <div>
          <div className="bg-white rounded-2xl p-5 sticky top-6">
            <p className="font-display text-2xl font-semibold mb-4">
              {course.price === 0 ? "Free" : `₹${course.price}`}
            </p>
            <EnrollButton courseId={course.id} price={course.price} initiallyEnrolled={initiallyEnrolled} />
            <p className="text-xs text-ink/50 mt-4 text-center">
              {course.durationHrs} hours · {course.level} · Certificate on completion
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
