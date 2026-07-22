import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Sign in to track progress." }, { status: 401 });
  }

  const { topicId, completed } = await req.json();
  if (!topicId || typeof completed !== "boolean") {
    return NextResponse.json({ error: "topicId and completed are required." }, { status: 400 });
  }

  const userId = (session.user as any).id as string;

  const progress = await prisma.progress.upsert({
    where: { userId_topicId: { userId, topicId } },
    update: { completed },
    create: { userId, topicId, completed },
  });

  return NextResponse.json(progress);
}
