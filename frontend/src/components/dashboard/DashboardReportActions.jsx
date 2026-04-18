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
import { DEFAULT_DASHBOARD_REPORT_OPTIONS } from "../../utils/dashboardReportSnapshot";

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
  message: "Checking email…",
};

export default function DashboardReportActions({
  buildSnapshot,
  userEmail = "",
  canUseEmail = false,
}) {
  const rootRef = useRef(null);
  const toastTimerRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [busyAction, setBusyAction] = useState("");
  const [notice, setNotice] = useState(null);
  const [emailStatus, setEmailStatus] = useState(DEFAULT_EMAIL_STATUS);
  const [emailStatusLoading, setEmailStatusLoading] = useState(false);
  const [reportOptions, setReportOptions] = useState(() => ({
    ...DEFAULT_DASHBOARD_REPORT_OPTIONS,
  }));

  useEffect(() => {
    if (!open) {
      setNotice(null);
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

  const showNotice = useCallback((text, isError, anchor = "email") => {
    setNotice({
      text,
      isError: Boolean(isError),
      anchor: anchor === "download" ? "download" : "email",
    });
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

  const emailBlockedReason = useMemo(() => {
    if (!canUseEmail) {
      return "Sign in to email the report.";
    }
    const trimmed = String(userEmail || "").trim();
    if (!trimmed) {
      return "Your account has no email on file.";
    }
    if (emailStatusLoading) {
      return "Checking email service…";
    }
    if (!emailStatus.available) {
      return emailStatus.message;
    }
    return "";
  }, [
    canUseEmail,
    userEmail,
    emailStatusLoading,
    emailStatus.available,
    emailStatus.message,
  ]);

  const canSendEmail =
    canUseEmail &&
    String(userEmail || "").trim().length > 0 &&
    !emailStatusLoading &&
    emailStatus.available;

  const busy = Boolean(busyAction);

  const toggleReportOption = (key) => {
    setReportOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleDownload = async () => {
    setBusyAction("download");
    setNotice(null);
    try {
      const snapshot = buildSnapshot(reportOptions);
      const blob = await downloadDashboardPdf(snapshot);
      const stamp = new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-");
      triggerBlobDownload(blob, `oxygen-dashboard-report-${stamp}.pdf`);
      showNotice("PDF downloaded.", false, "download");
    } catch (e) {
      showNotice(e?.message || "Download failed.", true, "download");
    } finally {
      setBusyAction("");
    }
  };

  const handleSendEmail = async () => {
    if (!canSendEmail) {
      showNotice(emailBlockedReason || "Email is not available.", true);
      return;
    }
    setBusyAction("email");
    setNotice(null);
    try {
      const snapshot = buildSnapshot(reportOptions);
      const response = await emailDashboardPdf(snapshot);
      showNotice(
        response?.message || "Report emailed to your account.",
        false,
        "email",
      );
    } catch (e) {
      showNotice(e?.message || "Email failed.", true, "email");
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
        <section className="report-actions__panel" aria-label="Export report">
          <div className="report-actions__hero report-actions__hero--compact">
            <div className="report-actions__hero-icon report-actions__hero-icon--compact">
              <FiFileText aria-hidden />
            </div>
            <div className="report-actions__hero-copy">
              <p className="report-actions__eyebrow">Dashboard report</p>
              <h3>Export PDF</h3>
              <p>Choose sections, then download or email to your account.</p>
            </div>
          </div>

          <fieldset className="report-actions__customize">
            <legend className="report-actions__customize-legend">Report sections</legend>
            <p className="report-actions__customize-hint">
              Uncheck anything you do not need in the PDF.
            </p>
            <div className="report-actions__customize-grid">
              {[
                ["includeOverview", "Operational summary"],
                ["includeKpis", "KPI cards"],
                ["includeStreams", "All streams"],
                ["includeSupplyDemand", "Demand & supply"],
                ["includeTrendSample", "Trend sample table"],
                ["includeAlarms", "Alarms list"],
              ].map(([key, label]) => (
                <label key={key} className="report-actions__check">
                  <input
                    type="checkbox"
                    checked={Boolean(reportOptions[key])}
                    onChange={() => toggleReportOption(key)}
                  />
                  <span>{label}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="report-actions__actions-stack">
            <button
              type="button"
              className="report-actions__primary report-actions__primary--full"
              disabled={busy}
              onClick={handleDownload}
            >
              <FiDownload aria-hidden />
              <span>{busyAction === "download" ? "Preparing…" : "Download PDF"}</span>
            </button>
            {notice && notice.anchor === "download" ? (
              <div
                className={`report-actions__toast report-actions__toast--inline ${notice.isError ? "report-actions__toast--error" : ""}`}
                role="status"
              >
                {notice.text}
              </div>
            ) : null}

            <div className="report-actions__email-block">
              {canUseEmail && String(userEmail || "").trim() ? (
                <p className="report-actions__email-to">
                  <FiMail aria-hidden />
                  <span>
                    Report will be sent to your email: <strong>{String(userEmail).trim()}</strong>
                  </span>
                </p>
              ) : null}
              <button
                type="button"
                className="report-actions__secondary report-actions__secondary--full"
                disabled={busy || !canSendEmail}
                onClick={handleSendEmail}
              >
                <FiSend aria-hidden />
                <span>{busyAction === "email" ? "Sending…" : "Email report"}</span>
              </button>
              <div
                className={`report-actions__status ${emailStatus.available ? "is-ready" : "is-offline"}`}
                role="status"
              >
                {emailStatusLoading ? (
                  <FiAlertCircle aria-hidden />
                ) : emailStatus.available ? (
                  <FiCheckCircle aria-hidden />
                ) : (
                  <FiAlertCircle aria-hidden />
                )}
                <span>
                  {emailStatusLoading ? "Checking email service…" : emailStatus.message}
                </span>
              </div>
              {notice && notice.anchor === "email" ? (
                <div
                  className={`report-actions__toast report-actions__toast--inline ${notice.isError ? "report-actions__toast--error" : ""}`}
                  role="status"
                >
                  {notice.text}
                </div>
              ) : null}
            </div>
          </div>
        </section>
      ) : null}
    </div>
  );
}
