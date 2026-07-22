import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to save your quiz score." }, { status: 401 });
  }

  const { quizId, score, total } = await req.json();
  if (!quizId || typeof score !== "number" || typeof total !== "number") {
    return NextResponse.json({ error: "quizId, score and total are required." }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const attempt = await prisma.quizAttempt.create({
    data: { userId, quizId, score, total },
  });

  return NextResponse.json(attempt);
}
