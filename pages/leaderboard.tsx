import { useEffect, useState } from "react";
import { AppShell } from "@/components/layout/app-shell";

type LeaderboardUser = {
  id: string;
  username: string;
  points: number;
  league: string;
  level: number;
};

export default function LeaderboardPage() {
  const [users, setUsers] = useState<LeaderboardUser[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLeaderboard() {
      try {
        const res = await fetch("/api/leaderboard");
        if (res.ok) {
          const data = await res.json();
          setUsers(data);
        }
      } catch (err) {
        console.error("Failed to load leaderboard");
      } finally {
        setLoading(false);
      }
    }
    void fetchLeaderboard();
  }, []);

  const getMedalColor = (index: number) => {
    if (index === 0) return "linear-gradient(135deg, #f6c85f, #f09e43)"; // Gold
    if (index === 1) return "linear-gradient(135deg, #e2e8f0, #94a3b8)"; // Silver
    if (index === 2) return "linear-gradient(135deg, #d97706, #9a3412)"; // Bronze
    return "transparent";
  };

  return (
    <AppShell title="Leaderboard" subtitle="See how you stack up against the top players in Eternix.">
      <div className="content-grid" style={{ gridTemplateColumns: "1fr" }}>
        <section className="panel" style={{ padding: "0" }}>
          {loading ? (
            <div style={{ padding: "2rem", textAlign: "center" }} className="muted-copy">
              Loading rankings...
            </div>
          ) : users.length === 0 ? (
            <div style={{ padding: "2rem", textAlign: "center" }} className="muted-copy">
              No users found.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column" }}>
              {users.map((user, index) => {
                const isTop3 = index < 3;
                return (
                  <div 
                    key={user.id} 
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      padding: "1.25rem 2rem",
                      borderBottom: index !== users.length - 1 ? "1px solid var(--border)" : "none",
                      background: isTop3 ? "rgba(255,255,255,0.02)" : "transparent"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "1.5rem" }}>
                      <div 
                        style={{ 
                          width: "3rem", 
                          height: "3rem", 
                          borderRadius: "50%", 
                          display: "flex", 
                          alignItems: "center", 
                          justifyContent: "center",
                          background: getMedalColor(index),
                          border: isTop3 ? "none" : "1px solid var(--border)",
                          color: isTop3 ? "#000" : "var(--muted)",
                          fontWeight: "bold",
                          fontSize: "1.1rem"
                        }}
                      >
                        {index + 1}
                      </div>
                      
                      <div style={{ display: "flex", gap: "1rem", alignItems: "center" }}>
                        {/* Avatar placeholder */}
                        <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-soft)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--muted)" }}>
                          {user.username.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <strong style={{ fontSize: "1.1rem" }}>{user.username}</strong>
                          <div className="muted-copy" style={{ margin: 0, fontSize: "0.85rem", textTransform: "capitalize" }}>
                            {user.league} League • Lvl {user.level}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div style={{ textAlign: "right" }}>
                      <strong style={{ fontSize: "1.2rem", color: isTop3 ? "var(--text)" : "var(--muted)" }}>
                        {user.points.toLocaleString()}
                      </strong>
                      <div className="muted-copy" style={{ margin: 0, fontSize: "0.8rem" }}>PTS</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
