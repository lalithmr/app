import { useEffect } from "react";
import { useRouter } from "next/router";

import { LoginForm } from "@/components/auth/login-form";
import { AppShell } from "@/components/layout/app-shell";
import { useAuth } from "@/context/auth-context";

export default function LoginPage() {
  const router = useRouter();
  const { user, loading } = useAuth();

  useEffect(() => {
    if (!loading && user) {
      void router.replace("/");
    }
  }, [loading, router, user]);

  return (
    <AppShell
      title="Enter the Eternix ladder"
      subtitle="Connect your account, link Lichess, and turn every real match into progression."
    >
      <div className="single-column">
        <LoginForm />
      </div>
    </AppShell>
  );
}
