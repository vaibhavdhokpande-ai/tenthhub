import Link from "next/link";
import { BookOpen, Users, Palette, Code2, Briefcase, HeartPulse, Sparkles } from "lucide-react";

const colorMap: Record<string, { bg: string; badge: string; badgeText: string; icon: string }> = {
  lavender: { bg: "bg-lavender", badge: "bg-lavender-dark/30", badgeText: "text-ink", icon: "text-ink/70" },
  sunshine: { bg: "bg-sunshine", badge: "bg-sunshine-dark/30", badgeText: "text-ink", icon: "text-ink/70" },
  coral: { bg: "bg-coral", badge: "bg-white/25", badgeText: "text-white", icon: "text-white/80" },
  ink: { bg: "bg-ink", badge: "bg-white/15", badgeText: "text-white", icon: "text-white/80" },
};

const iconMap: Record<string, any> = {
  Marketing: BookOpen,
  Psychology: Users,
  "Computer Science": Code2,
  Business: Briefcase,
  Design: Palette,
  "Healthcare & Medicine": HeartPulse,
};

export default function CourseCard({
  course,
}: {
  course: {
    slug: string;
    title: string;
    summary: string;
    level: string;
    category: { name: string; color: string };
  };
}) {
  const c = colorMap[course.category.color] ?? colorMap.lavender;
  const Icon = iconMap[course.category.name] ?? Sparkles;

  return (
    <div className="flex flex-col bg-white rounded-2xl border border-line overflow-hidden">
      <div className={`${c.bg} aspect-[4/3] flex items-start justify-between p-4 relative`}>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${c.badge} ${c.badgeText}`}>
          {course.category.name}
        </span>
        <Icon className={`absolute bottom-4 right-4 ${c.icon}`} size={56} strokeWidth={1.25} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <h3 className="font-display font-semibold text-base leading-snug mb-3 flex-1">
          {course.title}
        </h3>
        <Link
          href={`/courses/${course.slug}`}
          className="text-center text-sm font-medium bg-coral text-white rounded-full py-2.5 hover:bg-coral-dark transition-colors"
        >
          More details
        </Link>
      </div>
    </div>
  );
}
