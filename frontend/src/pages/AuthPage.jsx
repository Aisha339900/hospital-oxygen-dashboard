import React, { useEffect, useMemo, useState } from "react";
import { FiArrowRight, FiLock, FiMail, FiUser } from "react-icons/fi";
import { authService } from "../services";

const emailLooksValid = (value) => {
  if (!value) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
};

function formatAuthError(err) {
  if (typeof err === "string") return err;
  if (err?.message) return err.message;
  return "Something went wrong. Please try again.";
}

export default function AuthPage({
  variant = "page", // "page" | "modal"
  isDarkMode,
  onToggleTheme,
  onAuthSuccess,
}) {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot" | "reset"
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [resetToken, setResetToken] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [info, setInfo] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get("reset");
    if (t && t.trim()) {
      setResetToken(t.trim());
      setMode("reset");
      setError(null);
      setInfo(null);
      window.history.replaceState(
        {},
        "",
        `${window.location.pathname}${window.location.hash}`,
      );
    }
  }, []);

  const title = useMemo(() => {
    if (mode === "login") return "Welcome back";
    if (mode === "signup") return "Create your account";
    if (mode === "forgot") return "Reset your password";
    return "Choose a new password";
  }, [mode]);

  const subtitle = useMemo(() => {
    if (mode === "login") {
      return "Sign in to continue monitoring your oxygen system.";
    }
    if (mode === "signup") {
      return "Join the dashboard to monitor oxygen system performance.";
    }
    if (mode === "forgot") {
      return "Enter your email and we will send you a link to reset your password.";
    }
    return "Enter and confirm your new password below.";
  }, [mode]);

  const primaryLabel = useMemo(() => {
    if (mode === "login") return "Sign in";
    if (mode === "signup") return "Create account";
    if (mode === "forgot") return "Send reset link";
    return "Update password";
  }, [mode]);

  const canSubmit = useMemo(() => {
    if (mode === "forgot") {
      return emailLooksValid(email.trim());
    }
    if (mode === "reset") {
      if (!resetToken) return false;
      if (!password || password.length < 6) return false;
      return password === passwordConfirm;
    }
    if (!emailLooksValid(email)) return false;
    if (!password || password.length < 6) return false;
    if (mode === "signup" && !name.trim()) return false;
    return true;
  }, [email, password, passwordConfirm, mode, name, resetToken]);

  const goLogin = () => {
    setMode("login");
    setError(null);
    setInfo(null);
    setPassword("");
    setPasswordConfirm("");
  };

  const goSignup = () => {
    setMode("signup");
    setError(null);
    setInfo(null);
    setPassword("");
    setPasswordConfirm("");
  };


  const submit = async (event) => {
    event.preventDefault();
    setError(null);
    setInfo(null);

    if (mode === "forgot") {
      if (!emailLooksValid(email.trim())) {
        setError("Please enter a valid email address.");
        return;
      }
      try {
        setBusy(true);
        const data = await authService.resetPassword(email.trim().toLowerCase());
        const base =
          data?.message || "Check your email for reset instructions.";
        const full = data?.debugResetLink
          ? `${base} (Development: open this link: ${data.debugResetLink})`
          : base;
        setInfo(full);
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (mode === "reset") {
      if (!resetToken) {
        setError("Missing reset token. Open the link from your email again.");
        return;
      }
      if (!password || password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
      if (password !== passwordConfirm) {
        setError("Passwords do not match.");
        return;
      }
      try {
        setBusy(true);
        const data = await authService.confirmPasswordReset(resetToken, password);
        setInfo(data?.message || "Password updated. You can sign in now.");
        setPassword("");
        setPasswordConfirm("");
        setResetToken(null);
        setMode("login");
      } catch (err) {
        setError(formatAuthError(err));
      } finally {
        setBusy(false);
      }
      return;
    }

    if (!canSubmit) {
      setError("Please complete the form to continue.");
      return;
    }
    try {
      setBusy(true);
      const normalizedEmail = email.trim().toLowerCase();
      let data;
      if (mode === "signup") {
        data = await authService.register({
          name: name.trim(),
          email: normalizedEmail,
          password,
        });
      } else {
        data = await authService.login(normalizedEmail, password);
      }
      if (!data?.user) {
        setError("Unexpected response from server.");
        return;
      }
      onAuthSuccess?.({
        email: data.user.email,
        name: data.user.name ?? null,
        role: data.user.role ?? null,
      });
    } catch (err) {
      setError(formatAuthError(err));
    } finally {
      setBusy(false);
    }
  };

  const body = (
    <div className={variant === "modal" ? "auth-modal" : "auth-shell"}>
      <div className="auth-topbar">
        <div className="auth-brand">
          <div className="logo-mark" aria-hidden="true">
            O2
          </div>
          <div>
            <div className="auth-brand-title">Hospital Oxygen Dashboard</div>
            <div className="brand-sub">Secure access</div>
          </div>
        </div>
        <button
          type="button"
          className="auth-theme-toggle"
          onClick={onToggleTheme}
          aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
        >
          {isDarkMode ? "Light mode" : "Dark mode"}
        </button>
      </div>

      <div className={variant === "modal" ? "auth-grid auth-grid--modal" : "auth-grid"}>
        <section className="auth-card">
          <div className="auth-card-header">
            <h2 className="auth-card-headline">{title}</h2>
            <p className="auth-card-desc">{subtitle}</p>
          </div>

          <form className="auth-form" onSubmit={submit}>
            {mode === "signup" ? (
              <label className="auth-field">
                <span className="auth-label">
                  <FiUser aria-hidden="true" /> Name
                </span>
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  disabled={busy}
                />
              </label>
            ) : null}

            {mode === "reset" ? null : (
              <label className="auth-field">
                <span className="auth-label">
                  <FiMail aria-hidden="true" /> Email
                </span>
                <input
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@company.com"
                  autoComplete="email"
                  inputMode="email"
                  disabled={busy}
                />
              </label>
            )}

            {mode === "forgot" ? null : (
              <>
                <label className="auth-field">
                  <span className="auth-label">
                    <FiLock aria-hidden="true" /> Password
                  </span>
                  <input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="At least 6 characters"
                    type="password"
                    autoComplete={
                      mode === "login" ? "current-password" : "new-password"
                    }
                    disabled={busy}
                  />
                </label>
                {mode === "reset" ? (
                  <label className="auth-field">
                    <span className="auth-label">
                      <FiLock aria-hidden="true" /> Confirm password
                    </span>
                    <input
                      value={passwordConfirm}
                      onChange={(e) => setPasswordConfirm(e.target.value)}
                      placeholder="Repeat password"
                      type="password"
                      autoComplete="new-password"
                      disabled={busy}
                    />
                  </label>
                ) : null}
              </>
            )}

            <button
              type="submit"
              className="auth-submit"
              disabled={!canSubmit || busy}
            >
              {busy ? "Working…" : primaryLabel}
              <FiArrowRight aria-hidden="true" />
            </button>

            {error ? <div className="auth-error">{error}</div> : null}
            {info ? <div className="auth-info">{info}</div> : null}

            {mode === "login" ? (
              <div className="auth-footnote">
                Don&apos;t have an account?{" "}
                <button
                  type="button"
                  className="auth-link auth-link--inline"
                  onClick={goSignup}
                  disabled={busy}
                >
                  Sign up
                </button>
              </div>
            ) : null}

            {mode === "signup" ? (
              <div className="auth-footnote">
                Already have an account?{" "}
                <button
                  type="button"
                  className="auth-link auth-link--inline"
                  onClick={goLogin}
                  disabled={busy}
                >
                  Sign in
                </button>
              </div>
            ) : null}

            {mode === "forgot" ? (
              <div className="auth-footnote">
                <button
                  type="button"
                  className="auth-link auth-link--inline"
                  onClick={goLogin}
                  disabled={busy}
                >
                  Back to sign in
                </button>
              </div>
            ) : null}

            {mode === "reset" ? (
              <div className="auth-footnote">
                <button
                  type="button"
                  className="auth-link auth-link--inline"
                  onClick={goLogin}
                  disabled={busy}
                >
                  Back to sign in
                </button>
              </div>
            ) : null}
          </form>
        </section>
      </div>
    </div>
  );

  if (variant === "modal") {
    return (
      <div className="auth-overlay" role="dialog" aria-modal="true">
        <div className="auth-overlay__backdrop" />
        <div className="auth-overlay__content">{body}</div>
      </div>
    );
  }

  return body;
}
