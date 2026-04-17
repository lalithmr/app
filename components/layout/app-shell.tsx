import Link from "next/link";
import { useRouter } from "next/router";
import type { ReactNode } from "react";
import { Home, Gamepad2, Puzzle, Map as MapIcon, Trophy, User } from "lucide-react";

import { useAuth } from "@/context/auth-context";

type AppShellProps = {
  title?: string;
  subtitle?: string;
  children: ReactNode;
};

export function AppShell({ title, subtitle, children }: AppShellProps) {
  const router = useRouter();
  const { user, signOutUser } = useAuth();
  
  const currentPath = router.pathname;

  async function handleSignOut() {
    await signOutUser();
    await router.push("/login");
  }

  const navLinks = [
    { href: "/home", label: "Home", icon: <Home size={20} /> },
    { href: "/game", label: "Game", icon: <Gamepad2 size={20} /> },
    { href: "/puzzle", label: "Puzzle", icon: <Puzzle size={20} /> },
    { href: "/map", label: "Map", icon: <MapIcon size={20} /> },
    { href: "/leaderboard", label: "Leaderboard", icon: <Trophy size={20} /> },
    { href: "/profile", label: "Profile", icon: <User size={20} /> },
  ];

  return (
    <div className="app-frame">
      <aside className="sidebar">
        <div>
          <Link href="/home" className="brand-mark">
            Eternix
          </Link>
          <p className="brand-caption" style={{ fontSize: "0.85rem", marginTop: "0.5rem" }}>
            Climb leagues through real chess momentum.
          </p>
        </div>

        <nav className="sidebar-nav">
          {navLinks.map((link) => {
            const isActive = currentPath.startsWith(link.href) || 
              (currentPath === "/" && link.href === "/home");
            
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`sidebar-link ${isActive ? "active" : ""}`}
              >
                {link.icon}
                <span>{link.label}</span>
              </Link>
            );
          })}
        </nav>

        <div style={{ marginTop: "auto", display: "flex", flexDirection: "column", gap: "0.8rem" }}>
          {user ? (
            <button type="button" className="ghost-button" onClick={handleSignOut} style={{ width: "100%" }}>
              Sign out
            </button>
          ) : (
            <Link href="/login" className="ghost-button link-button" style={{ width: "100%", textAlign: "center" }}>
              Sign in
            </Link>
          )}
        </div>
      </aside>

      <main className="main-content">
        <div className="ambient ambient-left" />
        <div className="ambient ambient-right" />
        
        <div className="app-shell" style={{ paddingTop: "3rem" }}>
          {title && subtitle && (
             <section className="hero-card">
               <span className="eyebrow">Chess progression reimagined</span>
               <h1>{title}</h1>
               <p>{subtitle}</p>
             </section>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
