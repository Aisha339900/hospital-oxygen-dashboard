import apiClient from "./api";

async function readErrorMessage(error) {
  const data = error?.response?.data;
  if (data instanceof Blob) {
    try {
      const text = await data.text();
      const parsed = JSON.parse(text);
      return parsed?.message || text || "Request failed";
    } catch {
      return "Request failed";
    }
  }
  if (data && typeof data === "object" && data.message) {
    return data.message;
  }
  return error?.message || "Request failed";
}

/**
 * @param {object} snapshot
 * @returns {Promise<Blob>}
 */
export async function downloadDashboardPdf(snapshot) {
  try {
    const res = await apiClient.post(
      "/reports/dashboard-pdf",
      { snapshot },
      { responseType: "blob", timeout: 60000 },
    );
    return res.data;
  } catch (err) {
    throw new Error(await readErrorMessage(err));
  }
}

export async function getDashboardEmailStatus() {
  try {
    const res = await apiClient.get("/reports/dashboard-email/status");
    return res.data;
  } catch (err) {
    throw new Error(await readErrorMessage(err));
  }
}

/**
 * @param {object} snapshot
 * @param {string} [to] recipient; server falls back to account email if omitted
 */
export async function emailDashboardPdf(snapshot, to) {
  try {
    const res = await apiClient.post(
      "/reports/dashboard-email",
      {
        snapshot,
        ...(to && String(to).trim() ? { to: String(to).trim() } : {}),
      },
      { timeout: 60000 },
    );
    return res.data;
  } catch (err) {
    throw new Error(await readErrorMessage(err));
  }
}
