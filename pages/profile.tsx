import Link from "next/link";
import { useEffect } from "react";
import { useRouter } from "next/router";

import { AppShell } from "@/components/layout/app-shell";
import { ProfileCard } from "@/components/profile/profile-card";
import { useAuth } from "@/context/auth-context";

export default function ProfilePage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    if (!loading && !user) {
      void router.replace("/login");
    }
  }, [loading, router, user]);

  return (
    <AppShell
      title="Your Eternix identity"
      subtitle="Track your current league, points, streak, and linked Lichess profile from one place."
    >
      {loading || !profile ? (
        <div className="panel">
          <p className="muted-copy">Loading profile...</p>
        </div>
      ) : (
        <div className="content-grid">
          <ProfileCard profile={profile} />
          <section className="panel">
            <div className="section-heading">
              <div>
                <p className="muted-label">Trajectory</p>
                <h2>What the numbers mean</h2>
              </div>
            </div>

            <div className="task-list">
              <div className="task-item">
                <div className="task-indicator" />
                <div>
                  <strong>League</strong>
                  <p>Your current division on the Eternix ladder.</p>
                </div>
              </div>
              <div className="task-item">
                <div className="task-indicator" />
                <div>
                  <strong>Points</strong>
                  <p>Earn 10 points for every newly processed win.</p>
                </div>
              </div>
              <div className="task-item">
                <div className="task-indicator" />
                <div>
                  <strong>Streak</strong>
                  <p>Consecutive processed wins before a loss resets the counter.</p>
                </div>
              </div>
            </div>

            <Link href="/" className="primary-button link-button">
              Back to dashboard
            </Link>
          </section>
        </div>
      )}
    </AppShell>
  );
}
