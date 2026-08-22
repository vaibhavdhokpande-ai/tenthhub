"use client";

import { useState, useMemo } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import CourseCard from "./CourseCard";

type CourseForCard = {
  slug: string;
  title: string;
  summary: string;
  level: string;
  isNew: boolean;
  isRecommended: boolean;
  enrolledCount: number;
  category: { name: string; color: string };
};

export default function CourseTabs({ courses }: { courses: CourseForCard[] }) {
  const tabs = [
    { key: "new", label: "New courses", filter: (c: CourseForCard) => c.isNew },
    { key: "recommended", label: "Recommended", filter: (c: CourseForCard) => c.isRecommended },
    { key: "popular", label: "Most popular", filter: () => true },
  ] as const;

  const [active, setActive] = useState<(typeof tabs)[number]["key"]>("new");
  const [page, setPage] = useState(0);

  const filtered = useMemo(() => {
    const tab = tabs.find((t) => t.key === active)!;
    let list = courses.filter(tab.filter);
    if (active === "popular") list = [...list].sort((a, b) => b.enrolledCount - a.enrolledCount);
    return list;
  }, [active, courses]);

  const perPage = 4;
  const pageCount = Math.max(1, Math.ceil(filtered.length / perPage));
  const visible = filtered.slice(page * perPage, page * perPage + perPage);

  function switchTab(key: (typeof tabs)[number]["key"]) {
    setActive(key);
    setPage(0);
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
        <div className="flex gap-2 flex-wrap">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => switchTab(t.key)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                active === t.key ? "bg-ink text-white" : "bg-white text-ink/70 hover:bg-white/70"
              }`}
            >
              {t.label} ({courses.filter(t.filter).length})
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center disabled:opacity-30"
          >
            <ArrowLeft size={16} />
          </button>
          <span className="text-sm font-mono text-ink/60">
            {page + 1}/{pageCount}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pageCount - 1, p + 1))}
            disabled={page >= pageCount - 1}
            className="w-9 h-9 rounded-full bg-white flex items-center justify-center disabled:opacity-30"
          >
            <ArrowRight size={16} />
          </button>
        </div>
      </div>

      {visible.length === 0 ? (
        <p className="text-ink/50 text-sm py-12 text-center">No courses in this tab yet.</p>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {visible.map((c) => (
            <CourseCard key={c.slug} course={c} />
          ))}
        </div>
      )}
    </div>
  );
}
