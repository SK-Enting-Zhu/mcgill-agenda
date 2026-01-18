import Link from "next/link";
import CalendarMonth from "../_components/CalendarMonth";
import SyllabusUpload from "../_components/SyllabusUpload";
import styles from "./main.module.css";

export default function MainPage() {
  return (
    <main className={styles.page}>
      {/* Top summary cards */}
      <section className={styles.kpiRow}>
        <div className={`${styles.kpi} softKpi`}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiTitle}>Pending Tasks</div>
            <Link className={`${styles.kpiLink} softBtn`} href="/todo">
              Open →
            </Link>
          </div>
          <div className={styles.kpiValue}>—</div>
          <div className={styles.kpiSub}>Connect data source</div>
        </div>

        <div className={`${styles.kpi} softKpi`}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiTitle}>Upcoming Exams</div>
            <Link className={`${styles.kpiLink} softBtn`} href="/calendar">
              Open →
            </Link>
          </div>
          <div className={styles.kpiValue}>—</div>
          <div className={styles.kpiSub}>Connect data source</div>
        </div>

        <div className={`${styles.kpi} softKpi`}>
          <div className={styles.kpiTop}>
            <div className={styles.kpiTitle}>Efficiency</div>
            <Link className={`${styles.kpiLink} softBtn`} href="/main">
              Open →
            </Link>
          </div>
          <div className={styles.kpiValue}>—</div>
          <div className={styles.kpiSub}>Connect data source</div>
        </div>
      </section>

      {/* Title row */}
      <section className={styles.headerRow}>
        <div>
          <h1 className={styles.h1}>Academic Schedule</h1>
          <p className={styles.sub}>
            Template view — content area changes, sidebar stays fixed
          </p>
        </div>

        <div className={styles.headerActions}>
          <Link className={`${styles.btn} softBtn`} href="/calendar">
            View Calendar
          </Link>
          <button className={`${styles.btn} ${styles.btnPrimary} softBtn primary`} type="button">
            + Add Item
          </button>
        </div>
      </section>

      {/* Empty state card */}
      <section className={`${styles.card} softCard`}>
        <h2 className={styles.h2}>No schedule items yet</h2>
        <p className={styles.p}>
          Once you connect Brightspace / Notion / Google Calendar, items will appear here.
        </p>
      </section>

      {/* Mini calendar card (this is what you asked for) */}
      <section className={`${styles.card} softCard`}>
        <div className={styles.cardTop}>
          <h2 className={styles.h2}>Mini Calendar</h2>
          <Link className={`${styles.smallLink} softBtn`} href="/calendar">
            Open full calendar →
          </Link>
        </div>

        {/* IMPORTANT: miniCalendar wrapper so only date blocks get hover/active */}
        <div className={`miniCalendar ${styles.miniWrap}`}>
          <CalendarMonth compact />
        </div>
      </section>

      <section>
        <SyllabusUpload />
      </section>

    </main>
  );
}