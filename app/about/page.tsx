export const metadata = { title: "About — Override" };

export default function AboutPage() {
  return (
    <main style={{ minHeight: "100vh", background: "#04050a", color: "#e2e8f0",
      fontFamily: "var(--font-geist-sans), 'Inter', system-ui, sans-serif",
      display: "flex", flexDirection: "column" }}>

      <nav style={{ borderBottom: "1px solid rgba(255,255,255,0.08)", padding: "0 32px",
        height: 50, display: "flex", alignItems: "center", gap: 10 }}>
        <a href="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
          <img src="/android-chrome-192x192.png" alt="Override" style={{ width: 24, height: 24, borderRadius: 5 }} />
          <span style={{ fontSize: 14, fontWeight: 600, color: "#e2e8f0" }}>Override</span>
        </a>
      </nav>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "64px 32px 80px" }}>
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 16, color: "#fff" }}>
          About Override
        </h1>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "#94a3b8", marginBottom: 20 }}>
          Override is a PC build advisor built by a solo indie developer. The idea is simple:
          tell it your budget and what you'll use the PC for, and it recommends a full set of compatible
          parts — with a clear reason for every choice.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "#94a3b8", marginBottom: 20 }}>
          Every build is checked for hardware compatibility — CPU socket, motherboard chipset, case clearance,
          PSU headroom — before it's shown to you. No more worrying about whether parts will work together.
        </p>
        <p style={{ fontSize: 16, lineHeight: 1.75, color: "#94a3b8" }}>
          Override is a side project built because PC building felt unnecessarily intimidating. The goal is
          to make it approachable for everyone — whether you're buying your first GPU or upgrading a workstation.
        </p>
      </div>

      <footer style={{ marginTop: "auto", borderTop: "1px solid rgba(255,255,255,0.06)",
        padding: "20px 32px", display: "flex", gap: 20, justifyContent: "center" }}>
        <a href="/about" style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>About</a>
        <a href="/privacy" style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>Privacy</a>
        <a href="/" style={{ fontSize: 12, color: "#64748b", textDecoration: "none" }}>← Back to Override</a>
      </footer>
    </main>
  );
}
