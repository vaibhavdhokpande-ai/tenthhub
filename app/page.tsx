import Link from "next/link";
import { Star, ArrowRight } from "lucide-react";
import { prisma } from "@/lib/prisma";
import CourseTabs from "@/components/CourseTabs";
import HeroIllustration from "@/components/HeroIllustration";

export default async function Home() {
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ include: { _count: { select: { courses: true } } } }),
  ]);

  const totalLearners = courses.reduce((sum, c) => sum + c.enrolledCount, 0);
  const avgRating = courses.length
    ? (courses.reduce((s, c) => s + c.rating, 0) / courses.length).toFixed(1)
    : "5.0";

  return (
    <main className="max-w-6xl mx-auto px-6">
      {/* ---------- Hero ---------- */}
      <section className="grid md:grid-cols-2 gap-8 items-center pt-16 pb-20">
        <div>
          <h1 className="font-display text-5xl md:text-6xl font-semibold leading-[1.05] mb-6">
            Find the right <span className="text-coral">course</span> for you
          </h1>
          <p className="text-ink/70 text-lg mb-8 max-w-md">
            See your personalised recommendations based on your interests and goals.
          </p>
          <div className="flex items-center gap-6 mb-12">
            <Link
              href="/courses"
              className="px-6 py-3 rounded-full bg-coral text-white font-medium hover:bg-coral-dark transition-colors"
            >
              Find course
            </Link>
            <Link href="/subjects" className="flex items-center gap-1 text-coral font-medium hover:underline">
              View subjects <ArrowRight size={16} />
            </Link>
          </div>

          <div className="grid grid-cols-3 gap-3 max-w-lg">
            <div className="bg-white rounded-2xl p-4">
              <span className="text-xs font-medium bg-lavender/40 px-2 py-1 rounded-full">Education</span>
              <p className="text-sm text-ink/60 mt-3">subjects</p>
              <p className="font-display text-2xl font-semibold">{categories.length}</p>
            </div>
            <div className="bg-lavender rounded-2xl p-4">
              <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded-full">Online</span>
              <p className="text-sm text-ink/70 mt-3">courses</p>
              <p className="font-display text-2xl font-semibold">{courses.length}</p>
            </div>
            <div className="bg-sunshine rounded-2xl p-4">
              <span className="text-xs font-medium bg-white/50 px-2 py-1 rounded-full flex items-center gap-1 w-fit">
                <Star size={12} fill="currentColor" /> {avgRating}
              </span>
              <p className="text-sm text-ink/70 mt-3">learners enrolled</p>
              <p className="font-display text-2xl font-semibold">
                {totalLearners >= 1000 ? `${Math.round(totalLearners / 1000)}k+` : totalLearners}
              </p>
            </div>
          </div>
        </div>

        <HeroIllustration />
      </section>

      {/* ---------- Courses ---------- */}
      <section id="courses" className="pb-20">
        <div className="flex items-end justify-between mb-8 flex-wrap gap-4">
          <div>
            <span className="text-xs font-semibold bg-sunshine/50 px-3 py-1 rounded-full">
              Our courses
            </span>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3">
              Take your knowledge a degree further
            </h2>
          </div>
          <p className="text-ink/60 max-w-xs text-sm">
            Make education work for you with flexible online courses from leading instructors.
          </p>
        </div>
        <CourseTabs
          courses={courses.map((c) => ({
            slug: c.slug,
            title: c.title,
            summary: c.summary,
            level: c.level,
            isNew: c.isNew,
            isRecommended: c.isRecommended,
            enrolledCount: c.enrolledCount,
            category: { name: c.category.name, color: c.category.color },
          }))}
        />
      </section>

      {/* ---------- CTA banner ---------- */}
      <section className="pb-20">
        <div className="bg-sunshine rounded-3xl p-10 md:p-14 grid md:grid-cols-2 gap-8 items-center overflow-hidden">
          <div>
            <h2 className="font-display text-3xl md:text-4xl font-semibold mb-4 leading-tight">
              Upgrade your skills with <span className="text-coral">free</span> online courses
            </h2>
            <p className="text-ink/70 mb-6 max-w-md">
              Ready to gain in-demand skills to kickstart your career? Learnify Click Start offers
              free courses to help you get your first experience in your chosen profession.
            </p>
            <Link
              href="/courses"
              className="inline-block px-6 py-3 rounded-full bg-ink text-white font-medium hover:bg-ink/80 transition-colors"
            >
              Start now
            </Link>
          </div>
          <div className="hidden md:flex justify-center">
            <svg viewBox="0 0 200 200" className="w-48 h-48" fill="none">
              <rect x="20" y="20" width="75" height="75" rx="10" fill="#F0603F" />
              <rect x="105" y="20" width="75" height="75" rx="10" fill="#171717" />
              <rect x="20" y="105" width="75" height="75" rx="10" fill="#B9A9F0" />
              <circle cx="140" cy="140" r="37" fill="white" stroke="#171717" strokeWidth="3" />
            </svg>
          </div>
        </div>
      </section>

      {/* ---------- Subjects ---------- */}
      <section className="pb-8">
        <span className="text-xs font-semibold bg-sunshine/50 px-3 py-1 rounded-full">
          Our subjects
        </span>
        <h2 className="font-display text-3xl md:text-4xl font-semibold mt-3 mb-3">
          Explore top <span className="text-coral">subjects</span>
        </h2>
        <p className="text-ink/60 max-w-md mb-8">
          We have a growing selection of subjects to study across in-demand fields.
        </p>

        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat, i) => (
            <Link
              key={cat.id}
              href={`/subjects/${cat.slug}`}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                i === 0 ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-white/70"
              }`}
            >
              {cat.name}
            </Link>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/courses"
            className="px-6 py-3 rounded-full bg-coral text-white font-medium hover:bg-coral-dark transition-colors"
          >
            Explore courses
          </Link>
          <Link href="/subjects" className="flex items-center gap-1 text-coral font-medium hover:underline">
            View all subjects <ArrowRight size={16} />
          </Link>
        </div>
      </section>
    </main>
  );
}
