import { PrismaClient } from "@prisma/client";
import { sscChapters, cbseChapters } from "./syllabus-data";

const prisma = new PrismaClient();

function slugify(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 60);
}

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

  // ---- Seed full chapter list (syllabus checklist) for every SSC subject ----
  for (const [subjectSlug, chapters] of Object.entries(sscChapters)) {
    const subject = await prisma.subject.findUnique({
      where: { boardId_slug: { boardId: ssc.id, slug: subjectSlug } },
    });
    if (!subject) continue;

    for (let i = 0; i < chapters.length; i++) {
      const title = chapters[i];
      const slug = slugify(title);
      await prisma.chapter.upsert({
        where: { subjectId_slug: { subjectId: subject.id, slug } },
        update: { title, order: i + 1 },
        create: { subjectId: subject.id, title, slug, order: i + 1 },
      });
    }
  }

  // ---- Seed full chapter list (syllabus checklist) for every CBSE subject ----
  for (const [subjectSlug, chapters] of Object.entries(cbseChapters)) {
    const subject = await prisma.subject.findUnique({
      where: { boardId_slug: { boardId: cbse.id, slug: subjectSlug } },
    });
    if (!subject) continue;

    for (let i = 0; i < chapters.length; i++) {
      const title = chapters[i];
      const slug = slugify(title);
      await prisma.chapter.upsert({
        where: { subjectId_slug: { subjectId: subject.id, slug } },
        update: { title, order: i + 1 },
        create: { subjectId: subject.id, title, slug, order: i + 1 },
      });
    }
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

  // ---- Chapter 2: Quadratic Equations ----
  const chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "quadratic-equations" } },
    update: {},
    create: { subjectId: maths1.id, title: "Quadratic Equations", slug: "quadratic-equations", order: 2 },
  });

  const topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter2.id, slug: "solving-by-factorisation-and-formula" } },
    update: {},
    create: {
      chapterId: chapter2.id,
      title: "Solving Quadratic Equations by Factorisation and Formula",
      slug: "solving-by-factorisation-and-formula",
      order: 1,
      notesMd: `## Quadratic Equations

An equation of the form **ax² + bx + c = 0**, where a ≠ 0, is a quadratic equation.

### Method 1: Factorisation
Split the middle term so the equation factors into two linear terms.

Example: x² - 5x + 6 = 0
→ x² - 2x - 3x + 6 = 0
→ x(x - 2) - 3(x - 2) = 0
→ (x - 2)(x - 3) = 0
→ **x = 2 or x = 3**

### Method 2: Quadratic Formula
x = (-b ± √(b² - 4ac)) / 2a

The term **b² - 4ac** is called the **discriminant (Δ)**:
- Δ > 0 → two distinct real roots
- Δ = 0 → two equal real roots
- Δ < 0 → no real roots

### Worked example
Solve 2x² + 3x - 2 = 0 using the formula.
a=2, b=3, c=-2 → Δ = 9 - 4(2)(-2) = 9+16 = 25
x = (-3 ± 5) / 4 → **x = 1/2 or x = -2**`,
      videoUrl: "",
    },
  });

  const quiz2 = await prisma.quiz.upsert({
    where: { topicId: topic2.id },
    update: {},
    create: { topicId: topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz2.id,
          text: "The roots of x² - 5x + 6 = 0 are:",
          options: ["1, 6", "2, 3", "-2, -3", "2, -3"],
          answer: 1,
          explanation: "Factorising gives (x-2)(x-3)=0, so x=2 or x=3.",
          order: 1,
        },
        {
          quizId: quiz2.id,
          text: "For ax² + bx + c = 0, the discriminant is:",
          options: ["b² + 4ac", "b² - 4ac", "4ac - b²", "a² - 4bc"],
          answer: 1,
          explanation: "Discriminant Δ = b² - 4ac, used to check the nature of roots.",
          order: 2,
        },
        {
          quizId: quiz2.id,
          text: "If the discriminant of a quadratic equation is negative, the equation has:",
          options: ["Two equal real roots", "Two distinct real roots", "No real roots", "Three roots"],
          answer: 2,
          explanation: "Δ < 0 means the roots are not real (they are complex/imaginary).",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: Arithmetic Progression ----
  const chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "arithmetic-progression" } },
    update: {},
    create: { subjectId: maths1.id, title: "Arithmetic Progression", slug: "arithmetic-progression", order: 3 },
  });

  const topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter3.id, slug: "nth-term-and-sum-of-ap" } },
    update: {},
    create: {
      chapterId: chapter3.id,
      title: "Finding the nth Term and Sum of an AP",
      slug: "nth-term-and-sum-of-ap",
      order: 1,
      notesMd: `## Arithmetic Progression (AP)

A sequence where the difference between consecutive terms is constant is an
**Arithmetic Progression**. That constant is the **common difference (d)**.

General AP: a, a+d, a+2d, a+3d, ...

### nth term formula
**tₙ = a + (n - 1)d**

### Sum of first n terms
**Sₙ = n/2 [2a + (n - 1)d]**  or equivalently  **Sₙ = n/2 (a + tₙ)**

### Worked example
Find the 10th term and sum of first 10 terms of AP: 3, 7, 11, 15, ...
- a = 3, d = 4
- t₁₀ = 3 + (10-1)(4) = 3 + 36 = **39**
- S₁₀ = 10/2 [2(3) + 9(4)] = 5[6+36] = 5(42) = **210**`,
      videoUrl: "",
    },
  });

  const quiz3 = await prisma.quiz.upsert({
    where: { topicId: topic3.id },
    update: {},
    create: { topicId: topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz3.id,
          text: "In the AP 3, 7, 11, 15, ..., the common difference is:",
          options: ["3", "4", "7", "11"],
          answer: 1,
          explanation: "Each term increases by 4 (7-3=4, 11-7=4).",
          order: 1,
        },
        {
          quizId: quiz3.id,
          text: "The nth term of an AP is given by:",
          options: ["a + nd", "a + (n-1)d", "a - (n-1)d", "n(a+d)"],
          answer: 1,
          explanation: "The standard formula is tₙ = a + (n-1)d.",
          order: 2,
        },
        {
          quizId: quiz3.id,
          text: "For AP 3, 7, 11, 15, ..., the 10th term is:",
          options: ["36", "39", "40", "43"],
          answer: 1,
          explanation: "t₁₀ = 3 + (10-1)(4) = 3 + 36 = 39.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 4: Financial Planning ----
  const chapter4 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "financial-planning" } },
    update: {},
    create: { subjectId: maths1.id, title: "Financial Planning", slug: "financial-planning", order: 4 },
  });

  const topic4 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter4.id, slug: "gst-basics" } },
    update: {},
    create: {
      chapterId: chapter4.id,
      title: "Goods and Services Tax (GST) — Basics",
      slug: "gst-basics",
      order: 1,
      notesMd: `## GST — Goods and Services Tax

GST is an indirect tax applied on the supply of goods and services, replacing
older taxes like VAT and Service Tax. It has three components:

- **CGST** — Central GST (goes to Central Government)
- **SGST** — State GST (goes to State Government)
- **IGST** — Integrated GST (for inter-state transactions)

For sales **within the same state**: GST = CGST + SGST (split equally)
For sales **between different states**: only IGST is charged (full rate)

### Formula
Taxable value × GST rate = GST amount
**Invoice value = Taxable value + GST amount**

### Worked example
A dealer sells goods worth ₹5,000 within the same state at 12% GST.
- Total GST = 5000 × 12% = ₹600
- CGST = 6% of 5000 = ₹300
- SGST = 6% of 5000 = ₹300
- **Invoice value = 5000 + 600 = ₹5,600**`,
      videoUrl: "",
    },
  });

  const quiz4 = await prisma.quiz.upsert({
    where: { topicId: topic4.id },
    update: {},
    create: { topicId: topic4.id },
  });

  if ((await prisma.question.count({ where: { quizId: quiz4.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz4.id,
          text: "For a sale made within the same state, GST is split as:",
          options: ["Only IGST", "CGST + SGST", "Only SGST", "CGST + IGST"],
          answer: 1,
          explanation: "Intra-state sales split GST equally into CGST and SGST.",
          order: 1,
        },
        {
          quizId: quiz4.id,
          text: "Goods worth ₹5,000 with 12% GST (intra-state) — what is the CGST amount?",
          options: ["₹600", "₹300", "₹150", "₹60"],
          answer: 1,
          explanation: "Total GST = 12% of 5000 = 600, split equally: CGST = SGST = ₹300.",
          order: 2,
        },
        {
          quizId: quiz4.id,
          text: "IGST is applicable for:",
          options: ["Sales within the same state", "Sales between different states", "Only exports", "Only imports"],
          answer: 1,
          explanation: "IGST applies to inter-state transactions instead of CGST+SGST.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 5: Probability ----
  const chapter5 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "probability" } },
    update: {},
    create: { subjectId: maths1.id, title: "Probability", slug: "probability", order: 5 },
  });

  const topic5 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter5.id, slug: "basic-concepts-of-probability" } },
    update: {},
    create: {
      chapterId: chapter5.id,
      title: "Basic Concepts of Probability",
      slug: "basic-concepts-of-probability",
      order: 1,
      notesMd: `## Probability

Probability measures how likely an event is to happen.

**Key terms**
- **Sample space (S):** all possible outcomes of an experiment
- **Event (A):** a subset of the sample space (what we're interested in)

### Formula
**P(A) = Number of favourable outcomes / Total number of possible outcomes**

Probability always lies between 0 and 1:
- P(A) = 0 → impossible event
- P(A) = 1 → sure/certain event

### Worked example
A die is rolled once. Find the probability of getting an even number.
- Sample space S = {1,2,3,4,5,6} → total outcomes = 6
- Favourable outcomes (even) = {2,4,6} → 3 outcomes
- **P(even) = 3/6 = 1/2**`,
      videoUrl: "",
    },
  });

  const quiz5 = await prisma.quiz.upsert({
    where: { topicId: topic5.id },
    update: {},
    create: { topicId: topic5.id },
  });

  if ((await prisma.question.count({ where: { quizId: quiz5.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz5.id,
          text: "A die is rolled once. The probability of getting an even number is:",
          options: ["1/6", "1/3", "1/2", "2/3"],
          answer: 2,
          explanation: "Favourable outcomes {2,4,6} = 3 out of 6 total → 3/6 = 1/2.",
          order: 1,
        },
        {
          quizId: quiz5.id,
          text: "The probability of a sure (certain) event is:",
          options: ["0", "0.5", "1", "Cannot be determined"],
          answer: 2,
          explanation: "A certain event always happens, so its probability is 1.",
          order: 2,
        },
        {
          quizId: quiz5.id,
          text: "Probability of any event always lies in the range:",
          options: ["-1 to 1", "0 to 1", "0 to 100", "1 to 10"],
          answer: 1,
          explanation: "Probability values are always between 0 (impossible) and 1 (certain).",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 6: Statistics ----
  const chapter6 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths1.id, slug: "statistics" } },
    update: {},
    create: { subjectId: maths1.id, title: "Statistics", slug: "statistics", order: 6 },
  });

  const topic6 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: chapter6.id, slug: "measures-of-central-tendency" } },
    update: {},
    create: {
      chapterId: chapter6.id,
      title: "Measures of Central Tendency: Mean, Median, Mode",
      slug: "measures-of-central-tendency",
      order: 1,
      notesMd: `## Measures of Central Tendency

These describe the "centre" of a data set.

### Mean (average)
Mean = (Sum of all observations) / (Number of observations)

### Median
The middle value when data is arranged in order.
- If n is odd: the ((n+1)/2)th value
- If n is even: average of the two middle values

### Mode
The value that occurs most frequently in the data set.

### Worked example
Data: 4, 8, 6, 5, 3, 8, 9

- **Mean** = (4+8+6+5+3+8+9)/7 = 43/7 ≈ **6.14**
- Arranged: 3,4,5,6,8,8,9 → **Median** = 6 (4th of 7 values)
- **Mode** = 8 (appears twice, most frequent)`,
      videoUrl: "",
    },
  });

  const quiz6 = await prisma.quiz.upsert({
    where: { topicId: topic6.id },
    update: {},
    create: { topicId: topic6.id },
  });

  if ((await prisma.question.count({ where: { quizId: quiz6.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: quiz6.id,
          text: "For the data 3,4,5,6,8,8,9 the median is:",
          options: ["5", "6", "8", "6.14"],
          answer: 1,
          explanation: "With 7 values sorted, the median is the 4th value = 6.",
          order: 1,
        },
        {
          quizId: quiz6.id,
          text: "The value that occurs most frequently in a data set is called the:",
          options: ["Mean", "Median", "Mode", "Range"],
          answer: 2,
          explanation: "Mode is defined as the most frequently occurring value.",
          order: 2,
        },
        {
          quizId: quiz6.id,
          text: "Mean is calculated as:",
          options: [
            "Middle value of sorted data",
            "Most frequent value",
            "Sum of observations ÷ number of observations",
            "Largest value minus smallest value",
          ],
          answer: 2,
          explanation: "Mean = sum of all values divided by the count of values.",
          order: 3,
        },
      ],
    });
  }

  // ==================== SSC Mathematics Part 2 (Geometry) ====================
  const maths2 = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "maths-2" } },
  });

  // ---- Chapter 1: Similarity ----
  const g_chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "similarity" } },
    update: {},
    create: { subjectId: maths2.id, title: "Similarity", slug: "similarity", order: 1 },
  });

  const g_topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter1.id, slug: "basic-proportionality-theorem" } },
    update: {},
    create: {
      chapterId: g_chapter1.id,
      title: "Basic Proportionality Theorem (Thales' Theorem)",
      slug: "basic-proportionality-theorem",
      order: 1,
      notesMd: `## Similarity of Triangles

Two triangles are **similar** if their corresponding angles are equal and
corresponding sides are in proportion (same shape, possibly different size).

### Basic Proportionality Theorem (BPT / Thales' Theorem)
If a line is drawn **parallel to one side of a triangle** intersecting the
other two sides, it divides those two sides in the same ratio.

If DE ∥ BC in triangle ABC (D on AB, E on AC):
**AD/DB = AE/EC**

### Converse of BPT
If a line divides two sides of a triangle in the same ratio, it is parallel
to the third side.

### Areas of similar triangles
The ratio of areas of two similar triangles equals the **square** of the
ratio of their corresponding sides:
**A(ΔABC)/A(ΔPQR) = (AB/PQ)²**

### Worked example
In ΔABC, DE ∥ BC, AD = 3, DB = 6, AE = 4. Find EC.
Using BPT: AD/DB = AE/EC → 3/6 = 4/EC → EC = 4×6/3 = **8**`,
      videoUrl: "",
    },
  });

  const g_quiz1 = await prisma.quiz.upsert({
    where: { topicId: g_topic1.id },
    update: {},
    create: { topicId: g_topic1.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz1.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz1.id,
          text: "Basic Proportionality Theorem applies when a line is drawn:",
          options: [
            "Perpendicular to one side of a triangle",
            "Parallel to one side of a triangle",
            "Through the centroid",
            "Bisecting an angle",
          ],
          answer: 1,
          explanation: "BPT applies to a line parallel to one side, intersecting the other two.",
          order: 1,
        },
        {
          quizId: g_quiz1.id,
          text: "In ΔABC, DE ∥ BC with AD=3, DB=6, AE=4. EC equals:",
          options: ["6", "8", "10", "12"],
          answer: 1,
          explanation: "AD/DB = AE/EC → 3/6 = 4/EC → EC = 8.",
          order: 2,
        },
        {
          quizId: g_quiz1.id,
          text: "The ratio of areas of two similar triangles equals:",
          options: [
            "The ratio of their sides",
            "The square of the ratio of their sides",
            "The cube of the ratio of their sides",
            "Twice the ratio of their sides",
          ],
          answer: 1,
          explanation: "Area ratio = (side ratio)², a key property of similar triangles.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 2: Pythagoras Theorem ----
  const g_chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "pythagoras-theorem" } },
    update: {},
    create: { subjectId: maths2.id, title: "Pythagoras Theorem", slug: "pythagoras-theorem", order: 2 },
  });

  const g_topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter2.id, slug: "pythagoras-theorem-and-applications" } },
    update: {},
    create: {
      chapterId: g_chapter2.id,
      title: "Pythagoras Theorem and Its Applications",
      slug: "pythagoras-theorem-and-applications",
      order: 1,
      notesMd: `## Pythagoras Theorem

In a right-angled triangle, the square of the hypotenuse equals the sum of
the squares of the other two sides.

**Hypotenuse² = Base² + Height²**  (or  c² = a² + b²)

### Converse of Pythagoras Theorem
If the square of the longest side of a triangle equals the sum of the
squares of the other two sides, the triangle is right-angled.

### Common Pythagorean triplets
(3,4,5), (5,12,13), (8,15,17), (7,24,25) — and their multiples.

### Worked example
A ladder 10 m long rests against a wall, its foot 6 m from the wall's base.
How high up the wall does it reach?

Hypotenuse = 10, Base = 6, Height = ?
Height² = 10² - 6² = 100 - 36 = 64
**Height = 8 m**`,
      videoUrl: "",
    },
  });

  const g_quiz2 = await prisma.quiz.upsert({
    where: { topicId: g_topic2.id },
    update: {},
    create: { topicId: g_topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz2.id,
          text: "A 10 m ladder's foot is 6 m from a wall. How high does it reach?",
          options: ["6 m", "8 m", "10 m", "12 m"],
          answer: 1,
          explanation: "Height² = 10² - 6² = 64 → Height = 8 m.",
          order: 1,
        },
        {
          quizId: g_quiz2.id,
          text: "Which of these is a Pythagorean triplet?",
          options: ["(2,3,4)", "(5,12,13)", "(6,7,8)", "(4,5,6)"],
          answer: 1,
          explanation: "5² + 12² = 25 + 144 = 169 = 13², so (5,12,13) is a valid triplet.",
          order: 2,
        },
        {
          quizId: g_quiz2.id,
          text: "The converse of Pythagoras Theorem is used to check whether a triangle is:",
          options: ["Equilateral", "Isosceles", "Right-angled", "Scalene"],
          answer: 2,
          explanation: "If c² = a² + b², the triangle must be right-angled at the vertex opposite c.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: Circle ----
  const g_chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "circle" } },
    update: {},
    create: { subjectId: maths2.id, title: "Circle", slug: "circle", order: 3 },
  });

  const g_topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter3.id, slug: "tangents-to-a-circle" } },
    update: {},
    create: {
      chapterId: g_chapter3.id,
      title: "Tangents to a Circle",
      slug: "tangents-to-a-circle",
      order: 1,
      notesMd: `## Tangents to a Circle

A **tangent** is a line that touches a circle at exactly one point (the
point of contact), without crossing into the circle.

### Key properties
1. A tangent is **perpendicular** to the radius at the point of contact.
2. **Tangent segment theorem:** the lengths of two tangent segments drawn
   from an external point to a circle are equal.
3. Exactly one tangent can be drawn at a point on a circle.
4. From an external point, exactly two tangents can be drawn to a circle.

### Worked example
From an external point P, two tangents PA and PB touch a circle at A and B.
If PA = 7 cm, find PB.

By the tangent segment theorem, **PB = PA = 7 cm** (tangents from the same
external point are always equal in length).`,
      videoUrl: "",
    },
  });

  const g_quiz3 = await prisma.quiz.upsert({
    where: { topicId: g_topic3.id },
    update: {},
    create: { topicId: g_topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz3.id,
          text: "A tangent to a circle at the point of contact is always:",
          options: [
            "Parallel to the radius",
            "Perpendicular to the radius",
            "At 45° to the radius",
            "Passing through the centre",
          ],
          answer: 1,
          explanation: "A fundamental property: tangent ⊥ radius at the point of contact.",
          order: 1,
        },
        {
          quizId: g_quiz3.id,
          text: "From external point P, tangents PA and PB touch a circle. If PA = 7cm, PB is:",
          options: ["3.5 cm", "7 cm", "14 cm", "Cannot be determined"],
          answer: 1,
          explanation: "Tangent segments from the same external point are always equal in length.",
          order: 2,
        },
        {
          quizId: g_quiz3.id,
          text: "How many tangents can be drawn to a circle from an external point?",
          options: ["1", "2", "3", "Infinite"],
          answer: 1,
          explanation: "Exactly two tangents can be drawn from any point outside a circle.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 4: Geometric Constructions ----
  const g_chapter4 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "geometric-constructions" } },
    update: {},
    create: { subjectId: maths2.id, title: "Geometric Constructions", slug: "geometric-constructions", order: 4 },
  });

  const g_topic4 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter4.id, slug: "constructing-tangents-and-similar-triangles" } },
    update: {},
    create: {
      chapterId: g_chapter4.id,
      title: "Constructing Tangents to a Circle & Similar Triangles",
      slug: "constructing-tangents-and-similar-triangles",
      order: 1,
      notesMd: `## Geometric Constructions

Constructions must be done using only a **compass and ruler**, with all
construction steps/arcs left visible (not erased).

### Constructing a tangent at a point on a circle
1. Draw the circle with centre O and mark point P on it.
2. Join OP and construct the perpendicular to OP at P.
3. This perpendicular line is the required tangent.

### Constructing a tangent from an external point
1. Draw circle with centre O, mark external point P.
2. Join OP, find its midpoint M.
3. Draw a circle with centre M and radius MO/MP — it intersects the
   original circle at two points, A and B.
4. PA and PB are the required tangents.

### Constructing a triangle similar to a given triangle
Given a scale factor (e.g., 3/2), the new triangle's sides are obtained by
dividing the base into the larger of the two numbers (here 3) equal parts,
then drawing a line parallel to the last division point to complete similar
triangle construction — following the **Basic Proportionality Theorem**.`,
      videoUrl: "",
    },
  });

  const g_quiz4 = await prisma.quiz.upsert({
    where: { topicId: g_topic4.id },
    update: {},
    create: { topicId: g_topic4.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz4.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz4.id,
          text: "Geometric constructions must be done using only:",
          options: ["A protractor and ruler", "A compass and ruler", "A set square only", "Freehand drawing"],
          answer: 1,
          explanation: "Standard board-exam constructions use only compass and (unmarked) ruler.",
          order: 1,
        },
        {
          quizId: g_quiz4.id,
          text: "To construct a tangent at a point P on a circle, you first draw:",
          options: ["A chord through P", "The radius OP, then its perpendicular at P", "A diameter", "Another circle"],
          answer: 1,
          explanation: "The tangent at P is perpendicular to the radius OP at that point.",
          order: 2,
        },
        {
          quizId: g_quiz4.id,
          text: "Constructing a triangle similar to a given one relies on the:",
          options: [
            "Pythagoras Theorem",
            "Basic Proportionality Theorem",
            "Angle Sum Property",
            "Mid-point Theorem",
          ],
          answer: 1,
          explanation: "Dividing the base in the given ratio and drawing a parallel line uses BPT.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 5: Co-ordinate Geometry ----
  const g_chapter5 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "coordinate-geometry" } },
    update: {},
    create: { subjectId: maths2.id, title: "Co-ordinate Geometry", slug: "coordinate-geometry", order: 5 },
  });

  const g_topic5 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter5.id, slug: "distance-and-section-formula" } },
    update: {},
    create: {
      chapterId: g_chapter5.id,
      title: "Distance Formula and Section Formula",
      slug: "distance-and-section-formula",
      order: 1,
      notesMd: `## Co-ordinate Geometry

### Distance Formula
Distance between two points A(x₁,y₁) and B(x₂,y₂):
**d = √[(x₂-x₁)² + (y₂-y₁)²]**

### Section Formula
Point P(x,y) that divides segment AB in ratio m:n (internally):
**x = (m·x₂ + n·x₁)/(m+n)**,  **y = (m·y₂ + n·y₁)/(m+n)**

### Midpoint (special case, ratio 1:1)
**x = (x₁+x₂)/2**,  **y = (y₁+y₂)/2**

### Worked example
Find the distance between A(2,3) and B(5,7).
d = √[(5-2)² + (7-3)²] = √[9+16] = √25 = **5 units**

Find the midpoint of A(2,3) and B(5,7).
Midpoint = ((2+5)/2, (3+7)/2) = **(3.5, 5)**`,
      videoUrl: "",
    },
  });

  const g_quiz5 = await prisma.quiz.upsert({
    where: { topicId: g_topic5.id },
    update: {},
    create: { topicId: g_topic5.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz5.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz5.id,
          text: "The distance between points A(2,3) and B(5,7) is:",
          options: ["3 units", "4 units", "5 units", "7 units"],
          answer: 2,
          explanation: "d = √[(5-2)² + (7-3)²] = √[9+16] = √25 = 5.",
          order: 1,
        },
        {
          quizId: g_quiz5.id,
          text: "The midpoint of A(2,3) and B(5,7) is:",
          options: ["(3, 5)", "(3.5, 5)", "(4, 5)", "(3.5, 4.5)"],
          answer: 1,
          explanation: "Midpoint = ((2+5)/2, (3+7)/2) = (3.5, 5).",
          order: 2,
        },
        {
          quizId: g_quiz5.id,
          text: "The section formula is used to find a point that:",
          options: [
            "Is farthest from both given points",
            "Divides a segment in a given ratio",
            "Lies on the x-axis only",
            "Is the reflection of a point",
          ],
          answer: 1,
          explanation: "The section formula gives the coordinates of a point dividing a segment in ratio m:n.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 6: Trigonometry ----
  const g_chapter6 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "trigonometry" } },
    update: {},
    create: { subjectId: maths2.id, title: "Trigonometry", slug: "trigonometry", order: 6 },
  });

  const g_topic6 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter6.id, slug: "trigonometric-ratios-and-heights-distances" } },
    update: {},
    create: {
      chapterId: g_chapter6.id,
      title: "Trigonometric Ratios and Heights & Distances",
      slug: "trigonometric-ratios-and-heights-distances",
      order: 1,
      notesMd: `## Trigonometry

In a right-angled triangle, for angle θ:
- **sin θ = Opposite / Hypotenuse**
- **cos θ = Adjacent / Hypotenuse**
- **tan θ = Opposite / Adjacent = sin θ / cos θ**

### Standard values

| θ | 0° | 30° | 45° | 60° | 90° |
|---|---|---|---|---|---|
| sin θ | 0 | 1/2 | 1/√2 | √3/2 | 1 |
| cos θ | 1 | √3/2 | 1/√2 | 1/2 | 0 |
| tan θ | 0 | 1/√3 | 1 | √3 | undefined |

### Angle of Elevation / Depression
- **Angle of elevation:** angle from horizontal up to an object (looking up)
- **Angle of depression:** angle from horizontal down to an object (looking down)

### Worked example
A tower's shadow is 20 m when the sun's angle of elevation is 30°. Find the
tower's height.
tan 30° = height / 20 → height = 20 × (1/√3) ≈ **11.55 m**`,
      videoUrl: "",
    },
  });

  const g_quiz6 = await prisma.quiz.upsert({
    where: { topicId: g_topic6.id },
    update: {},
    create: { topicId: g_topic6.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz6.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz6.id,
          text: "tan θ is equal to:",
          options: ["sin θ + cos θ", "sin θ / cos θ", "cos θ / sin θ", "sin θ × cos θ"],
          answer: 1,
          explanation: "By definition, tan θ = sin θ / cos θ.",
          order: 1,
        },
        {
          quizId: g_quiz6.id,
          text: "The value of tan 45° is:",
          options: ["0", "1/2", "1", "√3"],
          answer: 2,
          explanation: "tan 45° = 1, a standard angle value to memorise.",
          order: 2,
        },
        {
          quizId: g_quiz6.id,
          text: "The angle measured upward from the horizontal to an object is called the angle of:",
          options: ["Depression", "Elevation", "Incidence", "Reflection"],
          answer: 1,
          explanation: "Looking up at an object gives the angle of elevation.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 7: Mensuration ----
  const g_chapter7 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: maths2.id, slug: "mensuration" } },
    update: {},
    create: { subjectId: maths2.id, title: "Mensuration", slug: "mensuration", order: 7 },
  });

  const g_topic7 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: g_chapter7.id, slug: "surface-area-and-volume-of-solids" } },
    update: {},
    create: {
      chapterId: g_chapter7.id,
      title: "Surface Area and Volume of Solids",
      slug: "surface-area-and-volume-of-solids",
      order: 1,
      notesMd: `## Mensuration — Surface Area & Volume

### Cylinder (radius r, height h)
- Curved Surface Area = 2πrh
- Total Surface Area = 2πr(r + h)
- Volume = πr²h

### Cone (radius r, height h, slant height l = √(r²+h²))
- Curved Surface Area = πrl
- Total Surface Area = πr(r + l)
- Volume = (1/3)πr²h

### Sphere (radius r)
- Surface Area = 4πr²
- Volume = (4/3)πr³

### Worked example
Find the volume of a cylinder with radius 7 cm and height 10 cm. (π = 22/7)
Volume = πr²h = (22/7) × 7² × 10 = (22/7) × 49 × 10 = 22 × 7 × 10 = **1540 cm³**`,
      videoUrl: "",
    },
  });

  const g_quiz7 = await prisma.quiz.upsert({
    where: { topicId: g_topic7.id },
    update: {},
    create: { topicId: g_topic7.id },
  });

  if ((await prisma.question.count({ where: { quizId: g_quiz7.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: g_quiz7.id,
          text: "The volume of a cylinder with r=7cm, h=10cm (π=22/7) is:",
          options: ["440 cm³", "1100 cm³", "1540 cm³", "2200 cm³"],
          answer: 2,
          explanation: "Volume = πr²h = (22/7)×49×10 = 1540 cm³.",
          order: 1,
        },
        {
          quizId: g_quiz7.id,
          text: "The formula for the volume of a sphere is:",
          options: ["4πr²", "πr²h", "(4/3)πr³", "(1/3)πr²h"],
          answer: 2,
          explanation: "Volume of a sphere = (4/3)πr³.",
          order: 2,
        },
        {
          quizId: g_quiz7.id,
          text: "The slant height of a cone relates to r and h as:",
          options: ["l = r + h", "l = r × h", "l = √(r² + h²)", "l = r² + h²"],
          answer: 2,
          explanation: "By Pythagoras theorem on the cone's cross-section, l = √(r²+h²).",
          order: 3,
        },
      ],
    });
  }

  // ==================== SSC Science and Technology Part 1 ====================
  const science1 = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "science-1" } },
  });

  // ---- Chapter 1: Gravitation ----
  const s1_chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "gravitation" } },
    update: {},
    create: { subjectId: science1.id, title: "Gravitation", slug: "gravitation", order: 1 },
  });

  const s1_topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter1.id, slug: "newtons-law-of-gravitation" } },
    update: {},
    create: {
      chapterId: s1_chapter1.id,
      title: "Newton's Law of Gravitation & Free Fall",
      slug: "newtons-law-of-gravitation",
      order: 1,
      notesMd: `## Gravitation

**Newton's Law of Gravitation:** Every object in the universe attracts every
other object with a force proportional to the product of their masses and
inversely proportional to the square of the distance between them.

**F = G·(m₁·m₂)/r²**

where G = universal gravitational constant = 6.67 × 10⁻¹¹ N·m²/kg²

### Acceleration due to gravity (g)
Near Earth's surface, g ≈ 9.8 m/s². It is the same for all objects
regardless of mass (in the absence of air resistance) — this is why a
feather and a hammer fall at the same rate in a vacuum.

### Free fall equations (initial velocity = 0)
- v = gt
- h = ½gt²
- v² = 2gh

### Worked example
A ball is dropped from a height of 20 m. Find the time to reach the ground.
(g = 10 m/s²)
h = ½gt² → 20 = ½(10)t² → t² = 4 → **t = 2 s**`,
      videoUrl: "",
    },
  });

  const s1_quiz1 = await prisma.quiz.upsert({
    where: { topicId: s1_topic1.id },
    update: {},
    create: { topicId: s1_topic1.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz1.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz1.id,
          text: "Gravitational force between two objects is inversely proportional to:",
          options: ["Their distance", "The square of their distance", "The cube of their distance", "Their combined mass"],
          answer: 1,
          explanation: "F ∝ 1/r² — the inverse-square law.",
          order: 1,
        },
        {
          quizId: s1_quiz1.id,
          text: "A ball dropped from 20 m (g=10 m/s²) takes how long to hit the ground?",
          options: ["1 s", "2 s", "4 s", "20 s"],
          answer: 1,
          explanation: "h=½gt² → 20=½(10)t² → t²=4 → t=2s.",
          order: 2,
        },
        {
          quizId: s1_quiz1.id,
          text: "In a vacuum, a feather and a hammer dropped together will:",
          options: [
            "The hammer lands first",
            "The feather lands first",
            "Both land at the same time",
            "Neither falls",
          ],
          answer: 2,
          explanation: "Without air resistance, g is the same for all masses, so both land together.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 2: Periodic Classification of Elements ----
  const s1_chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "periodic-classification-of-elements" } },
    update: {},
    create: { subjectId: science1.id, title: "Periodic Classification of Elements", slug: "periodic-classification-of-elements", order: 2 },
  });

  const s1_topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter2.id, slug: "modern-periodic-table-and-trends" } },
    update: {},
    create: {
      chapterId: s1_chapter2.id,
      title: "Modern Periodic Table and Periodic Trends",
      slug: "modern-periodic-table-and-trends",
      order: 1,
      notesMd: `## Periodic Classification of Elements

**Modern Periodic Law:** Properties of elements are a periodic function of
their **atomic number**.

### Structure
- **Periods** (7 horizontal rows): number of shells increases left to right
- **Groups** (18 vertical columns): elements with similar valence electron
  configuration, hence similar chemical properties

### Periodic trends (left → right across a period)
- Atomic size: **decreases**
- Metallic character: **decreases**
- Non-metallic character: **increases**
- Electronegativity: **increases**

### Periodic trends (top → bottom in a group)
- Atomic size: **increases** (more shells)
- Metallic character: **increases**

### Worked example
Why does atomic size decrease across a period?
As you move left to right, protons increase (higher nuclear charge) while
electrons are added to the *same* shell — the stronger pull draws electrons
closer to the nucleus, shrinking atomic radius.`,
      videoUrl: "",
    },
  });

  const s1_quiz2 = await prisma.quiz.upsert({
    where: { topicId: s1_topic2.id },
    update: {},
    create: { topicId: s1_topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz2.id,
          text: "The Modern Periodic Law states that properties of elements are a periodic function of their:",
          options: ["Atomic mass", "Atomic number", "Number of neutrons", "Melting point"],
          answer: 1,
          explanation: "Modern periodic table is arranged by increasing atomic number, not mass.",
          order: 1,
        },
        {
          quizId: s1_quiz2.id,
          text: "Moving left to right across a period, atomic size:",
          options: ["Increases", "Decreases", "Stays constant", "First increases, then decreases"],
          answer: 1,
          explanation: "Increasing nuclear charge pulls electrons closer within the same shell, shrinking radius.",
          order: 2,
        },
        {
          quizId: s1_quiz2.id,
          text: "Elements in the same group have similar chemical properties because they have the same:",
          options: ["Atomic mass", "Number of shells", "Number of valence electrons", "Melting point"],
          answer: 2,
          explanation: "Same valence electron count leads to similar bonding/chemical behaviour.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: Chemical Reactions and Equations ----
  const s1_chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "chemical-reactions-and-equations" } },
    update: {},
    create: { subjectId: science1.id, title: "Chemical Reactions and Equations", slug: "chemical-reactions-and-equations", order: 3 },
  });

  const s1_topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter3.id, slug: "types-of-chemical-reactions" } },
    update: {},
    create: {
      chapterId: s1_chapter3.id,
      title: "Types of Chemical Reactions",
      slug: "types-of-chemical-reactions",
      order: 1,
      notesMd: `## Types of Chemical Reactions

1. **Combination reaction:** A + B → AB
   e.g. 2H₂ + O₂ → 2H₂O

2. **Decomposition reaction:** AB → A + B (often needs heat/light/electricity)
   e.g. 2H₂O → 2H₂ + O₂ (electrolysis)

3. **Displacement reaction:** A more reactive element displaces a less
   reactive one from its compound.
   e.g. Fe + CuSO₄ → FeSO₄ + Cu

4. **Double displacement reaction:** exchange of ions between two compounds,
   often forming a precipitate.
   e.g. AgNO₃ + NaCl → AgCl↓ + NaNO₃

5. **Precipitation reaction:** a double displacement where an insoluble
   solid (precipitate) forms.

6. **Neutralisation reaction:** acid + base → salt + water
   e.g. HCl + NaOH → NaCl + H₂O

### Balancing equations
A chemical equation must be balanced — the number of atoms of each element
must be equal on both sides (Law of Conservation of Mass).`,
      videoUrl: "",
    },
  });

  const s1_quiz3 = await prisma.quiz.upsert({
    where: { topicId: s1_topic3.id },
    update: {},
    create: { topicId: s1_topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz3.id,
          text: "Fe + CuSO₄ → FeSO₄ + Cu is an example of a:",
          options: ["Combination reaction", "Decomposition reaction", "Displacement reaction", "Neutralisation reaction"],
          answer: 2,
          explanation: "A more reactive metal (Fe) displaces a less reactive one (Cu) from its compound.",
          order: 1,
        },
        {
          quizId: s1_quiz3.id,
          text: "HCl + NaOH → NaCl + H₂O is an example of:",
          options: ["Displacement", "Double displacement/precipitation", "Neutralisation", "Combination"],
          answer: 2,
          explanation: "Acid + base → salt + water is a neutralisation reaction.",
          order: 2,
        },
        {
          quizId: s1_quiz3.id,
          text: "Chemical equations must be balanced to satisfy the:",
          options: ["Law of Conservation of Energy", "Law of Conservation of Mass", "Law of Definite Proportions", "Avogadro's Law"],
          answer: 1,
          explanation: "Atoms are neither created nor destroyed, so both sides must have equal atom counts.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 4: Effects of Electric Current ----
  const s1_chapter4 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "effects-of-electric-current" } },
    update: {},
    create: { subjectId: science1.id, title: "Effects of Electric Current", slug: "effects-of-electric-current", order: 4 },
  });

  const s1_topic4 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter4.id, slug: "ohms-law-and-heating-effect" } },
    update: {},
    create: {
      chapterId: s1_chapter4.id,
      title: "Ohm's Law and Heating Effect of Current",
      slug: "ohms-law-and-heating-effect",
      order: 1,
      notesMd: `## Effects of Electric Current

### Ohm's Law
At constant temperature, current through a conductor is directly
proportional to the potential difference across it.

**V = IR**  (V = voltage, I = current, R = resistance)

### Resistors in series and parallel
- **Series:** R = R₁ + R₂ + R₃ + ... (current same, voltage splits)
- **Parallel:** 1/R = 1/R₁ + 1/R₂ + 1/R₃ + ... (voltage same, current splits)

### Heating effect of current (Joule's Law)
Electrical energy converts to heat when current flows through a resistor:
**H = I²Rt**  (t = time in seconds)

### Electric power
**P = VI = I²R = V²/R**

### Worked example
A 10Ω resistor carries a current of 2A for 5 seconds. Find the heat produced.
H = I²Rt = (2)²(10)(5) = 4×10×5 = **200 J**`,
      videoUrl: "",
    },
  });

  const s1_quiz4 = await prisma.quiz.upsert({
    where: { topicId: s1_topic4.id },
    update: {},
    create: { topicId: s1_topic4.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz4.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz4.id,
          text: "Ohm's Law is expressed as:",
          options: ["V = I/R", "V = IR", "V = R/I", "I = VR"],
          answer: 1,
          explanation: "V = IR relates voltage, current, and resistance.",
          order: 1,
        },
        {
          quizId: s1_quiz4.id,
          text: "Heat produced by a 10Ω resistor carrying 2A for 5s is:",
          options: ["50 J", "100 J", "200 J", "400 J"],
          answer: 2,
          explanation: "H = I²Rt = 4×10×5 = 200 J.",
          order: 2,
        },
        {
          quizId: s1_quiz4.id,
          text: "In a series circuit, the total resistance is:",
          options: ["Less than any individual resistor", "The sum of individual resistances", "The average of resistances", "Always constant"],
          answer: 1,
          explanation: "In series, resistances simply add up: R = R₁+R₂+R₃+...",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 5: Heat ----
  const s1_chapter5 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "heat" } },
    update: {},
    create: { subjectId: science1.id, title: "Heat", slug: "heat", order: 5 },
  });

  const s1_topic5 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter5.id, slug: "specific-heat-and-thermal-expansion" } },
    update: {},
    create: {
      chapterId: s1_chapter5.id,
      title: "Specific Heat Capacity and Thermal Expansion",
      slug: "specific-heat-and-thermal-expansion",
      order: 1,
      notesMd: `## Heat

### Specific Heat Capacity
The amount of heat required to raise the temperature of 1 kg of a substance
by 1°C (or 1 K).

**Q = mcΔT**
where Q = heat (J), m = mass (kg), c = specific heat capacity (J/kg·K),
ΔT = change in temperature

Water has a very high specific heat capacity (4200 J/kg·K), which is why it
heats up and cools down slowly — used in cooling systems.

### Thermal Expansion
Most substances expand when heated and contract when cooled:
- **Linear expansion** — length (rods, wires)
- **Areal expansion** — area (sheets)
- **Cubical expansion** — volume (liquids, gases)

This is why railway tracks have small gaps, and bridges have expansion
joints — to allow for expansion in summer heat without buckling.

### Worked example
Find the heat needed to raise 2 kg of water by 10°C. (c = 4200 J/kg·K)
Q = mcΔT = 2 × 4200 × 10 = **84,000 J = 84 kJ**`,
      videoUrl: "",
    },
  });

  const s1_quiz5 = await prisma.quiz.upsert({
    where: { topicId: s1_topic5.id },
    update: {},
    create: { topicId: s1_topic5.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz5.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz5.id,
          text: "Heat required to raise 2kg of water by 10°C (c=4200 J/kg·K) is:",
          options: ["8,400 J", "42,000 J", "84,000 J", "420,000 J"],
          answer: 2,
          explanation: "Q = mcΔT = 2×4200×10 = 84,000 J.",
          order: 1,
        },
        {
          quizId: s1_quiz5.id,
          text: "Railway tracks are laid with small gaps to allow for:",
          options: ["Water drainage", "Thermal expansion", "Sound reduction", "Weight distribution"],
          answer: 1,
          explanation: "Gaps allow the metal to expand in heat without buckling the track.",
          order: 2,
        },
        {
          quizId: s1_quiz5.id,
          text: "Water's high specific heat capacity means it:",
          options: ["Heats up and cools down quickly", "Heats up and cools down slowly", "Never changes temperature", "Boils at a lower temperature"],
          answer: 1,
          explanation: "High specific heat means more energy is needed to change its temperature, so it changes slowly.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 6: Refraction of Light ----
  const s1_chapter6 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "refraction-of-light" } },
    update: {},
    create: { subjectId: science1.id, title: "Refraction of Light", slug: "refraction-of-light", order: 6 },
  });

  const s1_topic6 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter6.id, slug: "laws-of-refraction-and-refractive-index" } },
    update: {},
    create: {
      chapterId: s1_chapter6.id,
      title: "Laws of Refraction and Refractive Index",
      slug: "laws-of-refraction-and-refractive-index",
      order: 1,
      notesMd: `## Refraction of Light

**Refraction** is the bending of light as it passes from one medium to
another due to a change in speed.

### Laws of Refraction
1. The incident ray, refracted ray, and normal all lie in the same plane.
2. **Snell's Law:** the ratio of sin(angle of incidence) to sin(angle of
   refraction) is constant for a given pair of media.
   **sin i / sin r = n** (refractive index)

### Refractive index
n = speed of light in vacuum / speed of light in the medium = c/v

A higher refractive index means light slows down more and bends more.

### Key rule
- Light bends **towards the normal** when entering a denser medium (e.g.
  air → glass)
- Light bends **away from the normal** when entering a rarer medium (e.g.
  glass → air)

### Worked example
Why does a pencil appear bent when placed in a glass of water?
Light rays from the submerged part of the pencil bend (refract) as they
pass from water to air, changing direction — the eye perceives the pencil
as bent at the water's surface.`,
      videoUrl: "",
    },
  });

  const s1_quiz6 = await prisma.quiz.upsert({
    where: { topicId: s1_topic6.id },
    update: {},
    create: { topicId: s1_topic6.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz6.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz6.id,
          text: "Refractive index is defined as the ratio of:",
          options: [
            "Speed of light in medium to speed in vacuum",
            "Speed of light in vacuum to speed in medium",
            "Angle of incidence to angle of refraction",
            "Wavelength to frequency",
          ],
          answer: 1,
          explanation: "n = c/v, speed in vacuum divided by speed in the medium.",
          order: 1,
        },
        {
          quizId: s1_quiz6.id,
          text: "When light enters a denser medium from air, it bends:",
          options: ["Away from the normal", "Towards the normal", "Does not bend", "Reflects back"],
          answer: 1,
          explanation: "Light slows down in a denser medium and bends towards the normal.",
          order: 2,
        },
        {
          quizId: s1_quiz6.id,
          text: "A pencil appears bent in a glass of water because of:",
          options: ["Reflection", "Refraction", "Diffraction", "Dispersion"],
          answer: 1,
          explanation: "Light bends as it passes from water to air, creating the illusion of a bent pencil.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 7: Lenses ----
  const s1_chapter7 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "lenses" } },
    update: {},
    create: { subjectId: science1.id, title: "Lenses", slug: "lenses", order: 7 },
  });

  const s1_topic7 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter7.id, slug: "lens-formula-and-magnification" } },
    update: {},
    create: {
      chapterId: s1_chapter7.id,
      title: "Lens Formula and Magnification",
      slug: "lens-formula-and-magnification",
      order: 1,
      notesMd: `## Lenses

### Types
- **Convex (converging) lens:** thicker at the centre, converges light,
  positive focal length
- **Concave (diverging) lens:** thinner at the centre, diverges light,
  negative focal length

### Lens Formula
**1/f = 1/v - 1/u**
(f = focal length, v = image distance, u = object distance — sign
conventions apply, distances measured from optical centre)

### Magnification
**m = h'/h = v/u**
(h' = image height, h = object height)
- m > 1 → magnified image
- m < 1 → diminished image
- Negative m → inverted image

### Power of a lens
**P = 1/f** (f in metres), measured in **dioptres (D)**
Convex lens → positive power; Concave lens → negative power

### Worked example
A convex lens has f = 10 cm. An object is placed at u = -15 cm. Find v.
1/f = 1/v - 1/u → 1/10 = 1/v - 1/(-15) → 1/v = 1/10 - 1/15 = 1/30
**v = 30 cm**`,
      videoUrl: "",
    },
  });

  const s1_quiz7 = await prisma.quiz.upsert({
    where: { topicId: s1_topic7.id },
    update: {},
    create: { topicId: s1_topic7.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz7.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz7.id,
          text: "A convex lens is also called a:",
          options: ["Diverging lens", "Converging lens", "Plano lens", "Cylindrical lens"],
          answer: 1,
          explanation: "Convex lenses converge (bring together) parallel light rays.",
          order: 1,
        },
        {
          quizId: s1_quiz7.id,
          text: "The power of a lens is calculated as:",
          options: ["f", "1/f (f in metres)", "f²", "2f"],
          answer: 1,
          explanation: "Power P = 1/f, where f is in metres, giving power in dioptres.",
          order: 2,
        },
        {
          quizId: s1_quiz7.id,
          text: "If magnification m is negative, the image formed is:",
          options: ["Erect and magnified", "Erect and diminished", "Inverted", "Virtual only"],
          answer: 2,
          explanation: "Negative magnification indicates an inverted (real) image.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 8: Metallurgy ----
  const s1_chapter8 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "metallurgy" } },
    update: {},
    create: { subjectId: science1.id, title: "Metallurgy", slug: "metallurgy", order: 8 },
  });

  const s1_topic8 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter8.id, slug: "extraction-of-metals" } },
    update: {},
    create: {
      chapterId: s1_chapter8.id,
      title: "Extraction of Metals from Ores",
      slug: "extraction-of-metals",
      order: 1,
      notesMd: `## Metallurgy

**Metallurgy** is the process of extracting pure metals from their ores.

### Key steps
1. **Concentration of ore** — removing impurities (gangue) from the raw ore
2. **Extraction of metal** — depends on the metal's reactivity:
   - Highly reactive metals (Na, K, Ca) → extracted by **electrolysis**
   - Moderately reactive metals (Fe, Zn, Cu) → extracted by **reduction**
     with carbon (in a blast furnace, for example)
   - Less reactive metals (Au, Ag) → found in free/native state, need
     minimal processing
3. **Refining** — purifying the extracted metal (e.g. electrolytic refining)

### Reactivity series (most to least reactive)
K, Na, Ca, Mg, Al, Zn, Fe, Pb, (H), Cu, Ag, Au

### Corrosion
Metals react with moisture/oxygen in air and slowly degrade — e.g. rusting
of iron (formation of Fe₂O₃·xH₂O). Prevented by painting, galvanising
(zinc coating), or alloying.

### Worked example
Why is aluminium extracted by electrolysis, not by carbon reduction?
Aluminium is highly reactive — carbon cannot reduce Al₂O₃ because aluminium
has a stronger affinity for oxygen than carbon does. Electrolysis is needed
to force the separation.`,
      videoUrl: "",
    },
  });

  const s1_quiz8 = await prisma.quiz.upsert({
    where: { topicId: s1_topic8.id },
    update: {},
    create: { topicId: s1_topic8.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz8.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz8.id,
          text: "Highly reactive metals like sodium are extracted by:",
          options: ["Carbon reduction", "Electrolysis", "Roasting", "Calcination"],
          answer: 1,
          explanation: "Very reactive metals need electrolysis since carbon can't reduce their ores.",
          order: 1,
        },
        {
          quizId: s1_quiz8.id,
          text: "Rusting of iron is an example of:",
          options: ["Reduction", "Corrosion", "Electrolysis", "Alloying"],
          answer: 1,
          explanation: "Rusting is a form of corrosion — iron reacting with moisture and oxygen.",
          order: 2,
        },
        {
          quizId: s1_quiz8.id,
          text: "Which metal is typically found in its free/native state due to low reactivity?",
          options: ["Iron", "Zinc", "Gold", "Aluminium"],
          answer: 2,
          explanation: "Gold is very unreactive and is often found uncombined in nature.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 9: Carbon Compounds ----
  const s1_chapter9 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "carbon-compounds" } },
    update: {},
    create: { subjectId: science1.id, title: "Carbon Compounds", slug: "carbon-compounds", order: 9 },
  });

  const s1_topic9 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter9.id, slug: "catenation-and-hydrocarbons" } },
    update: {},
    create: {
      chapterId: s1_chapter9.id,
      title: "Catenation, Hydrocarbons and Functional Groups",
      slug: "catenation-and-hydrocarbons",
      order: 1,
      notesMd: `## Carbon Compounds

### Why carbon forms so many compounds
- **Catenation:** carbon atoms can bond with each other to form long
  chains, branches, and rings — unique among elements
- **Tetravalency:** carbon has 4 valence electrons, forming 4 covalent bonds

### Hydrocarbons
Compounds made only of carbon and hydrogen:
- **Saturated (Alkanes):** only single bonds, general formula CₙH₂ₙ₊₂
  e.g. methane CH₄, ethane C₂H₆
- **Unsaturated (Alkenes/Alkynes):** contain double/triple bonds
  - Alkenes (CₙH₂ₙ): e.g. ethene C₂H₄
  - Alkynes (CₙH₂ₙ₋₂): e.g. ethyne C₂H₂

### Functional groups (common ones)
- **-OH** (Alcohol) e.g. ethanol C₂H₅OH
- **-COOH** (Carboxylic acid) e.g. acetic acid CH₃COOH
- **-CHO** (Aldehyde)

### Worked example
Identify the type of hydrocarbon: C₃H₈
General formula for alkanes is CₙH₂ₙ₊₂. For n=3: 2(3)+2 = 8 ✓
**C₃H₈ (propane) is a saturated alkane.**`,
      videoUrl: "",
    },
  });

  const s1_quiz9 = await prisma.quiz.upsert({
    where: { topicId: s1_topic9.id },
    update: {},
    create: { topicId: s1_topic9.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz9.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz9.id,
          text: "The property of carbon atoms bonding with each other to form chains is called:",
          options: ["Valency", "Catenation", "Isomerism", "Polymerisation"],
          answer: 1,
          explanation: "Catenation is carbon's unique ability to form long chains/rings with itself.",
          order: 1,
        },
        {
          quizId: s1_quiz9.id,
          text: "C₃H₈ belongs to which class of hydrocarbons?",
          options: ["Alkenes", "Alkynes", "Alkanes", "Aromatic"],
          answer: 2,
          explanation: "It fits CₙH₂ₙ₊₂ (n=3 → 8 H atoms), the alkane (saturated) formula.",
          order: 2,
        },
        {
          quizId: s1_quiz9.id,
          text: "The functional group -COOH represents a:",
          options: ["Alcohol", "Aldehyde", "Carboxylic acid", "Ketone"],
          answer: 2,
          explanation: "-COOH is the carboxylic acid functional group, as in acetic acid.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 10: Space Missions ----
  const s1_chapter10 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science1.id, slug: "space-missions" } },
    update: {},
    create: { subjectId: science1.id, title: "Space Missions", slug: "space-missions", order: 10 },
  });

  const s1_topic10 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s1_chapter10.id, slug: "isro-missions-and-satellite-types" } },
    update: {},
    create: {
      chapterId: s1_chapter10.id,
      title: "ISRO Missions and Types of Satellites",
      slug: "isro-missions-and-satellite-types",
      order: 1,
      notesMd: `## Space Missions

### ISRO (Indian Space Research Organisation)
India's national space agency, responsible for missions like:
- **Aryabhata (1975):** India's first satellite
- **Chandrayaan missions:** Moon exploration (Chandrayaan-3 achieved a
  successful soft landing near the Moon's south pole)
- **Mangalyaan (Mars Orbiter Mission):** made India the first country to
  reach Mars orbit in its very first attempt
- **Gaganyaan:** India's planned human spaceflight programme

### Types of orbits/satellites
- **LEO (Low Earth Orbit):** 200-2000 km altitude — used for imaging,
  scientific research (e.g. ISS)
- **GEO (Geostationary Orbit):** ~36,000 km altitude, orbits at the same
  rate as Earth's rotation, appears fixed over one location — used for
  communication and weather satellites
- **Polar orbit:** passes near the poles, useful for full-Earth coverage
  over time (e.g. remote sensing)

### Applications of satellites
Communication, weather forecasting, navigation (GPS/NavIC), remote sensing,
and scientific research.`,
      videoUrl: "",
    },
  });

  const s1_quiz10 = await prisma.quiz.upsert({
    where: { topicId: s1_topic10.id },
    update: {},
    create: { topicId: s1_topic10.id },
  });

  if ((await prisma.question.count({ where: { quizId: s1_quiz10.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s1_quiz10.id,
          text: "India's first satellite was named:",
          options: ["Chandrayaan", "Mangalyaan", "Aryabhata", "Gaganyaan"],
          answer: 2,
          explanation: "Aryabhata, launched in 1975, was India's first satellite.",
          order: 1,
        },
        {
          quizId: s1_quiz10.id,
          text: "A geostationary satellite appears fixed over one location because it:",
          options: [
            "Does not move at all",
            "Orbits at the same rate as Earth's rotation",
            "Is very close to Earth's surface",
            "Uses fuel to stay in place",
          ],
          answer: 1,
          explanation: "GEO satellites orbit at ~36,000 km with a period matching Earth's rotation.",
          order: 2,
        },
        {
          quizId: s1_quiz10.id,
          text: "Mangalyaan is significant because it:",
          options: [
            "Was India's first satellite",
            "Landed humans on the Moon",
            "Made India the first country to reach Mars orbit on its first attempt",
            "Was a communication satellite",
          ],
          answer: 2,
          explanation: "Mangalyaan achieved Mars orbit insertion successfully on India's first attempt — a global first.",
          order: 3,
        },
      ],
    });
  }

  // ==================== SSC Science and Technology Part 2 ====================
  const science2 = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "science-2" } },
  });

  // ---- Chapter 1: Heredity and Evolution ----
  const s2_chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "heredity-and-evolution" } },
    update: {},
    create: { subjectId: science2.id, title: "Heredity and Evolution", slug: "heredity-and-evolution", order: 1 },
  });

  const s2_topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter1.id, slug: "mendels-laws-of-inheritance" } },
    update: {},
    create: {
      chapterId: s2_chapter1.id,
      title: "Mendel's Laws of Inheritance",
      slug: "mendels-laws-of-inheritance",
      order: 1,
      notesMd: `## Heredity and Evolution

**Heredity** is the passing of traits from parents to offspring through genes.

### Mendel's Laws (from pea plant experiments)
1. **Law of Dominance:** in a heterozygous pair, only the dominant allele's
   trait is expressed; the recessive allele is masked.
2. **Law of Segregation:** each parent's two alleles for a trait separate
   during gamete formation — offspring receive one allele from each parent.
3. **Law of Independent Assortment:** alleles of different genes segregate
   independently of one another during gamete formation.

### Key terms
- **Dominant trait:** expressed even with one copy (e.g. Tall - T)
- **Recessive trait:** expressed only with two copies (e.g. dwarf - t)
- **Genotype:** genetic makeup (e.g. Tt); **Phenotype:** observable trait

### Evolution
The gradual change in species over generations through **natural
selection** — organisms better suited to their environment survive and
reproduce more, passing on favourable traits.

### Worked example
Cross Tt × Tt (both heterozygous tall). What ratio of tall:dwarf offspring
is expected?
Genotype ratio: 1 TT : 2 Tt : 1 tt → Phenotype ratio = **3 tall : 1 dwarf**`,
      videoUrl: "",
    },
  });

  const s2_quiz1 = await prisma.quiz.upsert({
    where: { topicId: s2_topic1.id },
    update: {},
    create: { topicId: s2_topic1.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz1.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz1.id,
          text: "Crossing Tt × Tt gives what phenotype ratio of tall:dwarf?",
          options: ["1:1", "1:3", "3:1", "2:2"],
          answer: 2,
          explanation: "Genotype ratio 1TT:2Tt:1tt gives phenotype ratio 3 tall : 1 dwarf.",
          order: 1,
        },
        {
          quizId: s2_quiz1.id,
          text: "A trait expressed only when two recessive alleles are present is called:",
          options: ["Dominant", "Recessive", "Codominant", "Linked"],
          answer: 1,
          explanation: "Recessive traits need both alleles to be recessive to show up.",
          order: 2,
        },
        {
          quizId: s2_quiz1.id,
          text: "Evolution occurs mainly through the process of:",
          options: ["Mutation only", "Natural selection", "Cloning", "Fertilisation"],
          answer: 1,
          explanation: "Natural selection favours traits that improve survival and reproduction over generations.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 2: Life Processes in Living Organisms — Part 1 ----
  const s2_chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "life-processes-in-living-organisms-part-1" } },
    update: {},
    create: { subjectId: science2.id, title: "Life Processes in Living Organisms — Part 1", slug: "life-processes-in-living-organisms-part-1", order: 2 },
  });

  const s2_topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter2.id, slug: "nutrition-and-respiration" } },
    update: {},
    create: {
      chapterId: s2_chapter2.id,
      title: "Nutrition and Respiration in Organisms",
      slug: "nutrition-and-respiration",
      order: 1,
      notesMd: `## Life Processes — Nutrition and Respiration

### Nutrition
The process of taking in and utilising food for energy, growth, and repair.
- **Autotrophic nutrition:** organisms make their own food (e.g. plants, via
  photosynthesis)
- **Heterotrophic nutrition:** organisms depend on others for food
  (e.g. animals) — includes holozoic, saprophytic, and parasitic modes

### Photosynthesis (autotrophic nutrition in plants)
6CO₂ + 6H₂O --(sunlight, chlorophyll)--> C₆H₁₂O₆ + 6O₂

### Respiration
The process of breaking down food to release energy (ATP).
- **Aerobic respiration** (with oxygen): Glucose + O₂ → CO₂ + H₂O + energy
  (much more energy released)
- **Anaerobic respiration** (without oxygen): Glucose → alcohol/lactic acid
  + energy (less energy released) — e.g. yeast fermentation, muscle cramps
  from lactic acid buildup during intense exercise

### Worked example
Why do muscles feel sore after intense exercise?
When oxygen supply is insufficient, muscle cells switch to anaerobic
respiration, producing **lactic acid**, which builds up and causes cramps
and soreness.`,
      videoUrl: "",
    },
  });

  const s2_quiz2 = await prisma.quiz.upsert({
    where: { topicId: s2_topic2.id },
    update: {},
    create: { topicId: s2_topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz2.id,
          text: "Muscle soreness after intense exercise is due to buildup of:",
          options: ["Glucose", "Lactic acid", "Carbon dioxide", "Oxygen"],
          answer: 1,
          explanation: "Anaerobic respiration in muscles produces lactic acid when oxygen is insufficient.",
          order: 1,
        },
        {
          quizId: s2_quiz2.id,
          text: "Plants prepare their own food through:",
          options: ["Heterotrophic nutrition", "Autotrophic nutrition (photosynthesis)", "Parasitic nutrition", "Saprophytic nutrition"],
          answer: 1,
          explanation: "Plants are autotrophs, making food via photosynthesis using sunlight.",
          order: 2,
        },
        {
          quizId: s2_quiz2.id,
          text: "Aerobic respiration releases more energy than anaerobic respiration because it:",
          options: [
            "Uses less glucose",
            "Uses oxygen for complete breakdown of glucose",
            "Occurs faster",
            "Produces lactic acid",
          ],
          answer: 1,
          explanation: "Complete oxidation of glucose with oxygen releases significantly more ATP.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: Life Processes in Living Organisms — Part 2 ----
  const s2_chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "life-processes-in-living-organisms-part-2" } },
    update: {},
    create: { subjectId: science2.id, title: "Life Processes in Living Organisms — Part 2", slug: "life-processes-in-living-organisms-part-2", order: 3 },
  });

  const s2_topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter3.id, slug: "excretion-and-transportation" } },
    update: {},
    create: {
      chapterId: s2_chapter3.id,
      title: "Excretion and Transportation Systems",
      slug: "excretion-and-transportation",
      order: 1,
      notesMd: `## Life Processes — Excretion and Transportation

### Excretion
The removal of metabolic waste products from the body.
- Humans: **kidneys** filter blood, forming urine (removes urea, excess
  water/salts)
- Basic unit of the kidney: **nephron**

### Transportation in humans (circulatory system)
- **Heart:** a muscular pump with 4 chambers (2 atria, 2 ventricles)
- **Blood vessels:**
  - Arteries — carry oxygenated blood away from the heart (except
    pulmonary artery)
  - Veins — carry deoxygenated blood towards the heart (except pulmonary
    vein)
  - Capillaries — thin-walled vessels for exchange of substances
- **Double circulation:** blood passes through the heart twice per cycle
  (pulmonary circuit + systemic circuit) — ensures oxygenated and
  deoxygenated blood don't mix, more efficient for warm-blooded animals

### Transportation in plants
- **Xylem:** transports water and minerals upward from roots to leaves
- **Phloem:** transports food (prepared by photosynthesis) throughout the
  plant, in both directions (translocation)

### Worked example
Why do mammals need double circulation?
It keeps oxygenated and deoxygenated blood separate, maintaining higher
blood pressure and more efficient oxygen delivery — essential for
maintaining a constant, warm body temperature.`,
      videoUrl: "",
    },
  });

  const s2_quiz3 = await prisma.quiz.upsert({
    where: { topicId: s2_topic3.id },
    update: {},
    create: { topicId: s2_topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz3.id,
          text: "The basic functional unit of the kidney is called the:",
          options: ["Neuron", "Nephron", "Alveolus", "Villus"],
          answer: 1,
          explanation: "Nephrons are the microscopic filtering units of the kidney.",
          order: 1,
        },
        {
          quizId: s2_quiz3.id,
          text: "In plants, water and minerals are transported by:",
          options: ["Phloem", "Xylem", "Stomata", "Cuticle"],
          answer: 1,
          explanation: "Xylem carries water and dissolved minerals from roots to the rest of the plant.",
          order: 2,
        },
        {
          quizId: s2_quiz3.id,
          text: "Double circulation in mammals mainly helps to:",
          options: [
            "Reduce the heart's workload",
            "Keep oxygenated and deoxygenated blood separate",
            "Speed up digestion",
            "Increase excretion",
          ],
          answer: 1,
          explanation: "Separating the two blood types allows more efficient oxygen delivery.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 4: Environmental Management ----
  const s2_chapter4 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "environmental-management" } },
    update: {},
    create: { subjectId: science2.id, title: "Environmental Management", slug: "environmental-management", order: 4 },
  });

  const s2_topic4 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter4.id, slug: "pollution-and-waste-management" } },
    update: {},
    create: {
      chapterId: s2_chapter4.id,
      title: "Pollution, Waste Management and Sustainable Development",
      slug: "pollution-and-waste-management",
      order: 1,
      notesMd: `## Environmental Management

### Types of pollution
- **Air pollution:** vehicle/industrial emissions, burning fossil fuels
- **Water pollution:** industrial effluents, sewage, agricultural runoff
- **Soil pollution:** pesticides, plastic waste, chemical dumping
- **Noise pollution:** traffic, machinery, loudspeakers

### Waste management — the 3 R's
1. **Reduce** — use fewer resources, minimise waste generation
2. **Reuse** — use items again instead of discarding
3. **Recycle** — process waste materials into new products

### Solid waste segregation
- **Biodegradable waste** — decomposes naturally (food scraps, paper)
- **Non-biodegradable waste** — does not decompose easily (plastic, metal) —
  needs recycling or safe disposal

### Sustainable development
Meeting present needs without compromising the ability of future
generations to meet their own needs — balancing economic growth,
environmental protection, and social wellbeing.

### Worked example
Why is segregating waste at source important?
It keeps biodegradable and non-biodegradable waste separate, making
composting and recycling more efficient and reducing landfill burden.`,
      videoUrl: "",
    },
  });

  const s2_quiz4 = await prisma.quiz.upsert({
    where: { topicId: s2_topic4.id },
    update: {},
    create: { topicId: s2_topic4.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz4.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz4.id,
          text: "Which of these is a biodegradable waste?",
          options: ["Plastic bottle", "Food scraps", "Metal scrap", "Glass"],
          answer: 1,
          explanation: "Food scraps decompose naturally through biological processes.",
          order: 1,
        },
        {
          quizId: s2_quiz4.id,
          text: "The 3 R's of waste management are:",
          options: [
            "Read, Write, Recycle",
            "Reduce, Reuse, Recycle",
            "Remove, Replace, Recycle",
            "Reduce, Repair, Reuse",
          ],
          answer: 1,
          explanation: "Reduce, Reuse, Recycle form the core waste management strategy.",
          order: 2,
        },
        {
          quizId: s2_quiz4.id,
          text: "Sustainable development aims to balance:",
          options: [
            "Only economic growth",
            "Economic growth, environment protection, and social wellbeing",
            "Only environmental protection",
            "Only population control",
          ],
          answer: 1,
          explanation: "Sustainable development balances all three pillars together.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 5: Towards Green Energy ----
  const s2_chapter5 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "towards-green-energy" } },
    update: {},
    create: { subjectId: science2.id, title: "Towards Green Energy", slug: "towards-green-energy", order: 5 },
  });

  const s2_topic5 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter5.id, slug: "renewable-vs-non-renewable-energy" } },
    update: {},
    create: {
      chapterId: s2_chapter5.id,
      title: "Renewable vs Non-renewable Energy Sources",
      slug: "renewable-vs-non-renewable-energy",
      order: 1,
      notesMd: `## Towards Green Energy

### Non-renewable energy sources
Formed over millions of years, limited in supply, and cause pollution when
used:
- Coal, petroleum, natural gas (fossil fuels)
- Nuclear fuel (uranium)

### Renewable energy sources
Naturally replenished and generally cleaner:
- **Solar energy** — captured via solar panels/photovoltaic cells
- **Wind energy** — wind turbines convert kinetic energy to electricity
- **Hydropower** — flowing/falling water drives turbines
- **Biomass energy** — organic matter (crop waste, dung) converted to fuel
- **Geothermal energy** — heat from within the Earth

### Why shift to green energy?
- Fossil fuels are depleting and cause air pollution + greenhouse gas
  emissions (contributing to global warming)
- Renewable sources are sustainable and generally have a lower
  environmental footprint

### Worked example
Why is solar energy considered a "green" energy source?
It comes from the sun (virtually inexhaustible), produces no direct
greenhouse gas emissions during generation, and doesn't deplete natural
resources.`,
      videoUrl: "",
    },
  });

  const s2_quiz5 = await prisma.quiz.upsert({
    where: { topicId: s2_topic5.id },
    update: {},
    create: { topicId: s2_topic5.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz5.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz5.id,
          text: "Which of these is a non-renewable energy source?",
          options: ["Solar energy", "Wind energy", "Coal", "Hydropower"],
          answer: 2,
          explanation: "Coal is a fossil fuel, formed over millions of years, and is limited in supply.",
          order: 1,
        },
        {
          quizId: s2_quiz5.id,
          text: "Wind energy is generated by:",
          options: ["Burning wind turbines", "Converting kinetic energy of wind to electricity", "Solar panels", "Nuclear fission"],
          answer: 1,
          explanation: "Wind turbines convert the wind's kinetic energy into electrical energy.",
          order: 2,
        },
        {
          quizId: s2_quiz5.id,
          text: "A major reason to shift towards renewable energy is:",
          options: [
            "Renewable sources are always cheaper immediately",
            "Fossil fuels are depleting and cause pollution",
            "Renewable sources need no infrastructure",
            "Fossil fuels produce no pollution",
          ],
          answer: 1,
          explanation: "Fossil fuel depletion and pollution are key drivers for the shift to green energy.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 6: Animal Classification ----
  const s2_chapter6 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "animal-classification" } },
    update: {},
    create: { subjectId: science2.id, title: "Animal Classification", slug: "animal-classification", order: 6 },
  });

  const s2_topic6 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter6.id, slug: "phylum-chordata-and-vertebrate-classes" } },
    update: {},
    create: {
      chapterId: s2_chapter6.id,
      title: "Phylum Chordata and the Five Vertebrate Classes",
      slug: "phylum-chordata-and-vertebrate-classes",
      order: 1,
      notesMd: `## Animal Classification

Animals are broadly divided into **non-chordates** (no backbone, e.g.
insects, worms, molluscs) and **chordates** (possess a notochord at some
stage; includes all vertebrates).

### Five classes of vertebrates (Phylum Chordata)
1. **Pisces (Fish)** — gills for respiration, live in water, cold-blooded,
   scales, fins. e.g. Rohu, Shark
2. **Amphibia** — live both on land and water, moist skin, cold-blooded.
   e.g. Frog, Toad
3. **Reptilia** — dry scaly skin, cold-blooded, lay eggs on land.
   e.g. Snake, Lizard, Turtle
4. **Aves (Birds)** — warm-blooded, feathers, beak, forelimbs modified into
   wings, lay hard-shelled eggs. e.g. Sparrow, Eagle
5. **Mammalia** — warm-blooded, hair/fur, mammary glands (feed young with
   milk), mostly give birth to live young. e.g. Human, Dog, Whale

### Key distinguishing feature
Cold-blooded (Pisces, Amphibia, Reptilia) vs Warm-blooded (Aves, Mammalia):
warm-blooded animals maintain a constant body temperature regardless of
surroundings.

### Worked example
Why is a whale classified as a mammal, not a fish, despite living in water?
It is warm-blooded, breathes air via lungs, has some body hair, and feeds
its young with milk — all mammalian characteristics, regardless of its
aquatic habitat.`,
      videoUrl: "",
    },
  });

  const s2_quiz6 = await prisma.quiz.upsert({
    where: { topicId: s2_topic6.id },
    update: {},
    create: { topicId: s2_topic6.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz6.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz6.id,
          text: "A whale is classified as a mammal mainly because it:",
          options: [
            "Lives in water",
            "Is warm-blooded and feeds young with milk",
            "Has gills",
            "Lays eggs",
          ],
          answer: 1,
          explanation: "Being warm-blooded and having mammary glands are defining mammalian traits.",
          order: 1,
        },
        {
          quizId: s2_quiz6.id,
          text: "Which vertebrate class is cold-blooded and lives both on land and in water?",
          options: ["Pisces", "Amphibia", "Aves", "Mammalia"],
          answer: 1,
          explanation: "Amphibians like frogs live a dual life on land and water, and are cold-blooded.",
          order: 2,
        },
        {
          quizId: s2_quiz6.id,
          text: "Warm-blooded animals are able to:",
          options: [
            "Only survive in warm climates",
            "Maintain a constant body temperature regardless of surroundings",
            "Change their body temperature with the environment",
            "Live only in water",
          ],
          answer: 1,
          explanation: "Warm-blooded (endothermic) animals regulate their internal temperature internally.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 7: Introduction to Microbiology ----
  const s2_chapter7 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "introduction-to-microbiology" } },
    update: {},
    create: { subjectId: science2.id, title: "Introduction to Microbiology", slug: "introduction-to-microbiology", order: 7 },
  });

  const s2_topic7 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter7.id, slug: "microorganisms-useful-and-harmful" } },
    update: {},
    create: {
      chapterId: s2_chapter7.id,
      title: "Microorganisms — Useful and Harmful Effects",
      slug: "microorganisms-useful-and-harmful",
      order: 1,
      notesMd: `## Introduction to Microbiology

**Microorganisms** are tiny living things visible only under a microscope:
bacteria, fungi, viruses, protozoa, algae.

### Useful microorganisms
- **Bacteria:** curd formation (Lactobacillus), nitrogen fixation in soil,
  antibiotic production
- **Fungi (yeast):** fermentation — bread-making, brewing (alcohol
  production)
- Used in **biogas** production and sewage treatment

### Harmful microorganisms
- Cause diseases in humans, animals, and plants (pathogens)
  - Bacterial: cholera, tuberculosis
  - Viral: influenza, common cold, COVID-19
  - Fungal: ringworm, athlete's foot
- Cause food spoilage

### Immunity and vaccines
**Vaccines** contain a weakened/inactive form of a pathogen, training the
immune system to recognise and fight it quickly if exposed to the real
pathogen later — building **immunity**.

### Worked example
How does curd form from milk?
The bacterium *Lactobacillus* converts lactose (milk sugar) into lactic
acid, which causes milk proteins to coagulate, turning milk into curd.`,
      videoUrl: "",
    },
  });

  const s2_quiz7 = await prisma.quiz.upsert({
    where: { topicId: s2_topic7.id },
    update: {},
    create: { topicId: s2_topic7.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz7.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz7.id,
          text: "Curd is formed from milk due to the action of:",
          options: ["Yeast", "Lactobacillus bacteria", "A virus", "Algae"],
          answer: 1,
          explanation: "Lactobacillus converts lactose to lactic acid, coagulating milk proteins into curd.",
          order: 1,
        },
        {
          quizId: s2_quiz7.id,
          text: "A vaccine works by:",
          options: [
            "Killing all microorganisms in the body instantly",
            "Training the immune system using a weakened/inactive pathogen",
            "Removing the need for an immune system",
            "Curing diseases after infection",
          ],
          answer: 1,
          explanation: "Vaccines prime the immune system to respond quickly to future real infections.",
          order: 2,
        },
        {
          quizId: s2_quiz7.id,
          text: "Which of these diseases is caused by a virus?",
          options: ["Tuberculosis", "Cholera", "Common cold", "Ringworm"],
          answer: 2,
          explanation: "The common cold is caused by viruses; TB and cholera are bacterial, ringworm is fungal.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 8: Cell Biology and Biotechnology ----
  const s2_chapter8 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "cell-biology-and-biotechnology" } },
    update: {},
    create: { subjectId: science2.id, title: "Cell Biology and Biotechnology", slug: "cell-biology-and-biotechnology", order: 8 },
  });

  const s2_topic8 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter8.id, slug: "cell-structure-and-biotechnology-applications" } },
    update: {},
    create: {
      chapterId: s2_chapter8.id,
      title: "Cell Structure and Applications of Biotechnology",
      slug: "cell-structure-and-biotechnology-applications",
      order: 1,
      notesMd: `## Cell Biology and Biotechnology

### The cell — basic unit of life
- **Cell membrane:** controls what enters/exits the cell
- **Nucleus:** contains DNA, controls cell activities
- **Mitochondria:** "powerhouse of the cell" — site of aerobic respiration,
  produces ATP (energy)
- **Cell wall:** present only in plant cells, provides rigidity (made of
  cellulose)
- **Chloroplast:** present in plant cells, site of photosynthesis

### Biotechnology
The use of living organisms/biological systems to develop useful products
and technologies.

### Applications
- **Genetic engineering:** modifying an organism's DNA — e.g. producing
  human insulin using genetically modified bacteria
- **Tissue culture:** growing plant tissue in a nutrient medium to produce
  many identical plants quickly
- **Biotechnology in agriculture:** genetically modified (GM) crops with
  pest resistance or higher yield
- **Biotechnology in medicine:** vaccines, antibiotics, diagnostic kits

### Worked example
How is human insulin produced using biotechnology?
The human insulin gene is inserted into bacterial DNA (genetic
engineering). The bacteria then produce insulin, which is extracted and
purified for use by diabetic patients — cheaper and safer than earlier
animal-extracted insulin.`,
      videoUrl: "",
    },
  });

  const s2_quiz8 = await prisma.quiz.upsert({
    where: { topicId: s2_topic8.id },
    update: {},
    create: { topicId: s2_topic8.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz8.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz8.id,
          text: "The 'powerhouse of the cell' is the:",
          options: ["Nucleus", "Cell membrane", "Mitochondria", "Cell wall"],
          answer: 2,
          explanation: "Mitochondria produce ATP through aerobic respiration.",
          order: 1,
        },
        {
          quizId: s2_quiz8.id,
          text: "Human insulin is now commercially produced using:",
          options: [
            "Extraction from animal pancreas only",
            "Genetically engineered bacteria",
            "Plant tissue culture",
            "Synthetic chemical reactions only",
          ],
          answer: 1,
          explanation: "The human insulin gene is inserted into bacteria, which then produce insulin.",
          order: 2,
        },
        {
          quizId: s2_quiz8.id,
          text: "Which cell structure is found in plant cells but not animal cells?",
          options: ["Nucleus", "Mitochondria", "Cell wall", "Cell membrane"],
          answer: 2,
          explanation: "The rigid cellulose cell wall is unique to plant cells (and some other organisms).",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 9: Social Health ----
  const s2_chapter9 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: science2.id, slug: "social-health" } },
    update: {},
    create: { subjectId: science2.id, title: "Social Health", slug: "social-health", order: 9 },
  });

  const s2_topic9 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: s2_chapter9.id, slug: "addiction-and-lifestyle-diseases" } },
    update: {},
    create: {
      chapterId: s2_chapter9.id,
      title: "Addiction, Lifestyle Diseases and Public Health",
      slug: "addiction-and-lifestyle-diseases",
      order: 1,
      notesMd: `## Social Health

**Social health** refers to a person's ability to form healthy
relationships and function well within society, alongside physical and
mental wellbeing.

### Addiction
Habitual, compulsive use of a substance despite harmful consequences —
common addictive substances: tobacco, alcohol, drugs.
- Tobacco use is linked to lung cancer, heart disease, respiratory illness
- Alcohol abuse damages the liver and impairs judgement
- Drug addiction affects the nervous system and can be life-threatening

### Lifestyle diseases
Diseases linked to lifestyle choices rather than infection:
- **Obesity** — excess body fat from poor diet and inactivity
- **Diabetes (Type 2)** — often linked to obesity and sedentary lifestyle
- **Hypertension (high blood pressure)** — linked to stress, diet, obesity
- **Cardiovascular disease** — heart/blood vessel disease, often linked to
  smoking, poor diet, inactivity

### Prevention
Balanced diet, regular exercise, avoiding addictive substances, adequate
sleep, and stress management are key preventive measures.

### Worked example
Why are lifestyle diseases increasing in modern society?
Sedentary jobs, processed food consumption, stress, and reduced physical
activity have all increased, contributing to a rise in obesity, diabetes,
and related conditions.`,
      videoUrl: "",
    },
  });

  const s2_quiz9 = await prisma.quiz.upsert({
    where: { topicId: s2_topic9.id },
    update: {},
    create: { topicId: s2_topic9.id },
  });

  if ((await prisma.question.count({ where: { quizId: s2_quiz9.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: s2_quiz9.id,
          text: "Which of these is classified as a lifestyle disease?",
          options: ["Malaria", "Type 2 Diabetes", "Common cold", "Tuberculosis"],
          answer: 1,
          explanation: "Type 2 diabetes is strongly linked to diet and lifestyle rather than infection.",
          order: 1,
        },
        {
          quizId: s2_quiz9.id,
          text: "Tobacco use is most strongly linked to:",
          options: ["Improved digestion", "Lung cancer and respiratory illness", "Better sleep", "Stronger bones"],
          answer: 1,
          explanation: "Tobacco is a leading cause of lung cancer and other respiratory diseases.",
          order: 2,
        },
        {
          quizId: s2_quiz9.id,
          text: "A key preventive measure against lifestyle diseases is:",
          options: [
            "Skipping meals entirely",
            "Balanced diet and regular exercise",
            "Avoiding all social contact",
            "Reducing sleep hours",
          ],
          answer: 1,
          explanation: "Balanced nutrition and physical activity are core preventive strategies.",
          order: 3,
        },
      ],
    });
  }

  // ==================== SSC History & Political Science ====================
  const historyPolity = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "history-polity" } },
  });

  // ---- Chapter 1: Historiography: Development in the West ----
  const hp_chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "historiography-development-in-the-west" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "Historiography: Development in the West", slug: "historiography-development-in-the-west", order: 1 },
  });

  const hp_topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: hp_chapter1.id, slug: "meaning-and-evolution-of-historiography" } },
    update: {},
    create: {
      chapterId: hp_chapter1.id,
      title: "Meaning and Evolution of Historiography",
      slug: "meaning-and-evolution-of-historiography",
      order: 1,
      notesMd: `## Historiography

**Historiography** is the study of how history is written — the methods,
sources, and interpretations historians use, and how these have changed
over time.

### Evolution in the West
- **Ancient period:** Greek historian **Herodotus** is often called the
  "Father of History" for his systematic account of the Greco-Persian Wars;
  **Thucydides** emphasised accuracy and cause-effect analysis.
- **Medieval period:** history writing was often intertwined with religious
  narratives and chronicles.
- **Renaissance onward:** a more scientific, evidence-based approach
  developed, using primary sources critically.
- **Modern historiography:** incorporates social, economic, and cultural
  history, not just political/military events — influenced by
  interdisciplinary approaches (using archaeology, sociology, economics).

### Why historiography matters
Understanding *how* history is constructed helps us evaluate bias,
context, and reliability of historical accounts, rather than accepting
them at face value.

### Worked example
Why is Herodotus called the "Father of History"?
He was among the first to systematically collect, verify, and present
historical accounts (on the Greco-Persian Wars) rather than relying purely
on myth or legend — establishing an early method of historical inquiry.`,
      videoUrl: "",
    },
  });

  const hp_quiz1 = await prisma.quiz.upsert({
    where: { topicId: hp_topic1.id },
    update: {},
    create: { topicId: hp_topic1.id },
  });

  if ((await prisma.question.count({ where: { quizId: hp_quiz1.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: hp_quiz1.id,
          text: "Who is often called the 'Father of History'?",
          options: ["Thucydides", "Herodotus", "Plato", "Aristotle"],
          answer: 1,
          explanation: "Herodotus is credited with writing one of the first systematic historical accounts.",
          order: 1,
        },
        {
          quizId: hp_quiz1.id,
          text: "Historiography is best defined as the study of:",
          options: [
            "Ancient artifacts only",
            "How history is written and interpreted",
            "Geography of historical events",
            "Political systems only",
          ],
          answer: 1,
          explanation: "Historiography examines methods, sources, and interpretation in history writing.",
          order: 2,
        },
        {
          quizId: hp_quiz1.id,
          text: "Modern historiography differs from earlier approaches by:",
          options: [
            "Focusing only on kings and wars",
            "Including social, economic, and cultural history",
            "Rejecting all written sources",
            "Ignoring evidence entirely",
          ],
          answer: 1,
          explanation: "Modern historiography broadens beyond political/military history to social and economic history.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 2: Sources of History ----
  const hp_chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "sources-of-history" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "Sources of History", slug: "sources-of-history", order: 2 },
  });

  const hp_topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: hp_chapter2.id, slug: "types-of-historical-sources" } },
    update: {},
    create: {
      chapterId: hp_chapter2.id,
      title: "Types of Historical Sources: Material, Written, Oral",
      slug: "types-of-historical-sources",
      order: 1,
      notesMd: `## Sources of History

Historians reconstruct the past using various types of evidence:

### Material sources
Physical remains — monuments, coins, tools, pottery, inscriptions,
buildings. Studied through **archaeology**.

### Written sources
- **Primary sources:** original documents from the time period — letters,
  official records, inscriptions, autobiographies
- **Secondary sources:** later interpretations/analyses written after the
  events — textbooks, historical research papers

### Oral sources
Traditions, folk songs, stories passed down through generations — useful
where written records are scarce, though requires careful cross-checking
for accuracy.

### Visual sources
Photographs, paintings, films — especially valuable for modern history
(post-19th century onward).

### Why cross-verification matters
No single source is complete or free of bias — historians cross-check
multiple sources (material + written + oral) to build a more reliable and
balanced picture of the past.

### Worked example
Why are inscriptions considered strong primary sources?
They are usually contemporary records (carved/written at the time of the
event), often officially sanctioned, and provide direct evidence rather
than later reconstruction.`,
      videoUrl: "",
    },
  });

  const hp_quiz2 = await prisma.quiz.upsert({
    where: { topicId: hp_topic2.id },
    update: {},
    create: { topicId: hp_topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: hp_quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: hp_quiz2.id,
          text: "Coins, tools, and inscriptions are examples of:",
          options: ["Oral sources", "Material sources", "Secondary sources", "Visual sources only"],
          answer: 1,
          explanation: "Physical remains studied through archaeology are material sources.",
          order: 1,
        },
        {
          quizId: hp_quiz2.id,
          text: "A textbook written today about ancient India is an example of a:",
          options: ["Primary source", "Secondary source", "Oral source", "Material source"],
          answer: 1,
          explanation: "It's a later interpretation of past events, making it a secondary source.",
          order: 2,
        },
        {
          quizId: hp_quiz2.id,
          text: "Why do historians cross-verify multiple sources?",
          options: [
            "To make research take longer",
            "Because no single source is complete or free of bias",
            "It's not actually necessary",
            "Only material sources need verification",
          ],
          answer: 1,
          explanation: "Combining sources helps build a balanced, more reliable historical picture.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: 1857 - The Revolt and its Legacy ----
  const hp_chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "1857-the-revolt-and-its-legacy" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "1857 - The Revolt and its Legacy", slug: "1857-the-revolt-and-its-legacy", order: 3 },
  });

  const hp_topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: hp_chapter3.id, slug: "causes-and-outcomes-of-1857-revolt" } },
    update: {},
    create: {
      chapterId: hp_chapter3.id,
      title: "Causes and Outcomes of the 1857 Revolt",
      slug: "causes-and-outcomes-of-1857-revolt",
      order: 1,
      notesMd: `## 1857 - The Revolt and its Legacy

The Revolt of 1857 was a major uprising against British East India Company
rule in India — sometimes called India's First War of Independence.

### Causes
- **Political:** Doctrine of Lapse (annexation of princely states without
  natural heirs), annexation of Awadh
- **Economic:** heavy taxation, destruction of traditional industries,
  exploitative land revenue policies
- **Social/Religious:** interference in social customs, fear of forced
  conversion, disrespect for religious sentiments
- **Military:** the immediate trigger — the introduction of the new
  Enfield rifle cartridges rumoured to be greased with cow and pig fat,
  offending both Hindu and Muslim sepoys

### Key events
Started at **Meerut** in May 1857, spreading to Delhi, Kanpur, Lucknow,
Jhansi and other regions. Key leaders included Rani Lakshmibai, Tantia
Tope, Bahadur Shah Zafar (nominal leader), and Nana Saheb.

### Outcomes/Legacy
- The revolt was suppressed by 1858, but it ended East India Company rule
- The British Crown took direct control of India (Government of India Act,
  1858)
- It sowed early seeds of Indian nationalism, later inspiring the freedom
  movement

### Worked example
Why is 1857 significant despite its suppression?
Even though it failed militarily, it marked the first large-scale,
united resistance across regions and communities against British rule,
becoming a symbol and inspiration for later freedom struggles.`,
      videoUrl: "",
    },
  });

  const hp_quiz3 = await prisma.quiz.upsert({
    where: { topicId: hp_topic3.id },
    update: {},
    create: { topicId: hp_topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: hp_quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: hp_quiz3.id,
          text: "The immediate trigger for the 1857 Revolt was:",
          options: [
            "The Doctrine of Lapse",
            "The new Enfield rifle cartridges",
            "Heavy taxation",
            "Annexation of Awadh",
          ],
          answer: 1,
          explanation: "Rumours about the greased cartridges sparked the immediate uprising among sepoys.",
          order: 1,
        },
        {
          quizId: hp_quiz3.id,
          text: "After the 1857 Revolt, control of India passed to:",
          options: [
            "The Mughal Empire",
            "The East India Company (unchanged)",
            "The British Crown directly",
            "Local princely states",
          ],
          answer: 2,
          explanation: "The Government of India Act, 1858 transferred control from the Company to the Crown.",
          order: 2,
        },
        {
          quizId: hp_quiz3.id,
          text: "The 1857 Revolt began at:",
          options: ["Delhi", "Meerut", "Lucknow", "Jhansi"],
          answer: 1,
          explanation: "The uprising started among sepoys at Meerut in May 1857 before spreading.",
          order: 3,
        },
      ],
    });
  }

  // ==================== SSC History & Political Science ====================
  const historyPolity = await prisma.subject.findUniqueOrThrow({
    where: { boardId_slug: { boardId: ssc.id, slug: "history-polity" } },
  });

  // ---- Chapter 1: Historiography: Development in the West ----
  const h_chapter1 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "historiography-development-in-the-west" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "Historiography: Development in the West", slug: "historiography-development-in-the-west", order: 1 },
  });

  const h_topic1 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: h_chapter1.id, slug: "meaning-and-evolution-of-historiography" } },
    update: {},
    create: {
      chapterId: h_chapter1.id,
      title: "Meaning and Evolution of Historiography",
      slug: "meaning-and-evolution-of-historiography",
      order: 1,
      notesMd: `## Historiography

**Historiography** is the study of how history is written — the methods,
sources, and interpretations historians use, and how these have changed
over time.

### Early Western historians
- **Herodotus** (Greek, 5th century BCE) — often called the "Father of
  History"; wrote about the Greco-Persian Wars, combining eyewitness
  accounts with travel observations
- **Thucydides** — wrote about the Peloponnesian War, focused on
  cause-and-effect and eyewitness accuracy rather than divine explanations

### Evolution over time
- **Ancient historiography:** blended myth, legend, and fact
- **Medieval historiography:** heavily influenced by religion (church
  chronicles)
- **Modern historiography:** emphasis on evidence, critical analysis of
  sources, objectivity, and use of scientific methods

### Why historiography matters
It helps us understand not just *what* happened, but *how we know* what
happened — evaluating the reliability and bias of historical sources.

### Worked example
Why is Herodotus called the "Father of History"?
He was among the first to systematically collect, verify, and organise
information about past events (rather than relying purely on myth),
laying groundwork for historical method.`,
      videoUrl: "",
    },
  });

  const h_quiz1 = await prisma.quiz.upsert({
    where: { topicId: h_topic1.id },
    update: {},
    create: { topicId: h_topic1.id },
  });

  if ((await prisma.question.count({ where: { quizId: h_quiz1.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: h_quiz1.id,
          text: "Who is often called the 'Father of History' in Western tradition?",
          options: ["Thucydides", "Herodotus", "Plato", "Aristotle"],
          answer: 1,
          explanation: "Herodotus systematically documented the Greco-Persian Wars, pioneering historical writing.",
          order: 1,
        },
        {
          quizId: h_quiz1.id,
          text: "Historiography is best defined as the study of:",
          options: [
            "Ancient artifacts only",
            "How history is written and interpreted",
            "Geography of historical events",
            "Political systems only",
          ],
          answer: 1,
          explanation: "Historiography examines methods, sources, and approaches used to write history.",
          order: 2,
        },
        {
          quizId: h_quiz1.id,
          text: "Modern historiography places strong emphasis on:",
          options: ["Myths and legends", "Religious chronicles only", "Evidence and critical analysis of sources", "Oral tradition alone"],
          answer: 2,
          explanation: "Modern historians prioritise verifiable evidence and objective analysis.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 2: 1857 - The Revolt and its Legacy ----
  const h_chapter2 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "1857-the-revolt-and-its-legacy" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "1857 - The Revolt and its Legacy", slug: "1857-the-revolt-and-its-legacy", order: 2 },
  });

  const h_topic2 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: h_chapter2.id, slug: "causes-and-impact-of-1857-revolt" } },
    update: {},
    create: {
      chapterId: h_chapter2.id,
      title: "Causes and Impact of the 1857 Revolt",
      slug: "causes-and-impact-of-1857-revolt",
      order: 1,
      notesMd: `## The Revolt of 1857

Often called India's "First War of Independence," this was a major uprising
against British East India Company rule.

### Causes
- **Political:** Doctrine of Lapse (annexing states without a natural heir),
  annexation of Awadh
- **Economic:** heavy taxation, destruction of traditional industries,
  exploitation of peasants
- **Social/Religious:** interference in Indian customs, fear of forced
  conversion
- **Military (immediate trigger):** greased cartridges (rumoured to be
  coated with cow/pig fat) offended both Hindu and Muslim sepoys

### Key events
- Began at **Meerut** (May 1857) among sepoys, spread to Delhi, Kanpur,
  Lucknow, Jhansi
- Key leaders: **Rani Lakshmibai** (Jhansi), **Nana Saheb** (Kanpur),
  **Bahadur Shah Zafar** (nominal leader, Delhi), **Tantia Tope**

### Impact
- The revolt was suppressed, but it ended East India Company rule
- The **Government of India Act, 1858** transferred power directly to the
  British Crown
- It sowed early seeds of Indian nationalism

### Worked example
Why is 1857 significant even though the revolt failed?
Despite defeat, it was the first large-scale, coordinated resistance
against British rule across regions and communities — inspiring later
nationalist movements and forcing a fundamental change in how India was
governed.`,
      videoUrl: "",
    },
  });

  const h_quiz2 = await prisma.quiz.upsert({
    where: { topicId: h_topic2.id },
    update: {},
    create: { topicId: h_topic2.id },
  });

  if ((await prisma.question.count({ where: { quizId: h_quiz2.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: h_quiz2.id,
          text: "The 1857 revolt began at:",
          options: ["Delhi", "Meerut", "Kanpur", "Jhansi"],
          answer: 1,
          explanation: "The uprising started among sepoys at Meerut in May 1857.",
          order: 1,
        },
        {
          quizId: h_quiz2.id,
          text: "As a result of the 1857 revolt, governance of India was transferred to:",
          options: ["The Mughal Empire", "The British Crown", "The East India Company (continued)", "The United Nations"],
          answer: 1,
          explanation: "The Government of India Act, 1858 ended Company rule and transferred power to the Crown.",
          order: 2,
        },
        {
          quizId: h_quiz2.id,
          text: "Rani Lakshmibai was a key leader of the revolt at:",
          options: ["Delhi", "Kanpur", "Jhansi", "Lucknow"],
          answer: 2,
          explanation: "Rani Lakshmibai led resistance at Jhansi against British forces.",
          order: 3,
        },
      ],
    });
  }

  // ---- Chapter 3: Sources of History ----
  const h_chapter3 = await prisma.chapter.upsert({
    where: { subjectId_slug: { subjectId: historyPolity.id, slug: "sources-of-history" } },
    update: {},
    create: { subjectId: historyPolity.id, title: "Sources of History", slug: "sources-of-history", order: 4 },
  });

  const h_topic3 = await prisma.topic.upsert({
    where: { chapterId_slug: { chapterId: h_chapter3.id, slug: "primary-and-secondary-sources" } },
    update: {},
    create: {
      chapterId: h_chapter3.id,
      title: "Primary and Secondary Sources of History",
      slug: "primary-and-secondary-sources",
      order: 1,
      notesMd: `## Sources of History

Historians reconstruct the past using **sources** — evidence left behind
from an earlier time.

### Primary sources
Original, first-hand evidence created during the time period being studied:
- Inscriptions, coins, monuments, manuscripts
- Official records, letters, diaries of the period
- Archaeological remains

### Secondary sources
Materials created *later*, based on primary sources — interpretations,
analyses, or accounts written after the fact:
- History textbooks, research articles, documentaries

### Types of historical sources
1. **Literary sources:** manuscripts, religious texts, biographies,
   travelogues (e.g. accounts of foreign travellers)
2. **Archaeological sources:** excavated remains, monuments, inscriptions,
   coins
3. **Oral sources:** folklore, oral traditions passed down generations

### Why source evaluation matters
Historians must check a source's **authenticity** (is it genuine?) and
**reliability** (is it accurate/unbiased?) before drawing conclusions.

### Worked example
Why are coins considered valuable primary sources?
Coins often carry the ruler's name, dates, symbols, and sometimes
religious/artistic details — giving reliable, contemporary evidence about
a period's political and economic history.`,
      videoUrl: "",
    },
  });

  const h_quiz3 = await prisma.quiz.upsert({
    where: { topicId: h_topic3.id },
    update: {},
    create: { topicId: h_topic3.id },
  });

  if ((await prisma.question.count({ where: { quizId: h_quiz3.id } })) === 0) {
    await prisma.question.createMany({
      data: [
        {
          quizId: h_quiz3.id,
          text: "A primary source is best described as:",
          options: [
            "A source written long after the event",
            "First-hand evidence from the actual time period",
            "A textbook summary",
            "A documentary film",
          ],
          answer: 1,
          explanation: "Primary sources are original evidence created during the period being studied.",
          order: 1,
        },
        {
          quizId: h_quiz3.id,
          text: "Coins are considered valuable historical sources because they can reveal:",
          options: ["Only their metal content", "Ruler's name, dates, and symbols", "Nothing useful", "Only weight information"],
          answer: 1,
          explanation: "Coins often carry inscriptions and symbols that reveal political and economic history.",
          order: 2,
        },
        {
          quizId: h_quiz3.id,
          text: "Before using a source, historians must check its:",
          options: ["Colour and size", "Authenticity and reliability", "Popularity", "Length"],
          answer: 1,
          explanation: "Verifying genuineness and accuracy is essential before drawing historical conclusions.",
          order: 3,
        },
      ],
    });
  }

  console.log("Seed complete: SSC Mathematics Parts 1&2, Science Parts 1&2 FULLY seeded. All other subjects have full syllabus checklists.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
