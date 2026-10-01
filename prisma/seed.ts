// REPLACEMENT for the "SSC History & Political Science" section in your
// prisma/seed.ts. Delete your existing h1/h2/h3 + ht1/ht2/ht3 + hq1/hq2/hq3
// block and paste this in its place. "1857 - The Revolt and its Legacy" and
// "Sources of History" are NOT in the actual current Balbharati syllabus —
// they were from an older/wrong source — replaced with "Working of the
// Constitution" and "Political Parties", which ARE real chapters (10 and 12
// of 14). "Historiography: Development in the West" was already correct
// and is kept as-is.

// ==================== SSC History & Political Science ====================
const historyPolity = await prisma.subject.findUniqueOrThrow({ where: { boardId_slug: { boardId: ssc.id, slug: "history-polity" } } });

const h1 = await prisma.chapter.upsert({ where: { subjectId_slug: { subjectId: historyPolity.id, slug: "historiography-development-in-the-west" } }, update: {}, create: { subjectId: historyPolity.id, title: "Historiography: Development in the West", slug: "historiography-development-in-the-west", order: 1 } });
const ht1 = await prisma.topic.upsert({ where: { chapterId_slug: { chapterId: h1.id, slug: "meaning-and-evolution-of-historiography" } }, update: {}, create: { chapterId: h1.id, title: "Meaning and Evolution of Historiography", slug: "meaning-and-evolution-of-historiography", order: 1, videoUrl: "",
  notesMd: `## Historiography

Historiography is the study of how history is written.

Herodotus (Father of History) wrote about the Greco-Persian Wars. Thucydides focused on cause-and-effect and eyewitness accuracy.

Modern historiography emphasises evidence, critical analysis, and objectivity over myth.

### Worked example
Herodotus is the "Father of History" because he systematically collected and organised information rather than relying on myth.` } });
const hq1 = await prisma.quiz.upsert({ where: { topicId: ht1.id }, update: {}, create: { topicId: ht1.id } });
if ((await prisma.question.count({ where: { quizId: hq1.id } })) === 0) {
  await prisma.question.createMany({ data: [
    { quizId: hq1.id, text: "Who is often called the 'Father of History' in Western tradition?", options: ["Thucydides", "Herodotus", "Plato", "Aristotle"], answer: 1, explanation: "Herodotus documented the Greco-Persian Wars.", order: 1 },
    { quizId: hq1.id, text: "Historiography is best defined as the study of:", options: ["Ancient artifacts only", "How history is written and interpreted", "Geography of historical events", "Political systems only"], answer: 1, explanation: "Historiography examines methods and interpretation.", order: 2 },
    { quizId: hq1.id, text: "Modern historiography places strong emphasis on:", options: ["Myths and legends", "Religious chronicles only", "Evidence and critical analysis of sources", "Oral tradition alone"], answer: 2, explanation: "Modern historians prioritise verifiable evidence.", order: 3 },
  ]});
}

const h2 = await prisma.chapter.upsert({ where: { subjectId_slug: { subjectId: historyPolity.id, slug: "working-of-the-constitution" } }, update: {}, create: { subjectId: historyPolity.id, title: "Working of the Constitution", slug: "working-of-the-constitution", order: 10 } });
const ht2 = await prisma.topic.upsert({ where: { chapterId_slug: { chapterId: h2.id, slug: "features-of-the-indian-constitution" } }, update: {}, create: { chapterId: h2.id, title: "Key Features of the Indian Constitution", slug: "features-of-the-indian-constitution", order: 1, videoUrl: "",
  notesMd: `## Working of the Constitution

The Constitution of India is the supreme law of the land, adopted on 26 November 1949 and came into effect on 26 January 1950.

### Key features
- **Fundamental Rights**: guaranteed to all citizens (equality, freedom, against exploitation, religion, culture/education, constitutional remedies)
- **Directive Principles of State Policy**: guidelines for the state to ensure social and economic welfare (not legally enforceable, but fundamental to governance)
- **Fundamental Duties**: moral obligations of citizens, added via the 42nd Amendment (1976)
- **Federal structure with unitary features**: power divided between Centre and States, but the Centre is stronger in certain situations (emergency provisions)

### Worked example
Why are Directive Principles not legally enforceable but still important?
They act as guiding principles for governance — courts can't force their implementation, but governments are expected to work towards them when making policy and laws.` } });
const hq2 = await prisma.quiz.upsert({ where: { topicId: ht2.id }, update: {}, create: { topicId: ht2.id } });
if ((await prisma.question.count({ where: { quizId: hq2.id } })) === 0) {
  await prisma.question.createMany({ data: [
    { quizId: hq2.id, text: "The Indian Constitution came into effect on:", options: ["15 August 1947", "26 November 1949", "26 January 1950", "2 October 1950"], answer: 2, explanation: "Adopted 26 Nov 1949, came into effect 26 Jan 1950 (celebrated as Republic Day).", order: 1 },
    { quizId: hq2.id, text: "Directive Principles of State Policy are:", options: ["Legally enforceable in court", "Guidelines for governance, not legally enforceable", "Only applicable during emergencies", "Part of Fundamental Rights"], answer: 1, explanation: "They guide policy but cannot be enforced by courts directly.", order: 2 },
    { quizId: hq2.id, text: "Fundamental Duties were added to the Constitution through the:", options: ["1st Amendment", "42nd Amendment", "44th Amendment", "73rd Amendment"], answer: 1, explanation: "The 42nd Amendment (1976) added Fundamental Duties.", order: 3 },
  ]});
}

const h3 = await prisma.chapter.upsert({ where: { subjectId_slug: { subjectId: historyPolity.id, slug: "political-parties" } }, update: {}, create: { subjectId: historyPolity.id, title: "Political Parties", slug: "political-parties", order: 12 } });
const ht3 = await prisma.topic.upsert({ where: { chapterId_slug: { chapterId: h3.id, slug: "role-and-types-of-political-parties" } }, update: {}, create: { chapterId: h3.id, title: "Role and Types of Political Parties", slug: "role-and-types-of-political-parties", order: 1, videoUrl: "",
  notesMd: `## Political Parties

A **political party** is a group of people who come together to contest elections and hold power in government, united by a common ideology or set of policies.

### Functions of political parties
- Contest elections and form government
- Shape and express public opinion
- Provide a link between people and government
- Act as the opposition, holding the ruling party accountable

### Party systems
- **One-party system**: only one party allowed to hold power
- **Two-party system**: two major parties dominate (e.g. USA)
- **Multi-party system**: several parties compete, often leading to coalitions (e.g. India)

### Worked example
Why does India have a multi-party system rather than a two-party system?
India's vast social, regional, linguistic and economic diversity means different groups form parties representing their specific interests, rather than everyone fitting into just two broad camps.` } });
const hq3 = await prisma.quiz.upsert({ where: { topicId: ht3.id }, update: {}, create: { topicId: ht3.id } });
if ((await prisma.question.count({ where: { quizId: hq3.id } })) === 0) {
  await prisma.question.createMany({ data: [
    { quizId: hq3.id, text: "A political party is primarily formed to:", options: ["Run a business", "Contest elections and hold government power", "Organise sports events", "Manage schools"], answer: 1, explanation: "Parties exist to contest elections and govern based on shared ideology.", order: 1 },
    { quizId: hq3.id, text: "India follows which kind of party system?", options: ["One-party system", "Two-party system", "Multi-party system", "No party system"], answer: 2, explanation: "India has many parties, often leading to coalition governments.", order: 2 },
    { quizId: hq3.id, text: "One key function of a political party in opposition is to:", options: ["Avoid all criticism of government", "Hold the ruling party accountable", "Dissolve the government immediately", "Control the judiciary"], answer: 1, explanation: "The opposition's role includes scrutinising and checking the ruling party.", order: 3 },
  ]});
}

console.log("History & Political Science corrected: 3/14 chapters now match the real syllabus.");
