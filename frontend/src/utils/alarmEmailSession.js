const STORAGE_KEY = "oxygen_dashboard_alarm_email_session";

/**
 * Stable id for the browser tab session (sessionStorage) so alarm digest emails
 * are sent at most once per stream per session.
 */
export function getAlarmEmailSessionId() {
  if (typeof window === "undefined" || !window.sessionStorage) {
    return "";
  }
  try {
    let id = sessionStorage.getItem(STORAGE_KEY);
    if (!id) {
      id =
        typeof crypto !== "undefined" && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random().toString(36).slice(2)}`;
      sessionStorage.setItem(STORAGE_KEY, id);
    }
    return id;
  } catch {
    return "";
  }
}
