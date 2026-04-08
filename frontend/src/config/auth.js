export function isAuthEnabled() {
    const raw = process.env.REACT_APP_AUTH_ENABLED;
    if (typeof raw !== "string") {
      return false;
    }
    const normalized = raw.trim().toLowerCase();
    return normalized === "1" || normalized === "true" || normalized === "yes";
  }
  
  