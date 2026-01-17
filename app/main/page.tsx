import Link from "next/link";

export default function MainMenuPage() {
  const fakeUser = { name: "McGill Student" };

  return (
    <main style={styles.main}>
      <div style={styles.card}>
        <header style={styles.header}>
          <div>
            <h1 style={styles.h1}>Main Menu</h1>
            <p style={styles.p}>
              Signed in as <b>{fakeUser.name}</b> (mock)
            </p>
          </div>

          <Link href="/" style={styles.logout}>
            Back to Login (later)
          </Link>
        </header>

        <section style={styles.grid}>
          <MenuTile title="Todo list" description="Tasks + filters" href="/todo" />
          <MenuTile title="Calendar" description="Agenda view" href="/calendar" />
          <MenuTile
            title="Notification management"
            description="Reminder rules"
            href="/notifications"
          />
          <MenuTile title="Settings" description="Sync + account" href="/settings" />
        </section>

        <div style={styles.note}>
          <p style={{ margin: 0 }}>
            UI-first main menu. Login & Brightspace sync will be added later.
          </p>
        </div>
      </div>
    </main>
  );
}

function MenuTile({
  title,
  description,
  href,
}: {
  title: string;
  description: string;
  href: string;
}) {
  return (
    <Link href={href} style={styles.tile}>
      <div style={styles.tileTitle}>{title}</div>
      <div style={styles.tileDesc}>{description}</div>
    </Link>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: {
    minHeight: "100vh",
    display: "grid",
    placeItems: "center",
    padding: 24,
    background: "#0b1020",
    color: "white",
  },
  card: {
    width: "min(860px, 100%)",
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.14)",
    borderRadius: 16,
    padding: 24,
    boxShadow: "0 20px 60px rgba(0,0,0,0.35)",
  },
  header: {
    display: "flex",
    justifyContent: "space-between",
    gap: 16,
    alignItems: "start",
    marginBottom: 18,
  },
  h1: { fontSize: 28, margin: 0 },
  p: { marginTop: 10, opacity: 0.85 },
  logout: {
    textDecoration: "none",
    padding: "8px 12px",
    borderRadius: 10,
    fontWeight: 700,
    background: "rgba(255,255,255,0.10)",
    color: "white",
    border: "1px solid rgba(255,255,255,0.18)",
  },
  grid: {
    display: "grid",
    gap: 12,
    gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
  },
  tile: {
    textDecoration: "none",
    color: "white",
    padding: 16,
    borderRadius: 14,
    border: "1px solid rgba(255,255,255,0.14)",
    background: "rgba(255,255,255,0.05)",
  },
  tileTitle: { fontWeight: 800, marginBottom: 6 },
  tileDesc: { opacity: 0.85, fontSize: 13 },
  note: {
    marginTop: 16,
    padding: 12,
    borderRadius: 12,
    background: "rgba(255,255,255,0.05)",
    border: "1px dashed rgba(255,255,255,0.18)",
  },
};