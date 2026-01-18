"use client";

import { useEffect, useMemo, useState } from "react";
import CalendarMonth from "../_components/CalendarMonth";

type EventItem = {
  id?: string | number;
  title?: string;
  description?: string;
  date?: string; // ISO
  etype?: string;
  course?: string;
};

function formatShortDate(iso?: string) {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d
    .toLocaleDateString(undefined, { month: "short", day: "numeric" })
    .toUpperCase();
}

export default function MainDashboardPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  const now = useMemo(() => new Date(), []);
  const month = now.getMonth() + 1;
  const year = now.getFullYear();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        setLoading(true);
        const res = await fetch(`/api/events?month=${month}&year=${year}`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (!cancelled) setEvents(Array.isArray(data) ? data : []);
      } catch {
        if (!cancelled) setEvents([]);
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [month, year]);

  const examsCount = useMemo(() => {
    const examWords = ["exam", "midterm", "final", "quiz", "test"];
    return events.filter((e) => {
      const t = (e.etype ?? "").toLowerCase();
      const title = (e.title ?? "").toLowerCase();
      return examWords.some((w) => t.includes(w) || title.includes(w));
    }).length;
  }, [events]);

  const pendingCount = events.length;

  return (
    <div style={styles.page}>
      {/* KPI ROW */}
      <div style={styles.kpiRow}>
        <div style={{ ...styles.kpiCard, ...styles.kpiPrimary }}>
          <div style={styles.kpiLabel}>Pending Items</div>
          <div style={styles.kpiValue}>{pendingCount}</div>
        </div>

        <div style={styles.kpiCard}>
          <div style={styles.kpiLabel}>Upcoming Exams</div>
          <div style={styles.kpiValue}>{examsCount}</div>
        </div>
      </div>

      {/* HEADER + ACTIONS */}
      <div style={styles.headerRow}>
        <div>
          <div style={styles.h1}>Academic Schedule</div>
        </div>

        <div style={styles.actions}>
          <button style={styles.btn} type="button">
            + Event
          </button>
          <button style={{ ...styles.btn, ...styles.btnPrimary }} type="button">
            ⛓ Sync Workspace
          </button>
        </div>
      </div>

      {/* EVENTS GRID */}
      <div style={styles.eventsGrid}>
        {loading ? (
          <div style={styles.muted}>Loading events…</div>
        ) : events.length === 0 ? null : (
          events
            .slice()
            .sort((a, b) => {
              const ad = a.date ? new Date(a.date).getTime() : 0;
              const bd = b.date ? new Date(b.date).getTime() : 0;
              return ad - bd;
            })
            .map((e, idx) => (
              <div key={(e.id as any) ?? idx} style={styles.eventCard}>
                <div style={styles.eventTopRow}>
                  <div style={styles.pillsRow}>
                    <span style={styles.pillTag}>
                      {(e.etype ?? "event").toUpperCase()}
                    </span>
                    {e.course ? (
                      <span style={styles.pillCourse}>
                        {e.course.toUpperCase()}
                      </span>
                    ) : null}
                  </div>
                  <div style={styles.toggleStub} aria-hidden />
                </div>

                <div style={styles.eventTitle}>{e.title ?? "Untitled"}</div>
                <div style={styles.eventDesc}>{e.description ?? ""}</div>

                <div style={styles.eventFooter}>
                  <span style={styles.footerIcon} aria-hidden>
                    📅
                  </span>
                  <span style={styles.footerText}>{formatShortDate(e.date)}</span>
                </div>
              </div>
            ))
        )}
      </div>

      {/* MINI CALENDAR (DASHBOARD) */}
      <div style={styles.miniSection}>
        <div style={styles.miniWrap}>
          <CalendarMonth
            title=""
            description="All actions done here are reflected on the full calendar page."
            footerNote={null}
          />
        </div>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: {
    display: "flex",
    flexDirection: "column",
    gap: 18,
  },

  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(2, minmax(220px, 1fr))",
    gap: 16,
  },
  kpiCard: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(15,23,42,0.02)",
    padding: "22px 22px",
    minHeight: 102,
  },
  kpiPrimary: {
    background: "rgba(15,23,42,0.06)",
  },
  kpiLabel: {
    fontWeight: 850,
    color: "rgba(15,23,42,0.65)",
    fontSize: 13,
  },
  kpiValue: {
    marginTop: 10,
    fontWeight: 950,
    fontSize: 38,
    letterSpacing: "-0.02em",
    color: "rgba(15,23,42,0.92)",
  },

  headerRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 14,
    flexWrap: "wrap",
    marginTop: 6,
  },
  h1: {
    fontWeight: 950,
    fontSize: 28,
    letterSpacing: "-0.03em",
    color: "rgba(15,23,42,0.95)",
  },
  actions: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },
  btn: {
    height: 42,
    padding: "0 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    fontWeight: 950,
    cursor: "pointer",
  },
  btnPrimary: {
    background: "rgba(15,23,42,0.10)",
  },

  eventsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(260px, 1fr))",
    gap: 16,
  },
  eventCard: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#ffffff",
    padding: "16px 16px",
    minHeight: 210,
    display: "flex",
    flexDirection: "column",
  },
  eventTopRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    marginBottom: 10,
  },
  pillsRow: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    flexWrap: "wrap",
  },
  pillTag: {
    fontSize: 11,
    fontWeight: 950,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.04)",
  },
  pillCourse: {
    fontSize: 11,
    fontWeight: 950,
    padding: "7px 10px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    color: "rgba(15,23,42,0.70)",
  },
  toggleStub: {
    width: 44,
    height: 26,
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
  },
  eventTitle: {
    fontSize: 20,
    fontWeight: 950,
    letterSpacing: "-0.02em",
    color: "rgba(15,23,42,0.95)",
  },
  eventDesc: {
    marginTop: 8,
    fontWeight: 750,
    color: "rgba(15,23,42,0.55)",
    lineHeight: 1.45,
    minHeight: 42,
  },
  eventFooter: {
    marginTop: "auto",
    paddingTop: 12,
    display: "flex",
    alignItems: "center",
    gap: 8,
    color: "rgba(15,23,42,0.60)",
    fontWeight: 900,
    fontSize: 12,
  },
  footerIcon: { opacity: 0.8 },
  footerText: { letterSpacing: "0.08em" },

  miniSection: {
    marginTop: 6,
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  miniWrap: {
    borderRadius: 22,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "#ffffff",
    padding: 12,
  },

  muted: {
    fontWeight: 850,
    color: "rgba(15,23,42,0.55)",
    padding: 10,
  },
};