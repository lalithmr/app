import Link from "next/link";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";

export default function HomePage() {
  const { profile } = useAuth();

  return (
    <AppShell title={`Welcome back, ${profile?.username || "Player"}`} subtitle="Your Eternix dashboard. Select a game mode to start earning points.">
      <div className="content-grid">
        <section className="panel" style={{ cursor: "pointer", display: "flex", flexDirection: "column", gap: "1rem" }} onClick={() => window.location.href = "/puzzle"}>
          <div style={{ padding: "0.5rem", borderRadius: "12px", background: "rgba(246, 200, 95, 0.1)", width: "fit-content", color: "var(--gold)" }}>
             <span>🧩 Puzzle Mode</span>
          </div>
          <h2>Tactics relay</h2>
          <p className="muted-copy">Solve sequence of dynamic puzzles fetched directly from the Lichess API to test your calculation limits.</p>
          <div style={{ marginTop: "auto" }}>
            <Link href="/puzzle" className="primary-button link-button">
              Play Puzzles
            </Link>
          </div>
        </section>
        
        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: "12px", background: "rgba(86, 210, 210, 0.1)", width: "fit-content", color: "var(--teal)" }}>
             <span>🎮 Live Game</span>
          </div>
          <h2>Play a Match</h2>
          <p className="muted-copy">Enter the arena against live opponents. Improve your real ELO rating and climb the Eternix Leagues organically.</p>
          <div style={{ marginTop: "auto" }}>
            <Link href="/game" className="secondary-button link-button">
              Coming Soon
            </Link>
          </div>
        </section>
      </div>
      
      <div className="content-grid" style={{ marginTop: "1.5rem" }}>
        <section className="panel" style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: "12px", background: "rgba(116, 226, 157, 0.1)", width: "fit-content", color: "var(--success)" }}>
             <span>🌍 Territory Map</span>
          </div>
          <h2>World Map</h2>
          <p className="muted-copy">Claim your domain in the real-time node map. Challenge nodes, conquer land.</p>
          <div style={{ marginTop: "auto" }}>
            <Link href="/map" className="ghost-button link-button">
              View Map
            </Link>
          </div>
        </section>

        <section className="panel auth-card" style={{ width: "100%", display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div style={{ padding: "0.5rem", borderRadius: "12px", background: "rgba(255, 135, 135, 0.1)", width: "fit-content", color: "var(--danger)" }}>
             <span>🏆 Leaderboard</span>
          </div>
          <h2>Hall of Fame</h2>
          <p className="muted-copy">See how you measure up against the top-ranked Eternix grandmasters globally.</p>
          <div style={{ marginTop: "auto" }}>
            <Link href="/leaderboard" className="ghost-button link-button">
              Rankings
            </Link>
          </div>
        </section>
      </div>
    </AppShell>
  );
}
