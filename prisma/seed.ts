import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

async function main() {
  const categories = [
    { name: "Marketing", color: "lavender" },
    { name: "Psychology", color: "sunshine" },
    { name: "Computer Science", color: "ink" },
    { name: "Business", color: "coral" },
    { name: "Design", color: "lavender" },
    { name: "Healthcare & Medicine", color: "sunshine" },
  ];
  const catRows: Record<string, string> = {};
  for (const c of categories) {
    const row = await prisma.category.upsert({
      where: { slug: slugify(c.name) },
      update: {},
      create: { name: c.name, slug: slugify(c.name), color: c.color },
    });
    catRows[c.name] = row.id;
  }

  const teachers = [
    { name: "Maya Alvarez", title: "Content Strategist, ex-HubSpot" },
    { name: "Dr. Priya Nair", title: "Clinical Psychologist & Speaker Coach" },
    { name: "Sam Okafor", title: "Senior Data Analyst, ex-Spotify" },
    { name: "Lena Kowalski", title: "Illustrator & Adobe Certified Instructor" },
    { name: "Rahul Mehta", title: "Growth Marketing Lead" },
    { name: "Dr. Aisha Khan", title: "Public Health Researcher" },
  ];
  const teacherRows: Record<string, string> = {};
  for (const t of teachers) {
    const existing = await prisma.teacher.findFirst({ where: { name: t.name } });
    const row = existing ?? (await prisma.teacher.create({ data: t }));
    teacherRows[t.name] = row.id;
  }

  const courses = [
    {
      title: "Creative Writing for Beginners",
      category: "Marketing",
      teacher: "Maya Alvarez",
      level: "Beginner",
      durationHrs: 12,
      price: 0,
      isNew: true,
      summary: "Find your voice and start writing stories, essays, and copy that people actually want to read.",
      enrolledCount: 8400,
      rating: 4.8,
    },
    {
      title: "Public Speaking and Leadership",
      category: "Psychology",
      teacher: "Dr. Priya Nair",
      level: "Intermediate",
      durationHrs: 8,
      price: 1499,
      isNew: true,
      isRecommended: true,
      summary: "Overcome stage fright and lead a room with confidence, using techniques from real leadership coaching.",
      enrolledCount: 12100,
      rating: 4.9,
    },
    {
      title: "Data Visualization Techniques",
      category: "Computer Science",
      teacher: "Sam Okafor",
      level: "Intermediate",
      durationHrs: 15,
      price: 1999,
      isNew: true,
      summary: "Turn raw datasets into charts and dashboards that tell a clear, compelling story.",
      enrolledCount: 6700,
      rating: 4.7,
    },
    {
      title: "Digital Illustration with Adobe Illustrator",
      category: "Design",
      teacher: "Lena Kowalski",
      level: "Beginner",
      durationHrs: 20,
      price: 2499,
      isNew: true,
      summary: "Master vector illustration fundamentals and build a portfolio-ready piece by the end of the course.",
      enrolledCount: 9300,
      rating: 4.8,
    },
    {
      title: "Growth Marketing Fundamentals",
      category: "Marketing",
      teacher: "Rahul Mehta",
      level: "Beginner",
      durationHrs: 10,
      price: 0,
      isRecommended: true,
      summary: "Learn the experiment-driven playbook startups use to grow users without a big ad budget.",
      enrolledCount: 15200,
      rating: 4.6,
    },
    {
      title: "Understanding Human Behaviour",
      category: "Psychology",
      teacher: "Dr. Priya Nair",
      level: "Beginner",
      durationHrs: 14,
      price: 1299,
      isRecommended: true,
      summary: "An accessible introduction to why people think, feel, and act the way they do.",
      enrolledCount: 18900,
      rating: 4.9,
    },
    {
      title: "Python for Data Analysis",
      category: "Computer Science",
      teacher: "Sam Okafor",
      level: "Intermediate",
      durationHrs: 25,
      price: 2999,
      isRecommended: true,
      summary: "Hands-on Pandas, NumPy, and visualization skills using real-world datasets.",
      enrolledCount: 21400,
      rating: 4.8,
    },
    {
      title: "Brand Identity Design",
      category: "Design",
      teacher: "Lena Kowalski",
      level: "Intermediate",
      durationHrs: 18,
      price: 2199,
      summary: "Design logos, colour systems, and brand guidelines clients will actually love.",
      enrolledCount: 5400,
      rating: 4.7,
    },
    {
      title: "Small Business Finance Basics",
      category: "Business",
      teacher: "Rahul Mehta",
      level: "Beginner",
      durationHrs: 9,
      price: 999,
      summary: "Budgeting, cash flow, and pricing fundamentals for first-time founders.",
      enrolledCount: 7100,
      rating: 4.5,
    },
    {
      title: "Introduction to Public Health",
      category: "Healthcare & Medicine",
      teacher: "Dr. Aisha Khan",
      level: "Beginner",
      durationHrs: 11,
      price: 0,
      summary: "How health systems, policy, and prevention work together at a population scale.",
      enrolledCount: 4300,
      rating: 4.6,
    },
    {
      title: "UX Research Methods",
      category: "Design",
      teacher: "Lena Kowalski",
      level: "Advanced",
      durationHrs: 16,
      price: 2799,
      isRecommended: true,
      summary: "Plan, run, and synthesise user interviews and usability tests like a senior researcher.",
      enrolledCount: 6200,
      rating: 4.9,
    },
    {
      title: "Negotiation Skills for the Workplace",
      category: "Business",
      teacher: "Dr. Priya Nair",
      level: "Intermediate",
      durationHrs: 7,
      price: 1599,
      summary: "Practical scripts and frameworks for salary talks, deals, and everyday workplace conflict.",
      enrolledCount: 9800,
      rating: 4.7,
    },
  ];

  for (const c of courses) {
    await prisma.course.upsert({
      where: { slug: slugify(c.title) },
      update: {},
      create: {
        title: c.title,
        slug: slugify(c.title),
        summary: c.summary,
        description: `${c.summary}\n\nThis course is taught by ${c.teacher} and includes video lessons, hands-on exercises, and a certificate of completion.`,
        categoryId: catRows[c.category],
        teacherId: teacherRows[c.teacher],
        level: c.level,
        durationHrs: c.durationHrs,
        price: c.price,
        isNew: c.isNew ?? false,
        isRecommended: c.isRecommended ?? false,
        enrolledCount: c.enrolledCount,
        rating: c.rating,
      },
    });
  }

  console.log(`Seed complete: ${categories.length} categories, ${teachers.length} teachers, ${courses.length} courses.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
