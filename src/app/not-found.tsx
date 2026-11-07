import Link from "next/link";

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        flexDirection: "column",
        textAlign: "center",
        padding: "2rem",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div style={{ fontSize: "5rem", marginBottom: "1rem" }}>🔍</div>
      <h1
        style={{
          fontSize: "6rem",
          fontWeight: 800,
          margin: 0,
          lineHeight: 1,
          background: "linear-gradient(135deg, #4f46e5, #7c3aed)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
        }}
      >
        404
      </h1>
      <h2 style={{ marginTop: "0.5rem", fontWeight: 700 }}>Page Not Found</h2>
      <p style={{ color: "#64748b", maxWidth: 400, marginBottom: "2rem" }}>
        The page you are looking for does not exist or has been moved.
      </p>
      <Link
        href="/"
        style={{
          background: "#4f46e5",
          color: "white",
          padding: "0.75rem 2rem",
          borderRadius: "0.5rem",
          textDecoration: "none",
          fontWeight: 600,
        }}
      >
        Return to Store
      </Link>
    </div>
  );
}
