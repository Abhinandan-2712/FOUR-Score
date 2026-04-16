/**
 * Admin Feedback API — token-based auth.
 * Backend routes may vary; we support common patterns used elsewhere in this repo.
 */

import axios from "axios";
import { isAdminApiAuthError, isAdminApiErrorPayload } from "@/lib/fitnessProgramApi";

function formatDate(d) {
  if (d == null || d === "") return "—";
  try {
    const t = new Date(d).getTime();
    if (Number.isNaN(t)) return String(d);
    return new Date(d).toISOString().slice(0, 10);
  } catch {
    return String(d);
  }
}

export function buildFeedbackAuthHeaders(token) {
  return { token, Authorization: `Bearer ${token}` };
}

function assertOkPayload(payload, fallbackMessage) {
  const data = payload ?? {};
  if (isAdminApiErrorPayload(data)) {
    const err = new Error(data.message || data.msg || fallbackMessage);
    err.adminPayload = data;
    if (isAdminApiAuthError(data)) err.isAuthError = true;
    throw err;
  }
  return data;
}

export function mapFeedbackFromApi(raw) {
  if (!raw) return null;
  const id = raw._id ?? raw.id;
  if (id == null || id === "") return null;

  const statusRaw = raw.status ?? raw.state ?? raw.isResolved ?? raw.resolved;
  const resolved =
    statusRaw === "Resolved" ||
    statusRaw === "resolved" ||
    statusRaw === true ||
    statusRaw === 1;

  return {
    id: String(id),
    userName: raw.userName ?? raw.name ?? raw.username ?? raw.user?.name ?? "—",
    userEmail: raw.userEmail ?? raw.email ?? raw.user?.email ?? "",
    rating: raw.rating ?? raw.stars ?? raw.score ?? "—",
    message: raw.message ?? raw.feedback ?? raw.text ?? raw.comment ?? "",
    status: resolved ? "Resolved" : "Open",
    createdAt: formatDate(raw.createdAt ?? raw.created_at ?? raw.date),
    _raw: raw,
  };
}

function extractList(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.feedback)) return data.feedback;
  if (Array.isArray(data.feedbacks)) return data.feedbacks;
  if (Array.isArray(data.items)) return data.items;
  const result = data?.result ?? data?.data ?? {};
  if (Array.isArray(result)) return result;
  const nested =
    result.feedback ??
    result.feedbacks ??
    result.items ??
    result.list ??
    (Array.isArray(result.rows) ? result.rows : null);
  if (Array.isArray(nested)) return nested;
  return [];
}

export async function fetchAllFeedback({ token, baseUrl }) {
  if (!token || !baseUrl) throw new Error("Missing token or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const headers = buildFeedbackAuthHeaders(token);

  let res;
  try {
    res = await axios.get(`${base}/api/admin/get-all-feedback`, { headers, timeout: 30000 });
  } catch (e) {
    // Some admin routes are POST-only (multer upload.none()).
    if (e?.response?.status === 405 || e?.response?.status === 404) {
      const fd = new FormData();
      fd.append("_", "");
      res = await axios.post(`${base}/api/admin/get-all-feedback`, fd, { headers, timeout: 30000 });
    } else {
      throw e;
    }
  }

  const payload = assertOkPayload(res?.data, "Failed to load feedback");
  return extractList(payload).map(mapFeedbackFromApi).filter(Boolean);
}

export async function deleteFeedbackById(id, { token, baseUrl }) {
  if (!id || !token || !baseUrl) throw new Error("Missing id, token, or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const fd = new FormData();
  fd.append("_", "");
  const res = await axios.post(`${base}/api/admin/delete-feedback/${encodeURIComponent(id)}`, fd, {
    headers: buildFeedbackAuthHeaders(token),
    timeout: 30000,
  });
  assertOkPayload(res?.data, "Failed to delete feedback");
  return res;
}

export async function setFeedbackResolved(id, resolved, { token, baseUrl }) {
  if (!id || !token || !baseUrl) throw new Error("Missing id, token, or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const fd = new FormData();
  // Support multiple backend conventions
  fd.append("status", resolved ? "Resolved" : "Open");
  fd.append("resolved", resolved ? "true" : "false");
  const res = await axios.post(`${base}/api/admin/update-feedback/${encodeURIComponent(id)}`, fd, {
    headers: buildFeedbackAuthHeaders(token),
    timeout: 30000,
  });
  assertOkPayload(res?.data, "Failed to update feedback");
  return res;
}

