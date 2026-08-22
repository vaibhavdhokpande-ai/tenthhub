import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import CourseCard from "@/components/CourseCard";

export default async function SubjectDetailPage({ params }: { params: { slug: string } }) {
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: { courses: { include: { category: true } } },
  });
  if (!category) notFound();

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <Link href="/subjects" className="text-sm text-ink/50 hover:text-ink">
        ← All subjects
      </Link>
      <h1 className="font-display text-4xl font-semibold mt-3 mb-2">{category.name}</h1>
      <p className="text-ink/60 mb-10">{category.courses.length} courses in this subject.</p>

      {category.courses.length === 0 ? (
        <p className="text-ink/50 py-12 text-center">No courses in this subject yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {category.courses.map((c) => (
            <CourseCard
              key={c.slug}
              course={{
                slug: c.slug,
                title: c.title,
                summary: c.summary,
                level: c.level,
                category: { name: category.name, color: category.color },
              }}
            />
          ))}
        </div>
      )}
    </main>
  );
}
