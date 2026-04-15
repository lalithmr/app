import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";

import { useAuth } from "@/context/auth-context";

type AppShellProps = {
  title: string;
  subtitle: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();
  const { user, signOutUser } = useAuth();

  async function handleSignOut() {
    await signOutUser();
    await router.push("/login");
  }

  return (
    <div className="app-frame">
      <div className="ambient ambient-left" />
      <div className="ambient ambient-right" />
      <header className="topbar">
        <div>
          <Link href="/" className="brand-mark">
            Eternix
          </Link>
          <p className="brand-caption">Climb leagues through real chess momentum.</p>
        </div>
        <nav className="topbar-links">
          <Link href="/" className="nav-link">
            Dashboard
          </Link>
          <Link href="/profile" className="nav-link">
            Profile
          </Link>
          {user ? (
            <button type="button" className="ghost-button" onClick={handleSignOut}>
              Sign out
            </button>
          ) : (
            <Link href="/login" className="ghost-button link-button">
              Sign in
            </Link>
          )}
        </nav>
      </header>

      <main className="app-shell">
        <section className="hero-card">
          <span className="eyebrow">Chess progression reimagined</span>
          <h1>{title}</h1>
          <p>{subtitle}</p>
        </section>
        {children}
      </main>
    </div>
  );
}
