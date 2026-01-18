"use client";

import { useMemo, useState } from "react";

type EventItem = {
  id: string;
  title: string;
  course?: string | null;
  weight?: number | null; // percent of final grade
  startAt: string; // ISO
  endAt: string | null; // ISO
  allDay: boolean;
  notes: string | null;
  source: string;
};

type Props = {
  compact?: boolean;
  title?: string;
  description?: string;
  footerNote?: string | null;
};

function startOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex, 1);
}

function endOfMonth(year: number, monthIndex: number) {
  return new Date(year, monthIndex + 1, 0);
}

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

function ymdKey(d: Date) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

export default function CalendarMonth({
  compact = false,
  title,
  description,
  footerNote,
}: Props) {
  const today = useMemo(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  }, []);

  const [viewDate, setViewDate] = useState<Date>(() => {
    const d = new Date();
    d.setHours(0, 0, 0, 0);
    return d;
  });

  const monthStart = useMemo(
    () => startOfMonth(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const monthEnd = useMemo(
    () => endOfMonth(viewDate.getFullYear(), viewDate.getMonth()),
    [viewDate]
  );

  const monthTitle = useMemo(() => {
    return viewDate.toLocaleDateString(undefined, {
      month: "long",
      year: "numeric",
    });
  }, [viewDate]);

  const [eventsByDay, setEventsByDay] = useState<Record<string, EventItem[]>>(
    () => ({})
  );

  const [modalOpen, setModalOpen] = useState(false);
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [formTitle, setFormTitle] = useState("");
  const [formStart, setFormStart] = useState("");
  const [formEnd, setFormEnd] = useState("");
  const [formAllDay, setFormAllDay] = useState(false);
  const [formNotes, setFormNotes] = useState("");
  const [formCourse, setFormCourse] = useState("");
  const [formWeight, setFormWeight] = useState(""); // keep as string for input

  function goToday() {
    setViewDate(new Date());
  }

  function prevMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() - 1, 1));
  }

  function nextMonth() {
    setViewDate((d) => new Date(d.getFullYear(), d.getMonth() + 1, 1));
  }

  const gridDates = useMemo(() => {
    const start = new Date(monthStart);
    start.setDate(start.getDate() - start.getDay());

    const out: Date[] = [];
    for (let i = 0; i < 42; i++) {
      const d = new Date(start);
      d.setDate(start.getDate() + i);
      d.setHours(0, 0, 0, 0);
      out.push(d);
    }
    return out;
  }, [monthStart]);

  function openCreate(date: Date) {
    const local = new Date(date);
    local.setHours(9, 0, 0, 0);

    setEditingEventId(null);
    setFormTitle("");
    setFormCourse("");
    setFormWeight("");
    setFormAllDay(false);
    setFormNotes("");
    setFormStart(local.toISOString().slice(0, 16));
    setFormEnd("");
    setModalOpen(true);
  }

  function openEdit(ev: EventItem) {
    setEditingEventId(ev.id);
    setFormTitle(ev.title ?? "");
    setFormCourse(ev.course ?? "");
    setFormWeight(ev.weight === null || ev.weight === undefined ? "" : String(ev.weight));
    setFormAllDay(Boolean(ev.allDay));
    setFormNotes(ev.notes ?? "");
    setFormStart(ev.startAt.slice(0, 16));
    setFormEnd(ev.endAt ? ev.endAt.slice(0, 16) : "");
    setModalOpen(true);
  }

  function closeModal() {
    setModalOpen(false);
  }

  async function saveEvent() {
    const t = formTitle.trim();
    if (!t) return;

    const startRaw = formStart ? new Date(formStart) : null;
    if (!startRaw || Number.isNaN(startRaw.getTime())) return;

    let endRaw: Date | null = null;
    if (formEnd) {
      const e = new Date(formEnd);
      if (!Number.isNaN(e.getTime())) endRaw = e;
    }

    const courseClean = formCourse.trim();
    const weightNum = formWeight.trim() ? Number(formWeight.trim()) : NaN;
    const weight = Number.isFinite(weightNum) ? weightNum : null;

    const id = editingEventId ?? crypto.randomUUID();
    const payload: EventItem = {
      id,
      title: t,
      course: courseClean ? courseClean : null,
      weight,
      startAt: startRaw.toISOString(),
      endAt: endRaw ? endRaw.toISOString() : null,
      allDay: formAllDay,
      notes: formNotes.trim() ? formNotes.trim() : null,
      source: "manual",
    };

    setEventsByDay((prev) => {
      const next = { ...prev };

      // remove old if editing
      if (editingEventId) {
        for (const k of Object.keys(next)) {
          next[k] = next[k].filter((e) => e.id !== editingEventId);
          if (next[k].length === 0) delete next[k];
        }
      }

      const key = ymdKey(new Date(payload.startAt));
      const arr = next[key] ? [...next[key]] : [];
      arr.push(payload);
      arr.sort((a, b) => a.startAt.localeCompare(b.startAt));
      next[key] = arr;

      return next;
    });

    setModalOpen(false);
  }

  async function deleteEvent() {
    if (!editingEventId) return;

    setEventsByDay((prev) => {
      const next = { ...prev };
      for (const k of Object.keys(next)) {
        next[k] = next[k].filter((e) => e.id !== editingEventId);
        if (next[k].length === 0) delete next[k];
      }
      return next;
    });

    setModalOpen(false);
  }

  // title controls:
  // - if title is undefined -> show default "Full Calendar"
  // - if title is "" (empty string) -> hide title entirely (your "remove Mini Calendar" case)
  const resolvedTitle = title === undefined ? "Full Calendar" : title;
  const showTitle = (resolvedTitle ?? "").trim().length > 0;

  return (
    <div style={styles.card}>
      <div style={styles.headerRow}>
        <div>
          {!compact && (
            <>
              {showTitle && <div style={styles.h1}>{resolvedTitle}</div>}
              <div style={{ ...styles.sub, marginTop: showTitle ? 4 : 0 }}>
                {description ?? ""}
              </div>
            </>
          )}

          <div style={styles.monthTitle}>{monthTitle}</div>
        </div>

        <div style={styles.controls}>
          <button style={styles.controlBtn} type="button" onClick={goToday}>
            Today
          </button>
          <button style={styles.iconBtn} type="button" onClick={prevMonth}>
            ◀
          </button>
          <button style={styles.iconBtn} type="button" onClick={nextMonth}>
            ▶
          </button>
        </div>
      </div>

      <div style={styles.dowRow}>
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} style={styles.dowCell}>
            {d}
          </div>
        ))}
      </div>

      <div style={styles.grid}>
        {gridDates.map((d) => {
          const inMonth = d >= monthStart && d <= monthEnd;
          const key = ymdKey(d);
          const dayEvents = eventsByDay[key] ?? [];
          const isToday = isSameDay(d, today);

          return (
            <div
              key={key}
              style={{
                ...styles.dayCell,
                ...(inMonth ? {} : styles.dayCellMuted),
                ...(isToday ? styles.dayCellToday : {}),
              }}
              onClick={() => openCreate(d)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") openCreate(d);
              }}
            >
              <div style={styles.dayNum}>{d.getDate()}</div>

              <div style={styles.pills}>
                {dayEvents.slice(0, 3).map((ev) => (
                  <button
                    key={ev.id}
                    type="button"
                    style={styles.pill}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      openEdit(ev);
                    }}
                    title={
                      (ev.course || ev.weight !== undefined) && (ev.course || ev.weight !== null)
                        ? `Click to edit\nCourse: ${ev.course ?? "-"}\nWeight: ${ev.weight ?? "-"}%`
                        : "Click to edit"
                    }
                  >
                    {ev.title}
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {modalOpen && (
        <div
          style={styles.overlay}
          onMouseDown={(e) => {
            if (e.target === e.currentTarget) setModalOpen(false);
          }}
        >
          <div style={styles.modal}>
            <div style={styles.modalHeader}>
              <div style={styles.modalTitle}>
                {editingEventId ? "Edit event" : "New event"}
              </div>
              <button style={styles.closeBtn} type="button" onClick={closeModal}>
                ✕
              </button>
            </div>

            <div style={styles.form}>
              <label style={styles.label}>
                Title
                <input
                  style={styles.input}
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                />
              </label>

              <div style={styles.row2}>
                <label style={styles.label}>
                  Course (optional)
                  <input
                    style={styles.input}
                    value={formCourse}
                    onChange={(e) => setFormCourse(e.target.value)}
                    placeholder="e.g., COMP 206"
                  />
                </label>

                <label style={styles.label}>
                  Weight % (optional)
                  <input
                    style={styles.input}
                    type="number"
                    inputMode="decimal"
                    min={0}
                    max={100}
                    step={0.1}
                    value={formWeight}
                    onChange={(e) => setFormWeight(e.target.value)}
                    placeholder="e.g., 20"
                  />
                </label>
              </div>

              <div style={styles.row2}>
                <label style={styles.label}>
                  Start
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={formStart}
                    onChange={(e) => setFormStart(e.target.value)}
                  />
                </label>

                <label style={styles.label}>
                  End (optional)
                  <input
                    style={styles.input}
                    type="datetime-local"
                    value={formEnd}
                    onChange={(e) => setFormEnd(e.target.value)}
                  />
                </label>
              </div>

              <label style={styles.checkRow}>
                <input
                  type="checkbox"
                  checked={formAllDay}
                  onChange={(e) => setFormAllDay(e.target.checked)}
                />
                <span>All day</span>
              </label>

              <label style={styles.label}>
                Notes (optional)
                <textarea
                  style={styles.textarea}
                  value={formNotes}
                  onChange={(e) => setFormNotes(e.target.value)}
                  rows={4}
                />
              </label>

              <div style={styles.actions}>
                {editingEventId ? (
                  <button
                    style={{ ...styles.actionBtn, ...styles.dangerBtn }}
                    type="button"
                    onClick={deleteEvent}
                  >
                    Delete
                  </button>
                ) : (
                  <div />
                )}

                <div style={styles.actionsRight}>
                  <button style={styles.actionBtn} type="button" onClick={closeModal}>
                    Cancel
                  </button>
                  <button
                    style={{ ...styles.actionBtn, ...styles.primaryBtn }}
                    type="button"
                    onClick={saveEvent}
                  >
                    Save
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  card: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#ffffff",
    padding: 14,
  },

  headerRow: {
    display: "flex",
    alignItems: "flex-start",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginBottom: 10,
  },

  h1: {
    fontWeight: 950,
    fontSize: 20,
    letterSpacing: "-0.02em",
    color: "rgba(15,23,42,0.95)",
  },
  sub: {
    marginTop: 4,
    fontWeight: 800,
    color: "rgba(15,23,42,0.55)",
  },
  monthTitle: {
    marginTop: 10,
    fontWeight: 950,
    fontSize: 22,
    letterSpacing: "-0.02em",
    color: "rgba(15,23,42,0.95)",
  },

  controls: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  controlBtn: {
    height: 36,
    padding: "0 12px",
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 950,
    cursor: "pointer",
  },
  iconBtn: {
    height: 36,
    width: 40,
    borderRadius: 12,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 950,
    cursor: "pointer",
  },

  dowRow: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 12,
    marginBottom: 10,
    padding: "0 4px",
  },
  dowCell: {
    fontWeight: 900,
    color: "rgba(15,23,42,0.55)",
    fontSize: 12,
    textAlign: "center",
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(7, 1fr)",
    gap: 12,
  },

  dayCell: {
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.01)",
    minHeight: 92,
    padding: 10,
    cursor: "pointer",
    display: "flex",
    flexDirection: "column",
    outline: "none",
  },
  dayCellMuted: {
    opacity: 0.45,
  },
  dayCellToday: {
    boxShadow: "0 0 0 2px rgba(99,102,241,0.35) inset",
  },

  dayNum: {
    fontWeight: 950,
    color: "rgba(15,23,42,0.90)",
  },

  pills: {
    marginTop: 8,
    display: "flex",
    flexDirection: "column",
    gap: 6,
  },
  pill: {
    textAlign: "left",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
    padding: "6px 10px",
    fontWeight: 900,
    fontSize: 12,
    cursor: "pointer",
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },

  footerHint: {
    marginTop: 10,
    fontWeight: 850,
    color: "rgba(15,23,42,0.55)",
  },

  overlay: {
    position: "fixed",
    inset: 0,
    background: "rgba(15,23,42,0.40)",
    display: "grid",
    placeItems: "center",
    padding: 16,
    zIndex: 50,
  },
  modal: {
    width: "min(680px, 96vw)",
    borderRadius: 22,
    background: "#ffffff",
    border: "1px solid rgba(15,23,42,0.10)",
    boxShadow: "0 30px 90px rgba(15,23,42,0.25)",
    padding: 16,
  },
  modalHeader: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  modalTitle: {
    fontWeight: 950,
    fontSize: 18,
  },
  closeBtn: {
    height: 36,
    width: 40,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 950,
    cursor: "pointer",
  },

  form: {
    display: "flex",
    flexDirection: "column",
    gap: 12,
  },
  row2: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 12,
  },
  label: {
    display: "flex",
    flexDirection: "column",
    gap: 6,
    fontWeight: 900,
    color: "rgba(15,23,42,0.75)",
  },
  input: {
    height: 42,
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: "0 12px",
    fontWeight: 850,
    outline: "none",
  },
  textarea: {
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    padding: 12,
    fontWeight: 850,
    outline: "none",
    resize: "vertical",
  },

  checkRow: {
    display: "flex",
    alignItems: "center",
    gap: 10,
    fontWeight: 900,
    color: "rgba(15,23,42,0.75)",
  },

  actions: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginTop: 4,
  },
  actionsRight: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  actionBtn: {
    height: 42,
    padding: "0 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 950,
    cursor: "pointer",
  },
  primaryBtn: {
    background: "rgba(15,23,42,0.10)",
  },
  dangerBtn: {
    background: "rgba(239,68,68,0.10)",
    border: "1px solid rgba(239,68,68,0.22)",
  },
};