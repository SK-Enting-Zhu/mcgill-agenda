"use client";


import React, { useEffect, useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  startAt: string; // ISO
  endAt?: string | null;
  allDay?: boolean;
  notes?: string | null;
};

type Props = {
  compact?: boolean;
};

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

function ymd(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}

function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0);
}

function addMonths(d: Date, delta: number) {
  return new Date(d.getFullYear(), d.getMonth() + delta, 1);
}

function sameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function monthLabel(d: Date) {
  return d.toLocaleString(undefined, { month: "long", year: "numeric" });
}

function safeStr(v: unknown) {
  return typeof v === "string" ? v : "";
}

function parseNotesMeta(rawNotes: string | null | undefined) {
  // Notes format we generate:
  // <user notes>
  //
  // —
  // Course: X
  // Type: Y
  // Semester: Z
  // Weight: W
  const notes = rawNotes ?? "";
  const lines = notes.split("\n");

  const get = (prefix: string) => {
    const line = lines.find((l) =>
      l.trim().toLowerCase().startsWith(prefix.toLowerCase())
    );
    if (!line) return "";
    const idx = line.indexOf(":");
    if (idx === -1) return "";
    const val = line.slice(idx + 1).trim();
    return val === "-" ? "" : val;
  };

  // user notes is everything before a line that is exactly "—"
  const sepIndex = lines.findIndex((l) => l.trim() === "—");
  const userNotes =
    sepIndex === -1 ? notes : lines.slice(0, sepIndex).join("\n").trim();

  return {
    userNotes,
    course: get("Course"),
    type: get("Type"),
    semester: get("Semester"),
    weight: get("Weight"),
  };
}

function buildEnrichedNotes(
  userNotes: string,
  meta: { course: string; type: string; semester: string; weight: string }
) {
  const blocks: string[] = [];
  const u = userNotes.trim();
  if (u) blocks.push(u);
  blocks.push("—");
  blocks.push(`Course: ${meta.course || "-"}`);
  blocks.push(`Type: ${meta.type || "-"}`);
  blocks.push(`Semester: ${meta.semester || "-"}`);
  blocks.push(`Weight: ${meta.weight || "-"}`);
  return blocks.join("\n");
}

export default function CalendarMonth({ compact = false }: Props) {
  const [viewDate, setViewDate] = useState<Date>(() => startOfMonth(new Date()));
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // modal state
  const [open, setOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  // editing state
  const [editingId, setEditingId] = useState<string | null>(null);

  const [title, setTitle] = useState("");
  const [course, setCourse] = useState("");
  const [etype, setEtype] = useState("Assignment");
  const [semester, setSemester] = useState("");
  const [weight, setWeight] = useState("");
  const [noTime, setNoTime] = useState(true);
  const [notes, setNotes] = useState("");

  const days = useMemo(() => {
    // Build a 6-week grid (Sun..Sat), starting from the Sunday before the 1st
    const first = startOfMonth(viewDate);
    const start = new Date(first);
    start.setDate(first.getDate() - first.getDay()); // go back to Sunday

    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      out.push(d);
    }
    return out;
  }, [viewDate]);

  const eventsByDay = useMemo(() => {
    const map = new Map<string, EventItem[]>();
    for (const ev of events) {
      // IMPORTANT: interpret in local time for matching day boxes
      const dt = new Date(ev.startAt);
      const key = ymd(dt);
      const arr = map.get(key) ?? [];
      arr.push(ev);
      map.set(key, arr);
    }
    // sort events within day
    for (const [k, arr] of map.entries()) {
      arr.sort(
        (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
      );
      map.set(k, arr);
    }
    return map;
  }, [events]);

  async function load() {
    setLoading(true);
    setError(null);
    try {
      const m = viewDate.getMonth() + 1; // API expects 1..12
      const y = viewDate.getFullYear();

      const res = await fetch(`/api/events?month=${m}&year=${y}`, {
        cache: "no-store",
      });
      const json = await res.json().catch(() => ({}));

      if (!res.ok) {
        setEvents([]);
        setError(
          json?.error
            ? String(json.error)
            : `Failed to load events: ${res.status}`
        );
        return;
      }

      setEvents((json?.events ?? []) as EventItem[]);
    } catch (e: any) {
      setEvents([]);
      setError(e?.message ?? "Failed to load events");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewDate]);

  function resetForm() {
    setTitle("");
    setCourse("");
    setEtype("Assignment");
    setSemester("");
    setWeight("");
    setNoTime(true);
    setNotes("");
  }

  function openNewEvent(d: Date) {
    setEditingId(null);
    setSelectedDate(d);
    resetForm();
    setOpen(true);
  }

  function openEditEvent(ev: EventItem) {
    const dt = new Date(ev.startAt);
    const meta = parseNotesMeta(ev.notes);

    setEditingId(ev.id);
    setSelectedDate(new Date(dt.getFullYear(), dt.getMonth(), dt.getDate()));

    setTitle(safeStr(ev.title) || "");
    setCourse(meta.course);
    setEtype(meta.type || "Assignment");
    setSemester(meta.semester);
    setWeight(meta.weight);

    // If event is allDay, keep noTime. Otherwise treat as having time.
    setNoTime(Boolean(ev.allDay));

    // Only show the user-notes portion in the notes field.
    setNotes(meta.userNotes);

    setOpen(true);
  }

  function closeModal() {
    setOpen(false);
  }

  async function apiCreate(payload: any) {
    const res = await fetch("/api/events", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        json?.error ? String(json.error) : `Create failed: ${res.status}`
      );
    }
    return json;
  }

  async function apiDelete(id: string) {
    const res = await fetch(`/api/events?id=${encodeURIComponent(id)}`, {
      method: "DELETE",
    });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(
        json?.error ? String(json.error) : `Delete failed: ${res.status}`
      );
    }
    return json;
  }

  async function saveEvent() {
    if (!selectedDate) return;

    const enrichedNotes = buildEnrichedNotes(notes, {
      course,
      type: etype,
      semester,
      weight,
    });

    const startAtISO = new Date(
      selectedDate.getFullYear(),
      selectedDate.getMonth(),
      selectedDate.getDate(),
      noTime ? 0 : 9,
      0,
      0,
      0
    ).toISOString();

    const payload = {
      title: title.trim() || "Untitled",
      startAt: startAtISO,
      allDay: !!noTime,
      notes: enrichedNotes || null,
      source: "manual",
    };

    try {
      // Edit = delete + create (works with your current API if you don't have PUT yet)
      if (editingId) {
        await apiDelete(editingId);
      }

      await apiCreate(payload);

      await load();
      setOpen(false);
      setEditingId(null);
    } catch (e: any) {
      alert(e?.message ?? "Save failed");
    }
  }

  async function deleteFromModal() {
    if (!editingId) return;
    const ok = window.confirm("Delete this event?");
    if (!ok) return;
    try {
      await apiDelete(editingId);
      await load();
      setOpen(false);
      setEditingId(null);
    } catch (e: any) {
      alert(e?.message ?? "Delete failed");
    }
  }

  const today = new Date();
  const monthStart = startOfMonth(viewDate);
  const monthEnd = endOfMonth(viewDate);

  return (
    <>
      <div style={styles.wrap}>
        <div style={styles.headerRow}>
          <div style={styles.titleBlock}>
            {compact ? (
              <div style={styles.monthTitle}>{monthLabel(viewDate)}</div>
            ) : (
              <>
                <div style={styles.h1}>Full Calendar</div>
                <div style={styles.sub}>
                  Add / edit / delete events here. Changes also appear on the
                  mini calendar on the Agenda page.
                </div>
                <div style={styles.monthLabel}>{monthLabel(viewDate)}</div>
              </>
            )}
          </div>

          <div style={styles.headerActions}>
            <button
              type="button"
              style={styles.btn}
              onClick={() => setViewDate(startOfMonth(new Date()))}
            >
              Today
            </button>
            <button
              type="button"
              style={styles.iconBtn}
              onClick={() => setViewDate(addMonths(viewDate, -1))}
            >
              ◀
            </button>
            <button
              type="button"
              style={styles.iconBtn}
              onClick={() => setViewDate(addMonths(viewDate, 1))}
            >
              ▶
            </button>
          </div>
        </div>

        {loading && <div style={styles.info}>Loading events…</div>}
        {error && <div style={styles.error}>Error: {error}</div>}

        <div style={styles.dowRow}>
          {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
            <div key={d} style={styles.dow}>
              {d}
            </div>
          ))}
        </div>

        <div style={styles.grid}>
          {days.map((d) => {
            const inMonth = d >= monthStart && d <= monthEnd;
            const isToday = sameDay(d, today);
            const key = ymd(d);
            const dayEvents = eventsByDay.get(key) ?? [];

            return (
              <div
                key={key}
                role="button"
                tabIndex={0}
                onClick={() => openNewEvent(d)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    openNewEvent(d);
                  }
                }}
                style={{
                  ...styles.cell,
                  ...(inMonth ? {} : styles.cellOutsideMonth),
                  ...(isToday ? styles.cellToday : {}),
                }}
                className="calCell"
              >
                <div style={styles.cellTopRow}>
                  <span
                    style={{
                      ...styles.dayNum,
                      ...(inMonth ? {} : styles.dayNumMuted),
                    }}
                  >
                    {d.getDate()}
                  </span>
                </div>

                <div style={styles.pills}>
                  {dayEvents.slice(0, compact ? 1 : 3).map((ev) => (
                    <button
                      key={ev.id}
                      type="button"
                      style={styles.pill}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        openEditEvent(ev);
                      }}
                      title="Click to edit"
                      className="calPill"
                    >
                      {ev.title}
                    </button>
                  ))}
                  {dayEvents.length > (compact ? 1 : 3) && (
                    <div style={styles.more}>
                      +{dayEvents.length - (compact ? 1 : 3)} more
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {!compact && (
          <div style={styles.footerHint}>
            Click a day to create an event. Click an event pill to edit it.
          </div>
        )}
      </div>

      {open && selectedDate && (
        <div
          style={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setOpen(false);
          }}
        >
          <div style={styles.modal} role="dialog" aria-modal="true">
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {editingId ? "Edit event" : "New event"}
              </div>
              <button
                type="button"
                style={styles.closeX}
                onClick={closeModal}
                aria-label="Close"
              >
                ✕
              </button>
            </div>

            <div style={styles.modalBody}>
              <div style={styles.rowTop}>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Untitled"
                  style={styles.titleInput}
                />

                <div style={styles.dateChip}>
                  <span style={styles.dateChipLabel}>Date</span>
                  <input
                    type="date"
                    value={ymd(selectedDate)}
                    onChange={(e) => {
                      const [yy, mm, dd] = e.target.value
                        .split("-")
                        .map(Number);
                      if (!yy || !mm || !dd) return;
                      setSelectedDate(new Date(yy, mm - 1, dd));
                    }}
                    style={styles.dateInput}
                  />
                </div>
              </div>

              <div style={styles.grid2}>
                <LabeledInput
                  label="Course"
                  value={course}
                  onChange={setCourse}
                  placeholder="e.g., COMP 206"
                />
                <LabeledInput
                  label="Type"
                  value={etype}
                  onChange={setEtype}
                  placeholder="Assignment / Exam / Reading"
                />
                <LabeledInput
                  label="Semester"
                  value={semester}
                  onChange={setSemester}
                  placeholder="e.g., Winter 2026"
                />
                <LabeledInput
                  label="Weight"
                  value={weight}
                  onChange={setWeight}
                  placeholder="e.g., 10%"
                />
              </div>

              <div style={styles.toggleRow}>
                <div style={styles.toggleLabel}>All-day</div>
                <label style={styles.togglePill}>
                  <input
                    type="checkbox"
                    checked={noTime}
                    onChange={(e) => setNoTime(e.target.checked)}
                    style={{ marginRight: 10 }}
                  />
                  No time
                </label>
              </div>

              <div style={styles.notesCard}>
                <div style={styles.notesHeader}>Notes</div>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes..."
                  style={styles.textarea}
                />
              </div>

              <div style={styles.modalFooter}>
                {editingId ? (
                  <button
                    type="button"
                    style={styles.btnDangerGhost}
                    onClick={deleteFromModal}
                  >
                    Delete
                  </button>
                ) : (
                  <div />
                )}

                <div style={{ display: "flex", gap: 10 }}>
                  <button
                    type="button"
                    style={styles.btnGhost}
                    onClick={closeModal}
                  >
                    Close
                  </button>
                  <button
                    type="button"
                    style={styles.btnPrimary}
                    onClick={saveEvent}
                  >
                    {editingId ? "Save" : "Create"}
                  </button>
                </div>
              </div>

              <div style={styles.modalHint}>Esc closes. Click outside closes.</div>
            </div>
          </div>
        </div>
      )}

      <style jsx global>{`
        .calCell {
          transition: background 120ms ease, border-color 120ms ease,
            transform 120ms ease;
        }
        .calCell:hover {
          background: rgba(15, 23, 42, 0.055);
          border-color: rgba(15, 23, 42, 0.14);
        }
        .calCell:active {
          background: rgba(15, 23, 42, 0.085);
          border-color: rgba(15, 23, 42, 0.2);
          transform: translateY(1px);
        }
        .calPill {
          transition: filter 120ms ease, transform 120ms ease;
        }
        .calPill:hover {
          filter: brightness(0.94);
        }
        .calPill:active {
          filter: brightness(0.9);
          transform: translateY(1px);
        }
      `}</style>
    </>
  );
}

function LabeledInput({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}) {
  return (
    <div style={styles.fieldRow}>
      <div style={styles.fieldLabel}>{label}</div>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        style={styles.fieldInput}
      />
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  wrap: {
    background: "white",
    borderRadius: 16,
    border: "1px solid rgba(15,23,42,0.06)",
    padding: 18,
  },
  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 16,
    marginBottom: 14,
  },
  titleBlock: { display: "flex", flexDirection: "column", gap: 6 },
  h1: { fontSize: 22, fontWeight: 800, color: "#0f172a" },
  monthTitle: { fontSize: 24, fontWeight: 900, color: "#0f172a" },
  sub: { color: "rgba(15,23,42,0.6)", fontWeight: 600 },
  monthLabel: { fontSize: 20, fontWeight: 800, color: "#0f172a", marginTop: 6 },

  headerActions: { display: "flex", gap: 10, alignItems: "center" },
  btn: {
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    borderRadius: 12,
    padding: "10px 14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  iconBtn: {
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    borderRadius: 12,
    padding: "10px 12px",
    fontWeight: 800,
    cursor: "pointer",
  },
  info: { marginBottom: 10, color: "rgba(15,23,42,0.7)", fontWeight: 600 },
  error: {
    marginBottom: 12,
    background: "rgba(239,68,68,0.08)",
    border: "1px solid rgba(239,68,68,0.25)",
    color: "#b91c1c",
    padding: 12,
    borderRadius: 12,
    fontWeight: 700,
  },

  dowRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
    marginBottom: 10,
  },
  dow: { color: "rgba(15,23,42,0.6)", fontWeight: 800, fontSize: 14 },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 10,
  },
  cell: {
    textAlign: "left",
    border: "1px solid rgba(15,23,42,0.06)",
    background: "white",
    borderRadius: 14,
    padding: 12,
    minHeight: 86,
    cursor: "pointer",
  },
  cellOutsideMonth: {
    opacity: 0.55,
    background: "rgba(15,23,42,0.015)",
  },
  cellToday: {
    outline: "2px solid rgba(99,102,241,0.55)",
    outlineOffset: 0,
  },
  cellTopRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },
  dayNum: { fontWeight: 900, color: "#0f172a" },
  dayNumMuted: { color: "rgba(15,23,42,0.45)" },

  pills: { marginTop: 10, display: "flex", flexDirection: "column", gap: 6 },
  more: { fontSize: 12, fontWeight: 800, color: "rgba(15,23,42,0.55)" },

  footerHint: { marginTop: 10, color: "rgba(15,23,42,0.55)", fontWeight: 700 },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15, 23, 42, 0.45)",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    zIndex: 50,
  },
  modal: {
    width: "min(980px, 96vw)",
    background: "white",
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 20px 70px rgba(0,0,0,0.25)",
    overflow: "hidden",
  },
  modalHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "16px 18px",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    background: "rgba(15,23,42,0.02)",
  },
  modalTitle: { fontSize: 22, fontWeight: 900, color: "#0f172a" },
  closeX: {
    width: 42,
    height: 42,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    cursor: "pointer",
    fontSize: 18,
    fontWeight: 900,
  },
  modalBody: { padding: 18 },

  rowTop: {
    display: "grid",
    gridTemplateColumns: "1fr 220px",
    gap: 14,
    alignItems: "center",
    marginBottom: 14,
  },
  titleInput: {
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: "14px 14px",
    fontSize: 20,
    fontWeight: 800,
    outline: "none",
  },
  dateChip: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: "10px 12px",
    background: "white",
  },
  dateChipLabel: { fontWeight: 900, color: "rgba(15,23,42,0.55)" },
  dateInput: { border: "none", outline: "none", fontWeight: 900, fontSize: 16 },

  grid2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
    marginBottom: 14,
  },
  fieldRow: {
    display: "grid",
    gridTemplateColumns: "120px 1fr",
    gap: 12,
    alignItems: "center",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: "10px 12px",
    background: "white",
  },
  fieldLabel: { fontWeight: 900, color: "rgba(15,23,42,0.55)" },
  fieldInput: { border: "none", outline: "none", fontWeight: 800, fontSize: 16 },

  toggleRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 12,
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    padding: "12px 12px",
    marginBottom: 14,
  },
  toggleLabel: { fontWeight: 900, color: "rgba(15,23,42,0.55)" },
  togglePill: {
    display: "flex",
    alignItems: "center",
    fontWeight: 900,
    cursor: "pointer",
  },

  notesCard: {
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 14,
    overflow: "hidden",
    background: "white",
  },
  notesHeader: {
    padding: "10px 12px",
    fontWeight: 900,
    color: "rgba(15,23,42,0.55)",
    borderBottom: "1px solid rgba(15,23,42,0.06)",
    background: "rgba(15,23,42,0.02)",
  },
  textarea: {
    width: "100%",
    minHeight: 160,
    padding: 12,
    border: "none",
    outline: "none",
    resize: "vertical",
    fontSize: 15,
    fontWeight: 700,
  },

  modalFooter: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
    marginTop: 14,
  },
  btnGhost: {
    border: "1px solid rgba(15,23,42,0.10)",
    background: "white",
    borderRadius: 999,
    padding: "12px 18px",
    fontWeight: 800,
    cursor: "pointer",
  },
  btnPrimary: {
    border: "1px solid rgba(99,102,241,0.35)",
    background: "rgba(99,102,241,0.92)",
    color: "white",
    borderRadius: 999,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  btnDangerGhost: {
    border: "1px solid rgba(239,68,68,0.35)",
    background: "rgba(239,68,68,0.08)",
    color: "#b91c1c",
    borderRadius: 999,
    padding: "12px 18px",
    fontWeight: 900,
    cursor: "pointer",
  },
  modalHint: { marginTop: 10, color: "rgba(15,23,42,0.55)", fontWeight: 700 },

  // Darker “blob” pill for events
  pill: {
    appearance: "none",
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.06)",
    color: "#0f172a",
    borderRadius: 999,
    padding: "6px 10px",
    fontWeight: 850,
    fontSize: 12,
    width: "100%",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
    cursor: "pointer",
    textAlign: "left",
  },
};