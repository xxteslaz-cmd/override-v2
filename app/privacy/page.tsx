export const metadata = { title: "Privacy Policy — Override" };

export default function PrivacyPage() {
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
        <h1 style={{ fontSize: 36, fontWeight: 800, letterSpacing: "-0.04em", marginBottom: 8, color: "#fff" }}>
          Privacy Policy
        </h1>
        <p style={{ fontSize: 13, color: "#475569", marginBottom: 40 }}>Last updated July 2026</p>

        {[
          {
            heading: "What we collect",
            body: "Override only uses the information you enter to generate a build recommendation — your budget, use case (e.g. Gaming, Video Editing), and any optional notes. This data is sent to the AI model to produce your result and is not stored on our servers.",
          },
          {
            heading: "What we don't collect",
            body: "We do not collect your name, email address, IP address, or any personal identifying information. We do not use cookies for tracking, and we do not run any third-party analytics scripts.",
          },
          {
            heading: "Affiliate links",
            body: "Links to Newegg and Amazon are standard search links. Override may earn a small commission if you purchase a product through these links, at no extra cost to you. This helps support the project.",
          },
          {
            heading: "Third-party services",
            body: "Build recommendations are generated using the Anthropic Claude API. The input you provide (budget, use case, notes) is sent to Anthropic's servers to produce a response. Please review Anthropic's privacy policy at anthropic.com/privacy for details on how they handle data.",
          },
          {
            heading: "Contact",
            body: "If you have questions about this policy, you can reach out via the GitHub repository linked in the footer.",
          },
        ].map(({ heading, body }) => (
          <div key={heading} style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: "#e2e8f0", marginBottom: 8, letterSpacing: "-0.02em" }}>
              {heading}
            </h2>
            <p style={{ fontSize: 15, lineHeight: 1.75, color: "#94a3b8", margin: 0 }}>{body}</p>
          </div>
        ))}
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
