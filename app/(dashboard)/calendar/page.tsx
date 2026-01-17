import CalendarMonth from "../_components/CalendarMonth";

export default function CalendarPage() {
  return (
    <main style={styles.main}>
      <div style={styles.header}>
        <div>
          <h1 style={styles.h1}>Full Calendar</h1>
          <p style={styles.sub}>
            Add / edit / delete events here. Changes also appear on the mini calendar on the Agenda page.
          </p>
        </div>
      </div>

      <section style={styles.card}>
        <CalendarMonth compact={false} />
      </section>
    </main>
  );
}

const styles: Record<string, React.CSSProperties> = {
  main: { padding: 24 },
  header: {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "flex-end",
    gap: 12,
    marginBottom: 16
  },
  h1: {
    margin: 0,
    fontSize: 34,
    fontWeight: 900,
    letterSpacing: -0.4,
    color: "#0f172a"
  },
  sub: {
    margin: "6px 0 0 0",
    color: "rgba(15,23,42,0.6)",
    fontWeight: 700
  },
  card: { background: "transparent" }
};