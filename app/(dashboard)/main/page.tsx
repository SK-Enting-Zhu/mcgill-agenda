import Link from "next/link";

export default function MainPage() {
  return (
    <>
      <div style={styles.topbar}>
        <input
          placeholder="Quick search events, syllabi, or courses..."
          style={styles.search}
        />
      </div>

      <div style={styles.stats}>
        <StatCard title="Pending Tasks" value="—" subtitle="Connect data source" href="/todo" />
        <StatCard title="Upcoming Exams" value="—" subtitle="Connect data source" href="/calendar" />
        <StatCard title="Efficiency" value="—" subtitle="Connect data source" href="/settings" />
      </div>

      <div style={styles.sectionHeader}>
        <div>
          <h1 style={{ margin: 0 }}>Academic Schedule</h1>
          <p style={{ margin: 0, opacity: 0.6 }}>
            Template view — content area changes, sidebar stays fixed
          </p>
        </div>

        <div style={styles.actions}>
          <Link href="/calendar" style={styles.secondaryBtn}>
            View Calendar
          </Link>
          <Link href="/todo" style={styles.primaryBtn}>
            ＋ Add Item
          </Link>
        </div>
      </div>

      <section style={styles.emptyCard}>
        <h2 style={{ margin: 0, fontSize: 18 }}>No schedule items yet</h2>
        <p style={{ margin: "8px 0 0 0", opacity: 0.65, lineHeight: 1.4 }}>
          Once you connect Brightspace / Notion / Google Calendar, items will appear here.
        </p>
      </section>
    </>
  );
}

function StatCard({
  title,
  value,
  subtitle,
  href,
}: {
  title: string;
  value: string;
  subtitle: string;
  href: string;
}) {
  return (
    <Link href={href} style={styles.statCard}>
      <div>
        <div style={styles.statTitle}>{title}</div>
        <div style={styles.statValue}>{value}</div>
        <div style={styles.statSub}>{subtitle}</div>
      </div>
      <div style={styles.statCta}>Open →</div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  topbar: { display: "flex", justifyContent: "flex-start", alignItems: "center" },
  search: {
    width: "min(900px, 100%)",
    padding: 12,
    borderRadius: 14,
    border: "1px solid #E5E7EB",
    outline: "none",
    background: "white",
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },

  statCard: {
    background: "white",
    padding: 18,
    borderRadius: 16,
    textDecoration: "none",
    color: "#0F172A",
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    border: "1px solid rgba(15, 23, 42, 0.06)",
  },
  statTitle: { fontWeight: 800, opacity: 0.7, fontSize: 13 },
  statValue: { fontSize: 30, fontWeight: 900, marginTop: 6 },
  statSub: { marginTop: 4, fontSize: 12, opacity: 0.6, fontWeight: 700 },
  statCta: { fontSize: 12, opacity: 0.6, fontWeight: 800 },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 12,
    marginTop: 4,
  },

  actions: { display: "flex", gap: 10, alignItems: "center" },

  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid #E5E7EB",
    background: "white",
    fontWeight: 800,
    textDecoration: "none",
    color: "#111827",
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 12,
    border: "1px solid rgba(79,70,229,0.20)",
    background: "#4F46E5",
    color: "white",
    fontWeight: 900,
    textDecoration: "none",
  },

  emptyCard: {
    background: "white",
    borderRadius: 16,
    padding: 18,
    border: "1px solid rgba(15, 23, 42, 0.06)",
  },
};