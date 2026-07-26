import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { auth } from "@/auth";
import { listCasesForUser, upsertCaseForUser } from "@/lib/db";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const cases = await listCasesForUser(session.user.id);
  return NextResponse.json({ cases });
}

export async function POST(req) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const caseObj = await req.json();
  const id = caseObj.id || randomUUID();
  const toSave = { ...caseObj, id };
  await upsertCaseForUser(session.user.id, id, toSave);
  return NextResponse.json({ case: toSave });
}
