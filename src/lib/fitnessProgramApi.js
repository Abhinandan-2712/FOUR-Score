/**
 * Admin fitness program API helpers.
 * Backend: multer upload.none() — use multipart FormData (no files).
 */

import axios from "axios";

export const PROGRAM_CACHE_PREFIX = "program-cache:";
export const PROGRAM_EDIT_PREFIX = "program-edit:";

export function programCacheKey(id) {
  return `${PROGRAM_CACHE_PREFIX}${id}`;
}

export function programEditKey(id) {
  return `${PROGRAM_EDIT_PREFIX}${id}`;
}

/**
 * for-score API often returns HTTP 200 with errors in JSON:
 * { success: false, statusCode: 401, message: "..." } — axios still resolves (no throw).
 */
export function isAdminApiErrorPayload(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return false;
  if (data.success === false) return true;
  if (typeof data.statusCode === "number" && data.statusCode >= 400) return true;
  return false;
}

export function isAdminApiAuthError(data) {
  if (!isAdminApiErrorPayload(data)) return false;
  const sc = data.statusCode;
  const m = String(data.message || "").toLowerCase();
  if (sc === 401 || sc === 403) return true;
  if (m.includes("token") || m.includes("jwt") || m.includes("unauthorized") || m.includes("access denied"))
    return true;
  return false;
}

/** Map API document → list row + keep raw for edit/view cache */
export function mapProgramFromApi(raw) {
  if (!raw) return null;
  const id = raw?._id ?? raw?.id;
  if (!id) return null;

  const updatedAt = raw?.updatedAt
    ? new Date(raw.updatedAt).toISOString().slice(0, 10)
    : raw?.updated_at
      ? new Date(raw.updated_at).toISOString().slice(0, 10)
      : "";

  const durationWeeks = Number(raw?.durationWeeks ?? raw?.duration_weeks ?? 0);
  const frequencyPerWeek = Number(raw?.frequencyPerWeek ?? raw?.frequency_per_week ?? 0);
  const avgSessionMinutes = Number(raw?.avgSessionMinutes ?? raw?.avg_session_minutes ?? 0);

  return {
    id: String(id),
    title: raw?.programName ?? raw?.title ?? "",
    subHeader: raw?.subHeader ?? raw?.sub_header ?? "",
    level: raw?.workoutSkillLevel ?? raw?.level ?? "",
    durationWeeks: Number.isFinite(durationWeeks) && durationWeeks > 0 ? durationWeeks : 1,
    frequencyPerWeek: Number.isFinite(frequencyPerWeek) && frequencyPerWeek > 0 ? frequencyPerWeek : 1,
    avgSessionMinutes: Number.isFinite(avgSessionMinutes) && avgSessionMinutes > 0 ? avgSessionMinutes : 1,
    status: raw?.status === "Inactive" ? "Inactive" : "Active",
    updatedAt: updatedAt || "—",
    _raw: raw,
  };
}

/** API may return strings or arrays for multiline copy fields */
export function coerceMultilineText(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => (v == null ? "" : String(v))).join("\n");
  if (typeof value === "object") return "";
  return String(value);
}

export function coercePlainString(value) {
  if (value == null) return "";
  if (typeof value === "string") return value;
  if (Array.isArray(value)) return value.map((v) => (v == null ? "" : String(v))).filter(Boolean).join(" ");
  if (typeof value === "object") return "";
  return String(value);
}

function pickDetailFromRaw(raw) {
  if (!raw) return null;
  const candidates = [
    raw.programDetail,
    raw.program_detail,
    raw.detail,
    raw.extendedData,
    raw.extended_data,
  ];
  for (const c of candidates) {
    if (c == null) continue;
    if (typeof c === "object") return c;
    if (typeof c === "string" && c.trim()) {
      try {
        return JSON.parse(c);
      } catch {
        return null;
      }
    }
  }
  return null;
}

/** Merge API row + optional nested JSON into editor draft shape */
export function apiRowToEditorDraft(raw, emptyTemplate) {
  const list = mapProgramFromApi(raw);
  if (!list) return null;

  const parsed = pickDetailFromRaw(raw);
  const base = emptyTemplate
    ? { ...emptyTemplate, id: list.id }
    : {
        id: list.id,
        title: list.title,
        subHeader: list.subHeader,
        overview: "",
        whatsInside: "",
        isThisForYou: "",
        theGoal: "",
        level: list.level,
        durationWeeks: list.durationWeeks,
        frequencyPerWeek: list.frequencyPerWeek,
        avgSessionMinutes: list.avgSessionMinutes,
        locationTag: "",
        equipment: "",
        status: list.status,
      };

  const merged = {
    ...base,
    title: raw?.programName ?? raw?.title ?? base.title,
    subHeader: raw?.subHeader ?? raw?.sub_header ?? base.subHeader,
    overview: raw?.overview ?? base.overview,
    whatsInside: raw?.whatsInside ?? raw?.whats_inside ?? base.whatsInside,
    isThisForYou: raw?.isThisForYou ?? raw?.is_this_for_you ?? base.isThisForYou,
    theGoal: raw?.theGoal ?? raw?.the_goal ?? base.theGoal,
    level: raw?.workoutSkillLevel ?? raw?.level ?? base.level,
    durationWeeks: list.durationWeeks,
    frequencyPerWeek: list.frequencyPerWeek,
    avgSessionMinutes: list.avgSessionMinutes,
    frequencyCaption: raw?.frequencyCaption ?? raw?.frequency_caption ?? base.frequencyCaption,
    locationTag: raw?.locationTag ?? raw?.location_tag ?? base.locationTag,
    equipment: raw?.equipment ?? base.equipment,
    equipmentNote: raw?.equipmentNote ?? raw?.equipment_note ?? base.equipmentNote,
    status: list.status,
    implementationNote: raw?.implementationNote ?? raw?.implementation_note ?? base.implementationNote,
  };

  if (parsed && typeof parsed === "object") {
    Object.assign(merged, parsed);
    merged.id = list.id;
  }

  merged.title = coercePlainString(merged.title);
  merged.subHeader = coercePlainString(merged.subHeader);
  merged.overview = coerceMultilineText(merged.overview);
  merged.whatsInside = coerceMultilineText(merged.whatsInside);
  merged.isThisForYou = coerceMultilineText(merged.isThisForYou);
  merged.theGoal = coerceMultilineText(merged.theGoal);
  merged.equipment = coerceMultilineText(merged.equipment);
  merged.equipmentNote = coerceMultilineText(merged.equipmentNote);
  merged.frequencyCaption = coercePlainString(merged.frequencyCaption);
  merged.locationTag = coercePlainString(merged.locationTag);
  merged.implementationNote = coerceMultilineText(merged.implementationNote);

  return merged;
}

/**
 * Append program fields for add/update. Backend field names may vary; we send camelCase
 * plus a JSON blob for schedule / workouts / recovery.
 */
export function appendProgramFields(formData, payload) {
  const t = payload.title != null ? String(payload.title) : "";
  const o = payload.overview != null ? String(payload.overview) : "";
  const skill =
    payload.workoutSkillLevel != null && payload.workoutSkillLevel !== ""
      ? String(payload.workoutSkillLevel)
      : payload.level != null
        ? String(payload.level)
        : "";

  const flat = [
    // Backend-required fields (exact names)
    ["programName", t],
    ["subHeader", payload.subHeader],
    ["overview", o],
    ["workoutSkillLevel", skill],
    ["title", t],
    ["name", t],
    ["programTitle", t],
    ["sub_header", payload.subHeader],
    ["description", o],
    ["whatsInside", payload.whatsInside],
    ["whats_inside", payload.whatsInside],
    ["isThisForYou", payload.isThisForYou],
    ["is_this_for_you", payload.isThisForYou],
    ["theGoal", payload.theGoal],
    ["the_goal", payload.theGoal],
    ["level", payload.level],
    ["workout_skill_level", skill],
    ["durationWeeks", String(payload.durationWeeks ?? "")],
    ["duration_weeks", String(payload.durationWeeks ?? "")],
    ["frequencyPerWeek", String(payload.frequencyPerWeek ?? "")],
    ["frequency_per_week", String(payload.frequencyPerWeek ?? "")],
    ["avgSessionMinutes", String(payload.avgSessionMinutes ?? "")],
    ["avg_session_minutes", String(payload.avgSessionMinutes ?? "")],
    ["frequencyCaption", payload.frequencyCaption ?? ""],
    ["frequency_caption", payload.frequencyCaption ?? ""],
    ["locationTag", payload.locationTag ?? ""],
    ["location_tag", payload.locationTag ?? ""],
    ["equipment", payload.equipment ?? ""],
    ["equipmentNote", payload.equipmentNote ?? ""],
    ["equipment_note", payload.equipmentNote ?? ""],
    ["status", payload.status ?? "Active"],
    ["implementationNote", payload.implementationNote ?? ""],
    ["implementation_note", payload.implementationNote ?? ""],
  ];

  for (const [k, v] of flat) {
    if (v !== undefined && v !== null) formData.append(k, String(v));
  }

  const { schedule, workouts, recovery } = payload;
  const detailBlob = {
    schedule,
    workouts,
    recovery,
    frequencyCaption: payload.frequencyCaption,
    equipmentNote: payload.equipmentNote,
    implementationNote: payload.implementationNote,
  };

  const hasNested =
    (schedule && Array.isArray(schedule)) ||
    (workouts && typeof workouts === "object") ||
    (recovery && typeof recovery === "object");

  if (hasNested) {
    const json = JSON.stringify(detailBlob);
    formData.append("programDetail", json);
    formData.append("program_detail", json);
  }
}

export function extractProgramsFromListResponse(data) {
  if (data == null) return [];
  if (Array.isArray(data)) return data;
  if (Array.isArray(data.programs)) return data.programs;
  if (Array.isArray(data.items)) return data.items;
  if (Array.isArray(data.list)) return data.list;
  const result = data?.result ?? data?.data ?? {};
  if (Array.isArray(result)) return result;
  const raw =
    result.programs ??
    result.data ??
    result.items ??
    result.list ??
    (Array.isArray(result.rows) ? result.rows : null);
  if (Array.isArray(raw)) return raw;
  return [];
}

/** Normalize GET-one style responses from various backends */
function unwrapProgramDocument(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) return null;
  const inner = data.result ?? data.data ?? data.program ?? data.item;
  if (inner && typeof inner === "object" && !Array.isArray(inner) && (inner._id ?? inner.id))
    return inner;
  if (data._id ?? data.id) return data;
  return null;
}

/**
 * Load one program for view/edit when sessionStorage has no cache.
 * Tries common single-program routes, then paginated list (high limit).
 */
export async function fetchProgramRawById(id, { token, baseUrl }) {
  if (!id || !token || !baseUrl) return null;
  const base = String(baseUrl).replace(/\/$/, "");

  const paths = [
    `/api/admin/get-program/${encodeURIComponent(id)}`,
    `/api/admin/get-program-by-id/${encodeURIComponent(id)}`,
    `/api/admin/program/${encodeURIComponent(id)}`,
  ];

  for (const p of paths) {
    try {
      const res = await axios.get(`${base}${p}`, { headers: { token }, timeout: 30000 });
      const raw = unwrapProgramDocument(res?.data);
      if (raw && String(raw._id ?? raw.id) === String(id)) return raw;
    } catch {
      /* wrong route or 404 */
    }
  }

  try {
    const res = await axios.get(`${base}/api/admin/get-all-programs`, {
      headers: { token, Authorization: `Bearer ${token}` },
      params: { page: 1, limit: 1000 },
    });
    const payload = res?.data ?? {};
    if (isAdminApiErrorPayload(payload)) return null;
    const rawList = extractProgramsFromListResponse(payload);
    return rawList.find((x) => String(x?._id ?? x?.id) === String(id)) ?? null;
  } catch {
    return null;
  }
}

/**
 * Delete program — backend uses POST + multer for some routes; API returns HTTP 200 even on errors
 * (check JSON success / statusCode). Retries until a real success or runs out of strategies.
 */
// export async function deleteProgramById(programId, { token, baseUrl }) {
//   if (!programId || !token || !baseUrl) {
//     throw new Error("Missing program id, token, or base URL");
//   }
//   const base = String(baseUrl).replace(/\/$/, "");
//   const id = encodeURIComponent(programId);
//   const paths = [`/api/admin/delete-program/${id}`, `/api/admin/delete-programs/${id}`];

//   const attempts = [
//     // Multer upload.none() — try first (matches router.post(..., upload.none(), ...))
//     (url) => {
//       const fd = new FormData();
//       fd.append("_", "");
//       return axios.post(url, fd, {
//         headers: { token, Authorization: `Bearer ${token}` },
//         timeout: 30000,
//       });
//     },
//     (url) => {
//       const fd = new FormData();
//       fd.append("_", "");
//       return axios.post(url, fd, { headers: { token }, timeout: 30000 });
//     },
//     (url) =>
//       axios.post(url, {}, { headers: { token }, timeout: 30000 }),
//     (url) =>
//       axios.post(url, {}, {
//         headers: { token, Authorization: `Bearer ${token}` },
//         timeout: 30000,
//       }),
//     (url) => {
//       const body = new URLSearchParams();
//       body.append("_", "");
//       return axios.post(url, body.toString(), {
//         headers: { token, "Content-Type": "application/x-www-form-urlencoded" },
//         timeout: 30000,
//       });
//     },
//     (url) => axios.delete(url, { headers: { token }, timeout: 30000 }),
//     (url) =>
//       axios.delete(url, {
//         headers: { token, Authorization: `Bearer ${token}` },
//         timeout: 30000,
//       }),
//   ];

//   let lastNetworkErr;
//   let lastErrorPayload;

//   for (const p of paths) {
//     const url = `${base}${p}`;
//     for (const run of attempts) {
//       try {
//         console.log("url", url);
//         const res = await run(url);
//         const data = res?.data ?? {};
//         if (!isAdminApiErrorPayload(data)) {
//           return res;
//         }
//         console.log("url", res);

//         console.log("data", data);
//         console.log("isAdminApiAuthError(data)", isAdminApiAuthError(data));
//         if (isAdminApiAuthError(data)) {
//           const err = new Error(data.message || "Unauthorized");
//           err.isAuthError = true;
//           err.adminPayload = data;
//           throw err;
//         }
//         lastErrorPayload = data;
//       } catch (e) {
//         if (e.isAuthError) throw e;
//         const st = e?.response?.status;
//         if (st === 401 || st === 403) throw e;
//         lastNetworkErr = e;
//       }
//     }
//   }

//   if (lastErrorPayload) {
//     const err = new Error(lastErrorPayload.message || "Could not delete program");
//     err.adminPayload = lastErrorPayload;
//     throw err;
//   }
//   throw lastNetworkErr ?? new Error("Could not delete program");
// }
export async function deleteProgramById(programId, { token, baseUrl }) {
  if (!programId || !token || !baseUrl) {
    throw new Error("Missing program id, token, or base URL");
  }

  const base = String(baseUrl).replace(/\/$/, "");
  const id = encodeURIComponent(programId);

  const paths = [
    `/api/admin/delete-program/${id}`,
    `/api/admin/delete-programs/${id}`,
  ];

  const attempts = [
    // FormData (multer)
    (url) => {
      const fd = new FormData();
      fd.append("_", "");
      return axios.post(url, fd, {
        headers: { token, Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
    },

    (url) => {
      const fd = new FormData();
      fd.append("_", "");
      return axios.post(url, fd, {
        headers: { token },
        timeout: 30000,
      });
    },

    // Normal POST
    (url) =>
      axios.post(url, {}, {
        headers: { token },
        timeout: 30000,
      }),

    (url) =>
      axios.post(url, {}, {
        headers: { token, Authorization: `Bearer ${token}` },
        timeout: 30000,
      }),

    // x-www-form-urlencoded
    (url) => {
      const body = new URLSearchParams();
      body.append("_", "");
      return axios.post(url, body.toString(), {
        headers: {
          token,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        timeout: 30000,
      });
    },

    // DELETE
    (url) =>
      axios.delete(url, {
        headers: { token },
        timeout: 30000,
      }),

    (url) =>
      axios.delete(url, {
        headers: { token, Authorization: `Bearer ${token}` },
        timeout: 30000,
      }),
  ];

  let lastNetworkErr;
  let lastErrorPayload;

  for (const p of paths) {
    const url = `${base}${p}`;

    for (const run of attempts) {
      try {
        // console.log("🔵 TRYING URL =>", url);

        const res = await run(url);

        // ✅ SUCCESS LOG
        // console.log("🟢 SUCCESS RESPONSE =>", {
        //   status: res.status,
        //   data: res.data,
        // });

        const data = res?.data ?? {};

        if (!isAdminApiErrorPayload(data)) {
          return res;
        }

        console.log("⚠️ API RETURNED ERROR PAYLOAD =>", data);

        if (isAdminApiAuthError(data)) {
          const err = new Error(data.message || "Unauthorized");
          err.isAuthError = true;
          err.adminPayload = data;
          throw err;
        }

        lastErrorPayload = data;

      } catch (e) {
        // 🔴 FULL ERROR DEBUG
        // console.log("🔴 ERROR OCCURRED =>", e);

        if (e?.response) {
          // console.log("🔴 STATUS =>", e.response.status);
          // console.log("🔴 HEADERS =>", e.response.headers);
          // console.log("🔴 API RESPONSE DATA =>", e.response.data);
        } else {
          // console.log("🔴 NO RESPONSE (Network Issue) =>", e.message);
        }

        if (e.isAuthError) throw e;

        const st = e?.response?.status;

        if (st === 401 || st === 403) {
          throw e;
        }

        lastNetworkErr = e;
      }
    }
  }

  // ❌ Backend error payload mila
  if (lastErrorPayload) {
    const err = new Error(
      lastErrorPayload.message || "Could not delete program"
    );
    err.adminPayload = lastErrorPayload;

    // console.log("❌ FINAL BACKEND ERROR =>", lastErrorPayload);

    throw err;
  }

  // ❌ Network / unknown error
  // console.log("❌ FINAL NETWORK ERROR =>", lastNetworkErr);

  throw lastNetworkErr ?? new Error("Could not delete program");
}

export function extractListMeta(data) {
  const result = data?.result ?? data?.data ?? {};
  const total = result.total ?? result.count ?? result.totalCount;
  const totalPages = result.totalPages ?? result.pages;
  return {
    total: typeof total === "number" ? total : undefined,
    totalPages: typeof totalPages === "number" ? totalPages : undefined,
  };
}
