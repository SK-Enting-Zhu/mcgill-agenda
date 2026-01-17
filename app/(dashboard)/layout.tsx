import Link from "next/link";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div style={styles.app}>
      {/* SIDEBAR ALWAYS VISIBLE */}
      <aside style={styles.sidebar}>
        <div style={styles.logoRow}>
          <div style={styles.logoIcon} aria-hidden>
            🎓
          </div>
          <div>
            <div style={styles.logoText}>SyncGenius</div>
            <div style={styles.logoSub}>Template</div>
          </div>
        </div>

        <div style={styles.menuTitle}>MAIN MENU</div>

        <nav style={styles.menu}>
          <SidebarLink href="/main" label="Agenda" />
          <SidebarLink href="/calendar" label="Full Calendar" />
          <SidebarLink href="/notifications" label="Notifications" />
          <SidebarLink href="/settings" label="Settings" />
          <SidebarLink href="/todo" label="Todo list" />
        </nav>

        <div style={{ flex: 1 }} />

        <div style={styles.userCard}>
          <div style={styles.avatar}>MS</div>
          <div>
            <div style={{ fontWeight: 800 }}>McGill Student</div>
            <div style={{ fontSize: 12, opacity: 0.6 }}>DEMO ACCOUNT</div>
          </div>
        </div>

        <Link href="/" style={styles.logout}>
          ⬅ Back to Login
        </Link>
      </aside>

      {/* ONLY THIS CHANGES PER PAGE */}
      <main style={styles.content}>{children}</main>
    </div>
  );
}

function SidebarLink({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} style={styles.menuItem}>
      {label}
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  app: {
    display: "flex",
    minHeight: "100vh",
    background: "#F6F7FB",
    fontFamily: "system-ui",
    color: "#0F172A",
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

  logoRow: { display: "flex", alignItems: "center", gap: 12 },
  logoIcon: {
    width: 42,
    height: 42,
    borderRadius: 14,
    display: "grid",
    placeItems: "center",
    background: "rgba(79,70,229,0.10)",
    color: "#4F46E5",
    fontWeight: 900,
  },
  logoText: { fontSize: 18, fontWeight: 900 },
  logoSub: { fontSize: 12, opacity: 0.55, marginTop: 2 },

  menuTitle: {
    fontSize: 12,
    letterSpacing: 1,
    opacity: 0.5,
    marginTop: 10,
  },

  menu: { display: "flex", flexDirection: "column", gap: 8 },

  menuItem: {
    padding: "10px 14px",
    borderRadius: 12,
    textDecoration: "none",
    color: "#111827",
    fontWeight: 700,
    background: "rgba(15, 23, 42, 0.03)",
    border: "1px solid rgba(15, 23, 42, 0.05)",
  },

  userCard: {
    display: "flex",
    gap: 10,
    alignItems: "center",
    padding: 12,
    borderRadius: 14,
    background: "#F3F4F6",
    border: "1px solid rgba(15, 23, 42, 0.06)",
  },

  avatar: {
    width: 40,
    height: 40,
    borderRadius: "50%",
    background: "rgba(15, 23, 42, 0.10)",
    color: "#111827",
    display: "grid",
    placeItems: "center",
    fontWeight: 900,
    fontSize: 12,
  },

  logout: {
    textDecoration: "none",
    color: "#111827",
    fontWeight: 700,
    marginTop: 10,
  },

  content: {
    flex: 1,
    padding: 30,
    display: "flex",
    flexDirection: "column",
    gap: 20,
  },
};