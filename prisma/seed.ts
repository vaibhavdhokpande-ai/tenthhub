import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // Boards
  const ssc = await prisma.board.upsert({
    where: { slug: "ssc" },
    update: {},
    create: { name: "SSC", slug: "ssc" },
  });

  const cbse = await prisma.board.upsert({
    where: { slug: "cbse" },
    update: {},
    create: { name: "CBSE", slug: "cbse" },
  });

  // SSC Subjects (skeleton — only Maths Part 1 fully seeded below)
  const sscSubjects = [
    { name: "Marathi", slug: "marathi", order: 1 },
    { name: "English", slug: "english", order: 2 },
    { name: "Hindi", slug: "hindi", order: 3 },
    { name: "Mathematics Part 1 (Algebra)", slug: "maths-1", order: 4 },
    { name: "Mathematics Part 2 (Geometry)", slug: "maths-2", order: 5 },
    { name: "Science and Technology Part 1", slug: "science-1", order: 6 },
    { name: "Science and Technology Part 2", slug: "science-2", order: 7 },
    { name: "History & Political Science", slug: "history-polity", order: 8 },
    { name: "Geography & Economics", slug: "geography-economics", order: 9 },
  ];

  for (const s of sscSubjects) {
    await prisma.subject.upsert({
      where: { boardId_slug: { boardId: ssc.id, slug: s.slug } },
      update: {},
      create: { ...s, boardId: ssc.id },
    });
  }

  // CBSE Subjects (skeleton)
  const cbseSubjects = [
    { name: "English", slug: "english", order: 1 },
    { name: "Hindi", slug: "hindi", order: 2 },
    { name: "Mathematics", slug: "maths", order: 3 },
    { name: "Science", slug: "science", order: 4 },
    { name: "Social Science", slug: "social-science", order: 5 },
  ];

  for (const s of cbseSubjects) {
    await prisma.subject.upsert({
      where: { boardId_slug: { boardId: cbse.id, slug: s.slug } },
      update: {},
      create: { ...s, boardId: cbse.id },
    });
  }

  // ---- Fully seed SSC Maths Part 1 (Algebra) as the demo subject ----
  const maths1 = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "maths-1" } },
  });

  const chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "linear-equations-two-variables" } },
    update: {},
    create: {
      subjectId: maths1.id,
      title: "Linear Equations in Two Variables",
      slug: "linear-equations-two-variables",
      order: 1,
    },
  });

  const topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter1.id, slug: "solving-simultaneous-equations" } },
    update: {},
    create: {
      chapterId: chapter1.id,
      title: "Solving Simultaneous Equations (Graphical & Elimination)",
      slug: "solving-simultaneous-equations",
      order: 1,
      notesMd: `## Simultaneous Linear Equations

A pair of linear equations in two variables (x, y) that are solved together is called
a system of simultaneous equations.

**Standard form:** a1x + b1y = c1  and  a2x + b2y = c2

### Methods to solve
1. **Graphical method** — plot both lines, the intersection point is the solution.
2. **Elimination method** — multiply equations so one variable cancels when added/subtracted.
3. **Substitution method** — express one variable in terms of the other, substitute.

### Worked example
Solve: 2x + 3y = 12 and x - y = 1

From eq 2: x = y + 1
Substitute into eq 1: 2(y+1) + 3y = 12 → 5y + 2 = 12 → y = 2, x = 3

**Answer: x = 3, y = 2**`,
      videoUrl: "",
    },
  });

  const quiz1 = await prisma.quiz.upsert({
    where: { topicId: topic1.id },
    update: {},
    create: { topicId: topic1.id },
  });

  const existingQuestions = await prisma.question.findMany({ where: { quizId: quiz1.id } });
  if (existingQuestions.length === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz1.id,
          text: "The pair of equations 2x + 3y = 12 and x - y = 1 has the solution:",
          options: ["x=3, y=2", "x=2, y=3", "x=1, y=1", "x=4, y=1"],
          answer: 0,
          explanation: "Substituting x = y+1 into the first equation gives y = 2, x = 3.",
          order: 1,
        },
        {
          quizId: quiz1.id,
          text: "Which method plots both equations as straight lines to find the solution?",
          options: ["Elimination", "Substitution", "Graphical", "Cross-multiplication"],
          answer: 2,
          explanation: "The graphical method finds the solution as the intersection point of two lines.",
          order: 2,
        },
        {
          quizId: quiz1.id,
          text: "For a unique solution to exist, the two lines must be:",
          options: ["Parallel", "Coincident", "Intersecting", "Perpendicular only"],
          answer: 2,
          explanation: "Two intersecting lines meet at exactly one point — the unique solution.",
          order: 3,
        },
      ],
    });
  }

  console.log("Seed complete:", { ssc: ssc.slug, cbse: cbse.slug, demoTopic: topic1.slug });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
