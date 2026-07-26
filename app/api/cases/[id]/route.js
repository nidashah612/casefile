import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { getCaseForUser, upsertCaseForUser, deleteCaseForUser } from "@/lib/db";

export async function GET(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const c = await getCaseForUser(session.user.id, id);
  if (!c) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ case: c });
}

export async function PUT(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  const data = await req.json();
  await upsertCaseForUser(session.user.id, id, { ...data, id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(req, { params }) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;
  await deleteCaseForUser(session.user.id, id);
  return NextResponse.json({ ok: true });
}
