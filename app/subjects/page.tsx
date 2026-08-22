import Link from "next/link";
import { prisma } from "@/lib/prisma";

const colorClasses: Record<string, string> = {
  lavender: "bg-lavender",
  sunshine: "bg-sunshine",
  coral: "bg-coral text-white",
  ink: "bg-ink text-white",
};

export default async function SubjectsPage() {
  const categories = await prisma.category.findMany({
    include: { _count: { select: { courses: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <main className="max-w-6xl mx-auto px-6 py-16">
      <span className="text-xs font-semibold bg-sunshine/50 px-3 py-1 rounded-full">Our subjects</span>
      <h1 className="font-display text-4xl font-semibold mt-3 mb-2">
        Explore top <span className="text-coral">subjects</span>
      </h1>
      <p className="text-ink/60 mb-10">We have a growing selection of subjects to study online.</p>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/subjects/${cat.slug}`}
            className={`rounded-2xl p-6 ${colorClasses[cat.color] ?? "bg-white"} hover:opacity-90 transition-opacity`}
          >
            <h2 className="font-display text-xl font-semibold mb-1">{cat.name}</h2>
            <p className="text-sm opacity-70">{cat._count.courses} courses</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
