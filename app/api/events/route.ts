import { PrismaClient } from "@prisma/client";
import { NextResponse } from "next/server";

// Prisma singleton (prevents too many connections during hot reload in dev)
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };
const prisma = globalForPrisma.prisma ?? new PrismaClient();
if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

function badRequest(message: string, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const start = searchParams.get("start");
    const end = searchParams.get("end");

    if (!start || !end) return badRequest("Missing start/end query params", 400);

    const startDt = new Date(start);
    const endDt = new Date(end);
    if (Number.isNaN(startDt.getTime()) || Number.isNaN(endDt.getTime())) {
      return badRequest("Invalid start/end date", 400);
    }

    const events = await prisma.event.findMany({
      where: {
        startAt: { gte: startDt, lte: endDt },
      },
      orderBy: { startAt: "asc" },
    });

    return NextResponse.json({ events }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to load events" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as {
      title?: string;
      startAt?: string;
      endAt?: string | null;
      allDay?: boolean;
      notes?: string | null;
      source?: string;
      sourceId?: string | null;
    };

    if (!body.title || !body.startAt) return badRequest("Missing title/startAt", 400);

    const startDt = new Date(body.startAt);
    if (Number.isNaN(startDt.getTime())) return badRequest("Invalid startAt", 400);

    const endDt = body.endAt ? new Date(body.endAt) : null;
    if (endDt && Number.isNaN(endDt.getTime())) return badRequest("Invalid endAt", 400);

    const created = await prisma.event.create({
      data: {
        title: body.title,
        startAt: startDt,
        endAt: endDt,
        allDay: body.allDay ?? true,
        notes: body.notes ?? null,
        source: body.source ?? "manual",
        sourceId: body.sourceId ?? null,
      },
    });

    return NextResponse.json({ event: created }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create event" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");
    if (!id) return badRequest("Missing id", 400);

    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true }, { status: 200 });
  } catch {
    return NextResponse.json({ error: "Failed to delete event" }, { status: 500 });
  }
}