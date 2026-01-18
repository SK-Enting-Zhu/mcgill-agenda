"use client";

export default function LoginPage() {
  const returnTo =
    typeof window !== "undefined"
      ? new URLSearchParams(window.location.search).get("returnTo") || "/main"
      : "/main";

  return (
    <div style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24 }}>
      <div style={{ padding: 20, border: "1px solid rgba(0,0,0,0.12)", borderRadius: 14 }}>
        <h1 style={{ margin: 0 }}>Login</h1>
        <p style={{ opacity: 0.7, marginTop: 8 }}>Sign in to access your agenda.</p>

        <a
          href={`/auth/login?returnTo=${encodeURIComponent(returnTo)}`}
          style={{
            display: "inline-block",
            marginTop: 10,
            padding: "10px 14px",
            borderRadius: 999,
            border: "1px solid rgba(0,0,0,0.15)",
            textDecoration: "none",
            fontWeight: 800,
          }}
        >
          Continue with Auth0
        </a>
      </div>
    </div>
  );
}