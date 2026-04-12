import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  FiAlertCircle,
  FiCheckCircle,
  FiChevronDown,
  FiDownload,
  FiFileText,
  FiMail,
  FiSend,
} from "react-icons/fi";
import {
  downloadDashboardPdf,
  emailDashboardPdf,
  getDashboardEmailStatus,
} from "../../services/reportService";

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function triggerBlobDownload(blob, filename) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.rel = "noopener";
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

const DEFAULT_EMAIL_STATUS = {
  configured: false,
  available: false,
  message: "Checking email delivery status...",
};

export default function DashboardReportActions({
  buildSnapshot,
  defaultEmail = "",
  canUseEmail,
}) {
  const rootRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [emailTo, setEmailTo] = useState(defaultEmail || "");
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState(null);
  const [emailStatus, setEmailStatus] = useState(DEFAULT_EMAIL_STATUS);
  const [emailStatusLoading, setEmailStatusLoading] = useState(false);

  useEffect(() => {
    if (defaultEmail) {
      setEmailTo((prev) => prev || defaultEmail);
    }
  }, [defaultEmail]);

  useEffect(() => {
    if (!open) {
      return undefined;
    }
    const onDoc = (e) => {
      if (rootRef.current && !rootRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [open]);

  useEffect(
    () => () => {
      if (toastTimerRef.current) {
        window.clearTimeout(toastTimerRef.current);
      }
    },
    [],
  );

  const showNotice = useCallback((text, isError) => {
    setNotice({ text, isError: Boolean(isError) });
    if (toastTimerRef.current) {
      window.clearTimeout(toastTimerRef.current);
    }
    toastTimerRef.current = window.setTimeout(() => setNotice(null), 5000);
  }, []);

  const refreshEmailStatus = useCallback(async () => {
    setEmailStatusLoading(true);
    try {
      const data = await getDashboardEmailStatus();
      setEmailStatus({
        configured: Boolean(data?.configured),
        available: Boolean(data?.available),
        message: data?.message || "Email status unavailable.",
      });
    } catch (error) {
      setEmailStatus({
        configured: false,
        available: false,
        message: error?.message || "Unable to verify email delivery.",
      });
    } finally {
      setEmailStatusLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      refreshEmailStatus();
    }
  }, [open, refreshEmailStatus]);

  const normalizedEmail = emailTo.trim().toLowerCase();
  const hasEmailValue = normalizedEmail.length > 0;
  const emailLooksValid = !hasEmailValue || EMAIL_RE.test(normalizedEmail);

  const emailBlockedReason = useMemo(() => {
    if (!canUseEmail) return "Sign in to email the report.";
    if (emailStatusLoading) return "Checking email delivery...";
    if (!emailStatus.available) return emailStatus.message;
    if (hasEmailValue && !emailLooksValid) return "Enter a valid recipient email address.";
    return "";
  }, [canUseEmail, emailLooksValid, emailStatus.available, emailStatus.message, emailStatusLoading, hasEmailValue]);

  const canSendEmail = canUseEmail && !emailStatusLoading && emailStatus.available && emailLooksValid;
  const busy = Boolean(busyAction);

  const handleDownload = async () => {
    setBusyAction("download");
    setNotice(null);
    try {
      const snapshot = buildSnapshot();
      const blob = await downloadDashboardPdf(snapshot);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      triggerBlobDownload(blob, `oxygen-dashboard-report-${stamp}.pdf`);
      showNotice("PDF report downloaded.", false);
    } catch (e) {
      showNotice(e?.message || "Download failed.", true);
    } finally {
      setBusyAction("");
    }
  };

  const handleSendEmail = async () => {
    if (!canSendEmail) {
      showNotice(emailBlockedReason || "Email delivery is unavailable.", true);
      return;
    }

    setBusyAction("email");
    setNotice(null);
    try {
      const snapshot = buildSnapshot();
      const response = await emailDashboardPdf(snapshot, normalizedEmail);
      showNotice(response?.message || "Report emailed successfully.", false);
    } catch (e) {
      showNotice(e?.message || "Email failed.", true);
      refreshEmailStatus();
    } finally {
      setBusyAction("");
    }
  };

  return (
    <div className="report-actions" ref={rootRef}>
      <button
        type="button"
        className={`report-actions__toggle ${open ? "is-open" : ""}`}
        aria-expanded={open}
        aria-haspopup="dialog"
        disabled={busy}
        onClick={() => setOpen((v) => !v)}
      >
        <span className="report-actions__toggle-copy">
          <span className="report-actions__toggle-label">Export report</span>
        </span>
        <FiChevronDown aria-hidden className="report-actions__chev" />
      </button>

      {open ? (
        <section className="report-actions__panel" aria-label="Export report options">
          <div className="report-actions__hero">
            <div className="report-actions__hero-icon">
              <FiFileText aria-hidden />
            </div>
            <div className="report-actions__hero-copy">
              <p className="report-actions__eyebrow">Shift-ready export</p>
              <h3>Share a clean monitoring snapshot</h3>
              <p>
                Generate a polished PDF of the current dashboard or send it directly by email.
              </p>
            </div>
          </div>

          <div className="report-actions__grid">
            <div className="report-actions__card">
              <div className="report-actions__card-head">
                <span className="report-actions__card-icon report-actions__card-icon--download">
                  <FiDownload aria-hidden />
                </span>
                <div>
                  <h4>Download PDF</h4>
                  <p>Save a report for handoff notes, audits, or local archives.</p>
                </div>
              </div>
              <button
                type="button"
                className="report-actions__primary"
                disabled={busy}
                onClick={handleDownload}
              >
                {busyAction === "download" ? "Preparing report..." : "Download report"}
              </button>
            </div>

            <div className="report-actions__card">
              <div className="report-actions__card-head">
                <span className="report-actions__card-icon report-actions__card-icon--email">
                  <FiMail aria-hidden />
                </span>
                <div>
                  <h4>Email PDF</h4>
                  <p>Deliver the current report to a recipient without leaving the dashboard.</p>
                </div>
              </div>

              <div
                className={`report-actions__status ${emailStatus.available ? "is-ready" : "is-offline"}`}
                role="status"
              >
                {emailStatus.available ? <FiCheckCircle aria-hidden /> : <FiAlertCircle aria-hidden />}
                <span>{emailStatusLoading ? "Checking email service..." : emailStatus.message}</span>
              </div>

              <label className="report-actions__label" htmlFor="report-email-to">
                Recipient email
              </label>
              <input
                id="report-email-to"
                type="email"
                className={`report-actions__input ${hasEmailValue && !emailLooksValid ? "is-invalid" : ""}`}
                placeholder={defaultEmail || "you@hospital.org"}
                value={emailTo}
                onChange={(e) => setEmailTo(e.target.value)}
                autoComplete="email"
              />
              <p className="report-actions__helper">
                Leave blank to use the signed-in account email when available.
              </p>
              {emailBlockedReason ? (
                <p className="report-actions__helper report-actions__helper--warning">
                  {emailBlockedReason}
                </p>
              ) : null}

              <div className="report-actions__email-row">
                <button
                  type="button"
                  className="report-actions__primary"
                  disabled={busy || !canSendEmail}
                  onClick={handleSendEmail}
                >
                  <FiSend aria-hidden />
                  <span>{busyAction === "email" ? "Sending..." : "Send by email"}</span>
                </button>
                <button
                  type="button"
                  className="report-actions__secondary"
                  disabled={busy || emailStatusLoading}
                  onClick={refreshEmailStatus}
                >
                  Refresh status
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : null}

      {notice ? (
        <div
          className={`report-actions__toast ${notice.isError ? "report-actions__toast--error" : ""}`}
          role="status"
        >
          {notice.text}
        </div>
      ) : null}
    </div>
  );
}
