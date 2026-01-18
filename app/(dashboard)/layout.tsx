"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useUser } from "@auth0/nextjs-auth0";

const NAV = [
  { href: "/main", label: "Main Menu" },
  { href: "/calendar", label: "Full Calendar" },
  { href: "/todo", label: "Todo list" },
  { href: "/notifications", label: "Notifications" },
  { href: "/settings", label: "Settings" },
] as const;

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname() ?? "/";
  const { user, isLoading } = useUser();

  return (
    <div style={styles.shell}>
      <aside style={styles.sidebar}>
        <div style={styles.brandRow}>
          <div style={styles.logo} aria-hidden>
            <span style={styles.logoEmoji}>🎓</span>
          </div>
          <div>
            <div style={styles.appName}>SyllaBuddy</div>
            <div style={styles.appSub}>Dashboard</div>
          </div>
        </div>

        <div style={styles.authRow}>
          {!isLoading && user?.name ? (
            <div style={styles.userHint}>Signed in as {user.name}</div>
          ) : (
            <div style={styles.userHint}>Not signed in</div>
          )}

          {user ? (
            <a href="/auth/logout?returnTo=/main" style={styles.authBtn}>
              Logout
            </a>
          ) : (
            <a href="/auth/login?returnTo=/main" style={styles.authBtn}>
              Login
            </a>
          )}
        </div>

        <div style={styles.sectionLabel}>MAIN MENU</div>

        <nav style={styles.nav} aria-label="Sidebar navigation">
          {NAV.map((item) => {
            const active = pathname === item.href || pathname.startsWith(item.href + "/");
            return (
              <Link
                key={item.href}
                href={item.href}
                style={{
                  ...styles.navItem,
                  ...(active ? styles.navItemActive : null),
                }}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* ✅ Mini calendar REMOVED from sidebar */}
      </aside>

      <main style={styles.main}>
        <div style={styles.content}>{children}</div>
      </main>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  shell: {
    minHeight: "100vh",
    display: "grid",
    gridTemplateColumns: "320px 1fr",
    background: "#ffffff",
  },
  sidebar: {
    position: "sticky",
    top: 0,
    alignSelf: "start",
    height: "100vh",
    padding: "26px 18px 22px",
    borderRight: "1px solid rgba(15,23,42,0.10)",
    background: "rgba(15,23,42,0.02)",
    overflowY: "auto",
  },
  brandRow: {
    display: "flex",
    alignItems: "center",
    gap: 14,
    marginBottom: 10,
  },
  logo: {
    width: 54,
    height: 54,
    borderRadius: 18,
    background: "rgba(124, 58, 237, 0.10)",
    display: "grid",
    placeItems: "center",
    flex: "0 0 auto",
  },
  logoEmoji: {
    fontSize: 22,
  },
  appName: {
    fontSize: 28,
    fontWeight: 900,
    letterSpacing: "-0.03em",
    color: "rgba(15,23,42,0.95)",
    lineHeight: 1.1,
  },
  appSub: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(15,23,42,0.55)",
    marginTop: 2,
  },
  authRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 10,
    margin: "10px 0 6px",
  },
  userHint: {
    fontSize: 12,
    fontWeight: 800,
    color: "rgba(15,23,42,0.55)",
    maxWidth: 180,
    overflow: "hidden",
    textOverflow: "ellipsis",
    whiteSpace: "nowrap",
  },
  authBtn: {
    textDecoration: "none",
    fontSize: 13,
    fontWeight: 900,
    padding: "9px 12px",
    borderRadius: 999,
    border: "1px solid rgba(15,23,42,0.12)",
    background: "rgba(15,23,42,0.04)",
    color: "rgba(15,23,42,0.92)",
    whiteSpace: "nowrap",
  },
  sectionLabel: {
    fontSize: 12,
    letterSpacing: "0.22em",
    fontWeight: 900,
    color: "rgba(15,23,42,0.45)",
    margin: "16px 0 10px",
  },
  nav: {
    display: "flex",
    flexDirection: "column",
    gap: 10,
  },
  navItem: {
    textDecoration: "none",
    background: "rgba(255,255,255,0.9)",
    border: "1px solid rgba(15,23,42,0.08)",
    borderRadius: 18,
    padding: "14px 14px",
    fontSize: 18,
    fontWeight: 900,
    color: "rgba(15,23,42,0.92)",
  },
  navItemActive: {
    background: "rgba(15,23,42,0.06)",
    border: "1px solid rgba(15,23,42,0.16)",
  },
  main: {
    padding: "26px 26px 50px",
  },
  content: {
    maxWidth: 1200,
  },
};