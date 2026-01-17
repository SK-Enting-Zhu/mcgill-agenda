import Link from "next/link";
import CalendarMonth from "../_components/CalendarMonth";

export default function MainPage() {
  return (
    <main style={styles.main}>
      <div style={styles.topbar}>
        <input
          style={styles.search}
          placeholder="Quick search events, syllabi, or courses..."
          aria-label="Search"
        />
      </div>

      <div style={styles.kpiRow}>
        <KpiCard title="Pending Tasks" subtitle="Connect data source" href="/todo" />
        <KpiCard title="Upcoming Exams" subtitle="Connect data source" href="/todo" />
        <KpiCard title="Efficiency" subtitle="Connect data source" href="/todo" />
      </div>

      <div style={styles.titleRow}>
        <div>
          <h1 style={styles.h1}>Academic Schedule</h1>
          <p style={styles.sub}>Template view — content area changes, sidebar stays fixed</p>
        </div>

        <div style={styles.actions}>
          <Link href="/calendar" style={styles.secondaryBtn}>
            View Calendar
          </Link>
          <Link href="/calendar" style={styles.primaryBtn}>
            + Add Item
          </Link>
        </div>
      </div>

      <section style={styles.block}>
        <div style={styles.blockHeader}>
          <div>
            <div style={styles.blockTitle}>No schedule items yet</div>
            <div style={styles.blockSub}>
              Once you connect Brightspace / Notion / Google Calendar, items will appear here.
            </div>
          </div>
        </div>
      </section>

      <section style={styles.block}>
        <div style={styles.blockHeader}>
          <div>
            <div style={styles.blockTitle}>Mini calendar</div>
            <div style={styles.blockSub}>
              Same Events database as the Full Calendar page.
            </div>
          </div>

          <Link href="/calendar" style={styles.linkBtn}>
            Open full calendar →
          </Link>
        </div>

        <div style={{ marginTop: 12 }}>
          <CalendarMonth compact={true} />
        </div>
      </section>
    </main>
  );
}

function KpiCard({
  title,
  subtitle,
  href,
}: {
  title: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href} style={styles.kpiCard}>
      <div style={styles.kpiTop}>
        <div style={styles.kpiTitle}>{title}</div>
        <div style={styles.kpiOpen}>
          Open <span aria-hidden>→</span>
        </div>
      </div>
      <div style={styles.kpiValue} aria-label={`${title} value`}>
        —
      </div>
      <div style={styles.kpiSub}>{subtitle}</div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: 24 },

  topbar: { marginBottom: 18 },
  search: {
    width: "100%",
    maxWidth: 980,
    height: 52,
    borderRadius: 18,
    border: "1px solid rgba(15,23,42,0.08)",
    background: "rgba(255,255,255,0.9)",
    padding: "0 18px",
    outline: "none",
    fontWeight: 700,
    color: "#0f172a",
  },

  kpiRow: {
    display: "grid",
    gridTemplateColumns: "repeat(3, minmax(0, 1fr))",
    gap: 16,
    marginBottom: 22,
    maxWidth: 1120,
  },
  kpiCard: {
    display: "block",
    textDecoration: "none",
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 18,
    padding: 18,
    boxShadow: "0 1px 0 rgba(15,23,42,0.03)",
  },
  kpiTop: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
  },
  kpiTitle: { fontWeight: 900, color: "rgba(15,23,42,0.7)" },
  kpiOpen: { fontWeight: 800, color: "rgba(15,23,42,0.55)" },
  kpiValue: { fontSize: 34, fontWeight: 950, marginTop: 8, color: "#0f172a" },
  kpiSub: { marginTop: 6, fontWeight: 700, color: "rgba(15,23,42,0.55)" },

  titleRow: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 16,
    maxWidth: 1120,
    marginBottom: 16,
  },
  h1: {
    margin: 0,
    fontSize: 44,
    fontWeight: 950,
    letterSpacing: -0.6,
    color: "#0f172a",
  },
  sub: { margin: "6px 0 0 0", fontWeight: 800, color: "rgba(15,23,42,0.55)" },

  actions: { display: "flex", gap: 12, alignItems: "center" },
  secondaryBtn: {
    textDecoration: "none",
    padding: "10px 14px",
    borderRadius: 14,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(255,255,255,0.9)",
    color: "#0f172a",
    fontWeight: 900,
  },
  primaryBtn: {
    textDecoration: "none",
    padding: "10px 16px",
    borderRadius: 14,
    border: "1px solid rgba(79,70,229,0.3)",
    background: "#4f46e5",
    color: "white",
    fontWeight: 950,
  },

  block: {
    maxWidth: 1120,
    background: "rgba(255,255,255,0.92)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
  },
  blockHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  blockTitle: { fontSize: 22, fontWeight: 950, color: "#0f172a" },
  blockSub: { marginTop: 6, fontWeight: 750, color: "rgba(15,23,42,0.6)" },
  linkBtn: {
    textDecoration: "none",
    fontWeight: 900,
    color: "rgba(79,70,229,0.95)",
    padding: "8px 10px",
    borderRadius: 12,
    border: "1px solid rgba(79,70,229,0.18)",
    background: "rgba(79,70,229,0.06)",
    height: 36,
  },
};