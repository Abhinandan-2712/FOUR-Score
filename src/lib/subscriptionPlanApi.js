/**
 * Admin subscription plans — FormData + token (Express upload.none() routes).
 * GET /api/admin/get-all-plans, POST /api/admin/add-plan, /update-plan/:id, /delete-plan/:id
 */

import axios from "axios";
import { isAdminApiAuthError, isAdminApiErrorPayload } from "@/lib/fitnessProgramApi";
import { buildFaqAuthHeaders } from "@/lib/faqApi";

const DEFAULT_ACCESS = { fitnessPrograms: true };
const DEFAULT_ACCESS_ITEMS = { fitnessPrograms: { mode: "all", ids: [] } };
const DEFAULT_PERIOD = 30;

function assertOkResponse(res, fallbackMessage) {
  const data = res?.data ?? {};
  if (isAdminApiErrorPayload(data)) {
    const err = new Error(data.message || data.msg || fallbackMessage);
    err.adminPayload = data;
    if (isAdminApiAuthError(data)) err.isAuthError = true;
    throw err;
  }
  return res;
}

function parseJsonField(val, fallback) {
  if (val == null || val === "") return fallback;
  if (typeof val === "object" && !Array.isArray(val)) return { ...fallback, ...val };
  if (typeof val === "string") {
    try {
      const p = JSON.parse(val);
      return typeof p === "object" && p != null ? p : fallback;
    } catch {
      return fallback;
    }
  }
  return fallback;
}

/** If `s` is a stringified JSON array, return parsed string array; else null. */
function tryParseStringArray(s) {
  if (typeof s !== "string") return null;
  const t = s.trim();
  if (!t.startsWith("[")) return null;
  try {
    const p = JSON.parse(t);
    return Array.isArray(p) ? p : null;
  } catch {
    return null;
  }
}

/**
 * Some APIs store `features` as a JSON string, or an array with one element that is that string
 * (double-encoded). Flatten to a list of display strings.
 */
function parseFeatures(raw) {
  if (raw == null) return [];
  if (Array.isArray(raw)) {
    const out = [];
    for (const x of raw) {
      if (x == null) continue;
      if (typeof x === "string") {
        const inner = tryParseStringArray(x);
        if (inner) {
          for (const f of inner) {
            const line = String(f).trim();
            if (line) out.push(line);
          }
        } else {
          const line = x.trim();
          if (line) out.push(line);
        }
      } else {
        const line = String(x).trim();
        if (line) out.push(line);
      }
    }
    return out;
  }
  if (typeof raw === "string") {
    const inner = tryParseStringArray(raw);
    if (inner) return inner.map((f) => String(f).trim()).filter(Boolean);
    return raw
      .split("\n")
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

/** Map API document → UI plan shape used by subscription admin */
export function mapPlanFromApi(raw) {
  if (!raw) return null;
  const id = raw._id ?? raw.id;
  if (id == null || id === "") return null;

  const name = String(raw.name ?? raw.planName ?? raw.title ?? "").trim();
  const tagline = String(raw.tagline ?? raw.subtitle ?? "Perfect to get started").trim() || "Perfect to get started";
  const price = String(raw.price ?? raw.amount ?? raw.planPrice ?? "").trim();

  let period = String(raw.period ?? "").trim();
  if (!period) {
    const pd = Number.parseInt(
      String(raw.periodDays ?? raw.durationDays ?? raw.duration ?? raw.days ?? DEFAULT_PERIOD).replace(/[^\d]/g, ""),
      10
    );
    if (Number.isFinite(pd) && pd > 0) period = `${pd} days`;
    else period = "30 days";
  }

  const features = parseFeatures(raw.features);
  const access = {
    ...DEFAULT_ACCESS,
    ...parseJsonField(raw.access, {}),
  };
  const accessItems = {
    ...DEFAULT_ACCESS_ITEMS,
  };
  const ai = parseJsonField(raw.accessItems, null);
  if (ai && typeof ai === "object" && ai.fitnessPrograms) {
    accessItems.fitnessPrograms = {
      mode: ai.fitnessPrograms.mode === "selected" ? "selected" : "all",
      ids: Array.isArray(ai.fitnessPrograms.ids) ? ai.fitnessPrograms.ids : [],
    };
  }

  return { id: String(id), name, tagline, price, period, features, access, accessItems };
}

function extractPlansFromListResponse(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.plans)) return data.plans;
  const result = data?.result ?? data?.data ?? {};
  if (Array.isArray(result)) return result;
  const raw =
    result.plans ??
    result.data ??
    result.items ??
    result.list ??
    (Array.isArray(result.rows) ? result.rows : null);
  if (Array.isArray(raw)) return raw;
  return [];
}

function appendPlanFields(fd, { name, tagline, price, period, features, access, accessItems }) {
  fd.append("name", name != null ? String(name) : "");
  fd.append("tagline", tagline != null ? String(tagline) : "");
  fd.append("price", price != null ? String(price) : "");
  fd.append("period", period != null ? String(period) : "");
  const featArray = Array.isArray(features) ? features : [];
  fd.append("features", JSON.stringify(featArray));
  fd.append("access", JSON.stringify(access && typeof access === "object" ? access : DEFAULT_ACCESS));
  fd.append("accessItems", JSON.stringify(accessItems && typeof accessItems === "object" ? accessItems : DEFAULT_ACCESS_ITEMS));
}

export async function fetchAllSubscriptionPlans({ token, baseUrl }) {
  if (!token || !baseUrl) throw new Error("Missing token or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const headers = buildFaqAuthHeaders(token);

  let res;
  try {
    res = await axios.get(`${base}/api/admin/get-all-plans`, { headers, timeout: 30000 });
  } catch (e) {
    if (e?.response?.status === 405 || e?.response?.status === 404) {
      const fd = new FormData();
      fd.append("_", "");
      res = await axios.post(`${base}/api/admin/get-all-plans`, fd, { headers, timeout: 30000 });
    } else {
      throw e;
    }
  }

  const payload = res?.data ?? {};
  if (isAdminApiErrorPayload(payload)) {
    const err = new Error(payload.message || "Failed to load subscription plans");
    err.adminPayload = payload;
    if (isAdminApiAuthError(payload)) err.isAuthError = true;
    throw err;
  }
  const rawList = extractPlansFromListResponse(payload);
  return rawList.map(mapPlanFromApi).filter(Boolean);
}

export async function createSubscriptionPlan(body, { token, baseUrl }) {
  if (!token || !baseUrl) throw new Error("Missing token or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const fd = new FormData();
  appendPlanFields(fd, body);
  const res = await axios.post(`${base}/api/admin/add-plan`, fd, {
    headers: buildFaqAuthHeaders(token),
    timeout: 30000,
  });
  return assertOkResponse(res, "Failed to create plan");
}

export async function updateSubscriptionPlan(id, body, { token, baseUrl }) {
  if (!id || !token || !baseUrl) throw new Error("Missing id, token, or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const fd = new FormData();
  appendPlanFields(fd, body);
  const res = await axios.post(`${base}/api/admin/update-plan/${encodeURIComponent(id)}`, fd, {
    headers: buildFaqAuthHeaders(token),
    timeout: 30000,
  });
  return assertOkResponse(res, "Failed to update plan");
}

export async function deleteSubscriptionPlan(id, { token, baseUrl }) {
  if (!id || !token || !baseUrl) throw new Error("Missing id, token, or API base URL");
  const base = String(baseUrl).replace(/\/$/, "");
  const fd = new FormData();
  fd.append("_", "");
  const res = await axios.post(`${base}/api/admin/delete-plan/${encodeURIComponent(id)}`, fd, {
    headers: buildFaqAuthHeaders(token),
    timeout: 30000,
  });
  return assertOkResponse(res, "Failed to delete plan");
}
