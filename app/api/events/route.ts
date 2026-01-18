import { NextResponse } from "next/server";
import { auth0 } from "@/lib/auth0";
import { prisma } from "@/lib/prisma";

function jsonError(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

function iso(d: Date) {
  return d.toISOString();
}

export async function GET(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return jsonError("Unauthorized", 401);
  const userId = session.user.sub;

  const { searchParams } = new URL(req.url);
  const month = searchParams.get("month");
  const year = searchParams.get("year");

  if (!month || !year) return jsonError("Provide month & year");

  const m = Number(month);
  const y = Number(year);
  if (!m || !y || m < 1 || m > 12) return jsonError("Invalid month/year");

  const startAt = new Date(y, m - 1, 1, 0, 0, 0, 0);
  const endAt = new Date(y, m, 0, 23, 59, 59, 999);

  const events = await prisma.event.findMany({
    where: {
      userId,
      startAt: { gte: startAt, lte: endAt },
    },
    orderBy: { startAt: "asc" },
  });

  return NextResponse.json({
    events: events.map((e) => ({
      id: e.id,
      title: e.title,
      startAt: iso(e.startAt),
      endAt: e.endAt ? iso(e.endAt) : null,
      allDay: e.allDay,
      notes: e.notes,
      source: e.source,
    })),
  });
}

export async function POST(req: Request) {
  const session = await auth0.getSession();
  if (!session?.user?.sub) return jsonError("Unauthorized", 401);
  const userId = session.user.sub;

  const body = await req.json().catch(() => null);
  if (!body) return jsonError("Invalid JSON");

  const title = String(body.title ?? "").trim();
  const startAtRaw = body.startAt;
  const endAtRaw = body.endAt ?? null;
  const allDay = Boolean(body.allDay ?? false);
  const notes = body.notes == null ? null : String(body.notes);
  const source = String(body.source ?? "manual");

  if (!title) return jsonError("Missing title");

  const startAt = new Date(startAtRaw);
  if (Number.isNaN(startAt.getTime())) return jsonError("Invalid startAt");

  let endAt: Date | null = null;
  if (endAtRaw) {
    const e = new Date(endAtRaw);
    if (Number.isNaN(e.getTime())) return jsonError("Invalid endAt");
    endAt = e;
  }

  const created = await prisma.event.create({
    data: { userId, title, startAt, endAt, allDay, notes, source },
  });

  return NextResponse.json({
    event: {
      id: created.id,
      title: created.title,
      startAt: iso(created.startAt),
      endAt: created.endAt ? iso(created.endAt) : null,
      allDay: created.allDay,
      notes: created.notes,
      source: created.source,
    },
  });
}