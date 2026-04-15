import { useState } from "react";

import { useAuth } from "@/context/auth-context";

type AuthMode = "signin" | "signup";

export function LoginForm() {
  const { signInWithEmail, signInWithGoogle, signUpWithEmail } = useAuth();
  const [mode, setMode] = useState<AuthMode>("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      if (mode === "signup") {
        if (!username.trim()) {
          throw new Error("Choose a username to create your Eternix account.");
        }

        await signUpWithEmail(email, password, username.trim());
      } else {
        await signInWithEmail(email, password);
      }
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : "Authentication failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogleSignIn() {
    setSubmitting(true);
    setError("");

    try {
      await signInWithGoogle();
    } catch (signInError) {
      setError(
        signInError instanceof Error ? signInError.message : "Google sign-in failed."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="auth-card">
      <div className="pill-row">
        <button
          type="button"
          className={`pill-button ${mode === "signin" ? "active" : ""}`}
          onClick={() => setMode("signin")}
        >
          Sign in
        </button>
        <button
          type="button"
          className={`pill-button ${mode === "signup" ? "active" : ""}`}
          onClick={() => setMode("signup")}
        >
          Create account
        </button>
      </div>

      <form className="auth-form" onSubmit={handleSubmit}>
        {mode === "signup" ? (
          <label className="field">
            <span>Username</span>
            <input
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              placeholder="Eternix handle"
              autoComplete="nickname"
            />
          </label>
        ) : null}

        <label className="field">
          <span>Email</span>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
          />
        </label>

        <label className="field">
          <span>Password</span>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="At least 6 characters"
            autoComplete={mode === "signup" ? "new-password" : "current-password"}
          />
        </label>

        {error ? <p className="inline-error">{error}</p> : null}

        <button type="submit" className="primary-button" disabled={submitting}>
          {submitting
            ? "Loading..."
            : mode === "signup"
              ? "Create Eternix account"
              : "Continue to dashboard"}
        </button>
      </form>

      <div className="divider">
        <span>or</span>
      </div>

      <button type="button" className="secondary-button" onClick={handleGoogleSignIn}>
        Continue with Google
      </button>
    </div>
  );
}
