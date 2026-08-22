import Link from "next/link";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const [courses, categories] = await Promise.all([
    prisma.course.findMany({
      where: searchParams.category ? { category: { slug: searchParams.category } } : {},
      include: { category: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany(),
  ]);

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <h1 className="font-display text-4xl font-semibold mb-2">All courses</h1>
      <p className="text-ink/60 mb-8">{courses.length} courses across {categories.length} subjects.</p>

      <div className="flex flex-wrap gap-2 mb-10">
        <Link
          href="/courses"
          className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
            !searchParams.category ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-white/70"
          }`}
        >
          All
        </Link>
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/courses?category=${cat.slug}`}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
              searchParams.category === cat.slug ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-white/70"
            }`}
          >
            {cat.name}
          </Link>
        ))}
      </div>

      {courses.length === 0 ? (
        <p className="text-ink/50 py-12 text-center">No courses found in this subject yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {courses.map((c) => (
            <CourseCard
              key={c.slug}
              course={{
                slug: c.slug,
                title: c.title,
                summary: c.summary,
                level: c.level,
                category: { name: c.category.name, color: c.category.color },
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
