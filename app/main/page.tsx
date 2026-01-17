import Link from "next/link";

export default function MainPage() {
  return (
    <div style={styles.app}>
      {/* SIDEBAR */}
      <aside style={styles.sidebar}>
        <div style={styles.logo}>
          🎓 <span style={{ marginLeft: 8, fontWeight: 800 }}>SyncGenius</span>
        </div>

        <div style={styles.menuTitle}>MAIN MENU</div>

        <nav style={styles.menu}>
          <MenuItem active label="Agenda" />
          <MenuItem label="Full Calendar" />
          <MenuItem label="Notifications" />
          <MenuItem label="Settings" />
        </nav>

        <div style={{ flex: 1 }} />

        <div style={styles.userCard}>
          <div style={styles.avatar}>AR</div>
          <div>
            <div style={{ fontWeight: 700 }}>Alex Rivera</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>PREMIUM PLAN</div>
          </div>
        </div>

        <Link href="/" style={styles.logout}>
          ⬅ Logout Session
        </Link>
      </aside>

      {/* MAIN CONTENT */}
      <main style={styles.content}>
        {/* TOP BAR */}
        <div style={styles.topbar}>
          <input
            placeholder="Quick search events, syllabi, or courses..."
            style={styles.search}
          />
          <div style={styles.topIcons}>
            <div style={styles.circle}>JD</div>
            <div style={styles.circle}>SM</div>
            <div style={styles.circle}>+1</div>
            🔔
          </div>
        </div>

        {/* STATS */}
        <div style={styles.stats}>
          <StatCard primary title="Pending Tasks" value="4" />
          <StatCard title="Upcoming Exams" value="2" />
          <StatCard title="Efficiency" value="0%" />
        </div>

        {/* HEADER */}
        <div style={styles.sectionHeader}>
          <div>
            <h1 style={{ margin: 0 }}>Academic Schedule</h1>
            <p style={{ margin: 0, opacity: 0.6 }}>
              AI-driven syllabus synchronization
            </p>
          </div>

          <div style={styles.actions}>
            <button style={styles.iconBtn}>☰</button>
            <button style={styles.secondaryBtn}>＋ Event</button>
            <button style={styles.primaryBtn}>🔗 Sync Workspace</button>
          </div>
        </div>

        {/* CARDS */}
        <div style={styles.grid}>
          <ScheduleCard
            tag="READING"
            course="ADVANCED WEB ENGINEERING"
            title="Reading Assignment"
            desc="Reading assignment due for Intro to Web Dev."
            date="SEP 14"
          />
          <ScheduleCard
            tag="EXAM"
            exam
            course="ADVANCED WEB ENGINEERING"
            title="Midterm Exam"
            desc="Midterm Exam covering all React modules."
            date="OCT 4"
          />
          <ScheduleCard
            tag="MILESTONE"
            course="ADVANCED WEB ENGINEERING"
            title="Final Project Proposal"
            desc="Submission deadline for the Final Project Proposal."
            date="OCT 31"
          />
        </div>
      </main>
    </div>
  );
}

/* ---------------- COMPONENTS ---------------- */

function MenuItem({ label, active }: { label: string; active?: boolean }) {
  return (
    <div
      style={{
        ...styles.menuItem,
        ...(active ? styles.menuItemActive : {}),
      }}
    >
      {label}
    </div>
  );
}

function StatCard({
  title,
  value,
  primary,
}: {
  title: string;
  value: string;
  primary?: boolean;
}) {
  return (
    <div
      style={{
        ...styles.statCard,
        ...(primary ? styles.statPrimary : {}),
      }}
    >
      <div>
        <div style={{ opacity: primary ? 0.9 : 0.6 }}>{title}</div>
        <div style={{ fontSize: 28, fontWeight: 800 }}>{value}</div>
      </div>
    </div>
  );
}

function ScheduleCard({
  tag,
  course,
  title,
  desc,
  date,
  exam,
}: {
  tag: string;
  course: string;
  title: string;
  desc: string;
  date: string;
  exam?: boolean;
}) {
  return (
    <div style={styles.card}>
      <div style={styles.cardTop}>
        <span
          style={{
            ...styles.tag,
            background: exam ? "#FEE2E2" : "#EDEBFF",
            color: exam ? "#DC2626" : "#4F46E5",
          }}
        >
          {tag}
        </span>
        <span style={styles.course}>{course}</span>
        <input type="checkbox" />
      </div>

      <h3>{title}</h3>
      <p style={{ opacity: 0.6 }}>{desc}</p>

      <div style={styles.date}>📅 {date}</div>
    </div>
  );
}

/* ---------------- STYLES ---------------- */

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#F6F7FB",
    fontFamily: "system-ui",
  },

  sidebar: {
    width: 260,
    background: "white",
    padding: 20,
    display: "flex",
    flexDirection: "column",
    gap: 16,
    borderRight: "1px solid #E5E7EB",
  },

  logo: {
    fontSize: 20,
    fontWeight: 900,
  },

  menuTitle: {
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.5,
    marginTop: 10,
  },

  menu: {
    display: "flex",
    flexDirection: "column",
    gap: 8,
  },

  menuItem: {
    padding: "10px 14px",
    borderRadius: 10,
    cursor: "pointer",
    fontWeight: 600,
  },

  menuItemActive: {
    background: "#4F46E5",
    color: "white",
  },

  userCard: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 12,
    background: "#F3F4F6",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "#4F46E5",
    color: "white",
    display: "grid",
    placeItems: "center",
    fontWeight: 800,
  },

  logout: {
    textDecoration: "none",
    color: "#111",
    fontWeight: 600,
    marginTop: 10,
  },

  content: {
    flex: 1,
    padding: 30,
    display: "flex",
    flexDirection: "column",
    gap: 24,
  },

  topbar: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  search: {
    width: "60%",
    padding: 12,
    borderRadius: 12,
    border: "1px solid #E5E7EB",
  },

  topIcons: {
    display: "flex",
    alignItems: "center",
    gap: 10,
  },

  circle: {
    width: 32,
    height: 32,
    borderRadius: "50%",
    background: "#E5E7EB",
    display: "grid",
    placeItems: "center",
    fontSize: 12,
    fontWeight: 700,
  },

  stats: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },

  statCard: {
    background: "white",
    padding: 20,
    borderRadius: 16,
  },

  statPrimary: {
    background: "#4F46E5",
    color: "white",
  },

  sectionHeader: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
  },

  actions: {
    display: "flex",
    gap: 10,
  },

  iconBtn: {
    padding: 10,
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "white",
  },

  secondaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "1px solid #E5E7EB",
    background: "white",
    fontWeight: 600,
  },

  primaryBtn: {
    padding: "10px 14px",
    borderRadius: 10,
    border: "none",
    background: "#4F46E5",
    color: "white",
    fontWeight: 700,
  },

  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },

  card: {
    background: "white",
    padding: 20,
    borderRadius: 16,
  },

  cardTop: {
    display: "flex",
    gap: 8,
    alignItems: "center",
  },

  tag: {
    padding: "4px 10px",
    borderRadius: 999,
    fontSize: 11,
    fontWeight: 700,
  },

  course: {
    fontSize: 11,
    opacity: 0.6,
    flex: 1,
  },

  date: {
    marginTop: 16,
    fontSize: 12,
    opacity: 0.6,
  },
};