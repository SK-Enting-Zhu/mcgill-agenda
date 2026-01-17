"use client";

import { useEffect, useMemo, useState } from "react";

type CalendarMonthProps = {
  compact?: boolean;
};

type EventItem = {
  id: string;
  title: string;
  startAt: string; // ISO string
  endAt: string | null;
  allDay: boolean;
  notes: string | null;
};

function ymd(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addDays(d: Date, n: number) {
  const x = new Date(d);
  x.setDate(x.getDate() + n);
  return x;
}

export default function CalendarMonth({ compact = false }: CalendarMonthProps) {
  const [cursor, setCursor] = useState(() => new Date());
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);

  const monthStart = useMemo(() => startOfMonth(cursor), [cursor]);
  const monthEnd = useMemo(() => endOfMonth(cursor), [cursor]);

  const rangeStart = useMemo(() => {
    // start from Sunday of the week containing monthStart
    const d = new Date(monthStart);
    const dow = d.getDay(); // 0..6
    return addDays(d, -dow);
  }, [monthStart]);

  const rangeEnd = useMemo(() => {
    // end at Saturday of the week containing monthEnd
    const d = new Date(monthEnd);
    const dow = d.getDay(); // 0..6
    return addDays(d, 6 - dow);
  }, [monthEnd]);

  const days = useMemo(() => {
    const out: Date[] = [];
    for (let d = new Date(rangeStart); d <= rangeEnd; d = addDays(d, 1)) {
      out.push(new Date(d));
    }
    return out;
  }, [rangeStart, rangeEnd]);

  async function load() {
    setLoading(true);
    try {
      const qs = new URLSearchParams({
        start: rangeStart.toISOString(),
        end: rangeEnd.toISOString(),
      });
      const res = await fetch(`/api/events?${qs.toString()}`, { cache: "no-store" });
      if (!res.ok) throw new Error(`Failed to load events: ${res.status}`);
      const data = (await res.json()) as { events: EventItem[] };
      setEvents(data.events);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const e of events) {
      const dayKey = ymd(new Date(e.startAt));
      const arr = map.get(dayKey) ?? [];
      arr.push(e);
      map.set(dayKey, arr);
    }
    return map;
  }, [events]);

  async function createEventForDay(day: Date) {
    const title = window.prompt("Event title?");
    if (!title) return;

    const startAt = new Date(day);
    startAt.setHours(9, 0, 0, 0);

    const payload = {
      title,
      startAt: startAt.toISOString(),
      endAt: null,
      allDay: true,
      notes: null,
    };

    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      alert("Failed to create event.");
      return;
    }
    await load();
  }

  async function deleteEvent(id: string) {
    const ok = window.confirm("Delete this event?");
    if (!ok) return;

    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    if (!res.ok) {
      alert("Failed to delete event.");
      return;
    }
    await load();
  }

  const title = cursor.toLocaleString(undefined, { month: "long", year: "numeric" });

  return (
    <div style={styles.wrap}>
      <div style={styles.topRow}>
        <div style={styles.monthTitle}>{title}</div>
        <div style={styles.nav}>
          <button style={styles.btn} onClick={() => setCursor(new Date())}>
            Today
          </button>
          <button
            style={styles.btn}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
          >
            ◀
          </button>
          <button
            style={styles.btn}
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
          >
            ▶
          </button>
        </div>
      </div>

      <div style={styles.grid}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((w) => (
          <div key={w} style={{ ...styles.cell, ...styles.weekday }}>
            {w}
          </div>
        ))}

        {days.map((d) => {
          const inMonth = d.getMonth() === cursor.getMonth();
          const key = ymd(d);
          const dayEvents = eventsByDay.get(key) ?? [];

          return (
            <div
              key={key}
              style={{
                ...styles.cell,
                ...(inMonth ? null : styles.outsideMonth),
                ...(compact ? styles.compactCell : null),
              }}
              onClick={() => createEventForDay(d)}
              role="button"
              tabIndex={0}
              title="Click to add event"
            >
              <div style={styles.dayNum}>{d.getDate()}</div>

              {!compact && dayEvents.length > 0 && (
                <div style={styles.events}>
                  {dayEvents.slice(0, 3).map((e) => (
                    <div
                      key={e.id}
                      style={styles.eventPill}
                      onClick={(ev) => {
                        ev.stopPropagation();
                        deleteEvent(e.id);
                      }}
                      title="Click to delete"
                    >
                      {e.title}
                    </div>
                  ))}
                  {dayEvents.length > 3 && (
                    <div style={styles.more}>+{dayEvents.length - 3} more</div>
                  )}
                </div>
              )}

              {compact && dayEvents.length > 0 && <div style={styles.dotRow}>
                <span style={styles.dot} />
              </div>}
            </div>
          );
        })}
      </div>

      {loading && <div style={styles.loading}>Loading…</div>}
      <div style={styles.hint}>
        Click a day to add an event. Click an event pill to delete it.
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: { width: "100%" },
  topRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  monthTitle: { fontSize: 16, fontWeight: 900, color: "#0f172a" },
  nav: { display: "flex", gap: 8 },
  btn: {
    padding: "8px 10px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "white",
    cursor: "pointer",
    fontWeight: 800,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, minmax(0, 1fr))",
    gap: 8,
  },
  cell: {
    background: "white",
    border: "1px solid rgba(15,23,42,0.06)",
    borderRadius: 12,
    padding: 10,
    minHeight: 92,
    cursor: "pointer",
    position: "relative",
    overflow: "hidden",
  },
  compactCell: {
    minHeight: 54,
    padding: 8,
  },
  weekday: {
    minHeight: 34,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontWeight: 900,
    color: "rgba(15,23,42,0.6)",
    cursor: "default",
    background: "transparent",
    border: "none",
  },
  outsideMonth: { opacity: 0.45 },
  dayNum: { fontWeight: 900, color: "#0f172a" },
  events: { marginTop: 6, display: "grid", gap: 6 },
  eventPill: {
    fontSize: 12,
    fontWeight: 800,
    padding: "6px 8px",
    borderRadius: 10,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(99, 102, 241, 0.10)",
    color: "#0f172a",
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
  },
  more: { fontSize: 12, fontWeight: 800, color: "rgba(15,23,42,0.6)" },
  dotRow: { position: "absolute", left: 10, bottom: 10 },
  dot: {
    display: "inline-block",
    width: 8,
    height: 8,
    borderRadius: 999,
    background: "rgba(99, 102, 241, 0.7)",
  },
  loading: { marginTop: 10, fontWeight: 800, color: "rgba(15,23,42,0.6)" },
  hint: { marginTop: 10, fontSize: 12, fontWeight: 700, color: "rgba(15,23,42,0.55)" },
};