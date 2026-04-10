/**
 * Admin fitness program API helpers.
 * Backend: multer upload.none() — use multipart FormData (no files).
 */

import axios from "axios";

export const PROGRAM_CACHE_PREFIX = "program-cache:";
export const PROGRAM_EDIT_PREFIX = "program-edit:";

function scheduleArrayToPage2(schedule) {
  if (!Array.isArray(schedule)) return null;
  const out = {};
  for (const row of schedule) {
    const w = Number(row?.week);
    if (!Number.isFinite(w) || w < 1) continue;
    out[`week${w}`] = {
      mon: row?.mon ?? "",
      tue: row?.tue ?? "",
      wed: row?.wed ?? "",
      thu: row?.thu ?? "",
      fri: row?.fri ?? "",
      weekend: row?.weekend ?? "",
    };
  }
  return Object.keys(out).length ? out : null;
}

function page2ToScheduleArray(page2, fallbackSchedule) {
  if (!page2 || typeof page2 !== "object" || Array.isArray(page2)) return fallbackSchedule;
  const weeks = Object.keys(page2)
    .map((k) => {
      const m = String(k).match(/^week(\d+)$/i);
      return m ? Number(m[1]) : null;
    })
    .filter((n) => Number.isFinite(n) && n > 0)
    .sort((a, b) => a - b);

  if (!weeks.length) return fallbackSchedule;

  return weeks.map((w) => {
    const row = page2[`week${w}`] ?? page2[`Week${w}`] ?? {};
    return {
      week: w,
      mon: row?.mon ?? "",
      tue: row?.tue ?? "",
      wed: row?.wed ?? "",
      thu: row?.thu ?? "",
      fri: row?.fri ?? "",
      weekend: row?.weekend ?? "",
    };
  });
}

function weekGridToScheduleArray(weekGrid, fallbackSchedule) {
  // Backend schema: { week1: {mon,tue,...}, week2: {...} }
  return page2ToScheduleArray(weekGrid, fallbackSchedule);
}

function workoutsToPage3(workouts) {
  if (!workouts || typeof workouts !== "object" || Array.isArray(workouts)) return null;
  const A = Array.isArray(workouts.A) ? workouts.A : [];
  const B = Array.isArray(workouts.B) ? workouts.B : [];
  const C = Array.isArray(workouts.C) ? workouts.C : [];
  const out = {
    workoutA: A,
    workoutB: B,
    workoutC: C,
  };
  const hasAny = A.length || B.length || C.length;
  return hasAny ? out : null;
}

function page3ToWorkouts(page3, fallbackWorkouts) {
  if (!page3 || typeof page3 !== "object" || Array.isArray(page3)) return fallbackWorkouts;
  const A = Array.isArray(page3.workoutA) ? page3.workoutA : Array.isArray(page3.A) ? page3.A : null;
  const B = Array.isArray(page3.workoutB) ? page3.workoutB : Array.isArray(page3.B) ? page3.B : null;
  const C = Array.isArray(page3.workoutC) ? page3.workoutC : Array.isArray(page3.C) ? page3.C : null;

  const any = A || B || C;
  if (!any) return fallbackWorkouts;

  return {
    A: A ?? fallbackWorkouts?.A ?? [],
    B: B ?? fallbackWorkouts?.B ?? [],
    C: C ?? fallbackWorkouts?.C ?? [],
  };
}

function exerciseLibraryToWorkouts(exerciseLibrary, fallbackWorkouts) {
  // Backend schema: { workoutA: [], workoutB: [], workoutC: [] }
  return page3ToWorkouts(exerciseLibrary, fallbackWorkouts);
}

function recoveryToPage4(recovery) {
  if (!recovery || typeof recovery !== "object" || Array.isArray(recovery)) return null;
  // Backend schemas vary; we keep a stable key and also mirror into Tue/Thu if backend expects day objects.
  return {
    recovery,
    tue: { recovery },
    thu: { recovery },
  };
}

function page4ToRecovery(page4, fallbackRecovery) {
  if (!page4 || typeof page4 !== "object" || Array.isArray(page4)) return fallbackRecovery;
  // Prefer explicit recovery object; otherwise accept nested under tue/thu.
  const r =
    page4.recovery ??
    page4?.tue?.recovery ??
    page4?.thu?.recovery ??
    null;
  if (!r || typeof r !== "object" || Array.isArray(r)) return fallbackRecovery;
  return r;
}

function recoveryProtocolToRecovery(recoveryProtocol, fallbackRecovery) {
  // Backend schema matches our page4 mapper: { recovery, tue: {recovery}, thu: {recovery} }
  return page4ToRecovery(recoveryProtocol, fallbackRecovery);
}

function isProbablyEmptySchedule(schedule) {
  if (!Array.isArray(schedule) || schedule.length === 0) return true;
  return schedule.every((row) => {
    if (!row) return true;
    const keys = ["mon", "tue", "wed", "thu", "fri", "weekend"];
    return keys.every((k) => !String(row?.[k] ?? "").trim());
  });
}

function isProbablyEmptyWorkouts(workouts) {
  if (!workouts || typeof workouts !== "object" || Array.isArray(workouts)) return true;
  const letters = ["A", "B", "C"];
  return letters.every((l) => {
    const list = workouts?.[l];
    if (!Array.isArray(list) || list.length === 0) return true;
    return list.every((ex) => !String(ex?.name ?? "").trim());
  });
}

function isProbablyEmptyRecovery(recovery) {
  if (!recovery || typeof recovery !== "object" || Array.isArray(recovery)) return true;
  const prompt = String(recovery?.lissPrompt ?? "").trim();
  const opts = String(recovery?.lissOptions ?? "").trim();
  const stretches = Array.isArray(recovery?.stretches) ? recovery.stretches : [];
  const hasStretch = stretches.some(
    (s) => String(s?.name ?? "").trim() || String(s?.detail ?? "").trim()
  );
  return !prompt && !opts && !hasStretch;
}

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
    theGoal: raw?.theGoal ?? raw?.the_goal ?? raw?.goalText ?? raw?.goal_text ?? base.theGoal,
    level: raw?.workoutSkillLevel ?? raw?.level ?? base.level,
    durationWeeks: list.durationWeeks,
    frequencyPerWeek: list.frequencyPerWeek,
    avgSessionMinutes: list.avgSessionMinutes,
    frequencyCaption:
      raw?.frequencyCaption ??
      raw?.frequency_caption ??
      raw?.frequency ??
      base.frequencyCaption,
    locationTag: raw?.locationTag ?? raw?.location_tag ?? base.locationTag,
    equipment:
      Array.isArray(raw?.equipment) ? raw.equipment.join("\n") : raw?.equipment ?? base.equipment,
    equipmentNote: raw?.equipmentNote ?? raw?.equipment_note ?? base.equipmentNote,
    status: list.status,
    implementationNote: raw?.implementationNote ?? raw?.implementation_note ?? base.implementationNote,

    // Carry backend nested shapes so we can map them into UI fields.
    weekGrid: raw?.weekGrid ?? raw?.week_grid,
    exerciseLibrary: raw?.exerciseLibrary ?? raw?.exercise_library,
    recoveryProtocol: raw?.recoveryProtocol ?? raw?.recovery_protocol,
    page2: raw?.page2,
    page3: raw?.page3,
    page4: raw?.page4,
  };

  if (parsed && typeof parsed === "object") {
    Object.assign(merged, parsed);
    merged.id = list.id;
  }

  // Backend schema (your JSON): weekGrid / exerciseLibrary / recoveryProtocol.
  if (merged.weekGrid && isProbablyEmptySchedule(merged.schedule)) {
    merged.schedule = weekGridToScheduleArray(merged.weekGrid, merged.schedule);
  }
  if (merged.exerciseLibrary && isProbablyEmptyWorkouts(merged.workouts)) {
    merged.workouts = exerciseLibraryToWorkouts(merged.exerciseLibrary, merged.workouts);
  }
  if (merged.recoveryProtocol && isProbablyEmptyRecovery(merged.recovery)) {
    merged.recovery = recoveryProtocolToRecovery(merged.recoveryProtocol, merged.recovery);
  }

  // If backend stores editor data as page2/3/4, map them back into UI shape.
  if (merged.page2 && isProbablyEmptySchedule(merged.schedule)) {
    merged.schedule = page2ToScheduleArray(merged.page2, merged.schedule);
  }
  if (merged.page3 && isProbablyEmptyWorkouts(merged.workouts)) {
    merged.workouts = page3ToWorkouts(merged.page3, merged.workouts);
  }
  if (merged.page4 && isProbablyEmptyRecovery(merged.recovery)) {
    merged.recovery = page4ToRecovery(merged.page4, merged.recovery);
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

  const schedule = payload?.schedule;
  const workouts = payload?.workouts;
  const recovery = payload?.recovery;

  // Backend often uses page2/3/4 naming; build them from UI fields if missing.
  const page2 = payload?.page2 && typeof payload.page2 === "object" ? payload.page2 : scheduleArrayToPage2(schedule);
  const page3 = payload?.page3 && typeof payload.page3 === "object" ? payload.page3 : workoutsToPage3(workouts);
  const page4 = payload?.page4 && typeof payload.page4 === "object" ? payload.page4 : recoveryToPage4(recovery);

  const detailBlob = {
    schedule,
    workouts,
    recovery,
    page2,
    page3,
    page4,
    frequencyCaption: payload.frequencyCaption,
    equipmentNote: payload.equipmentNote,
    implementationNote: payload.implementationNote,
  };

  const hasNested =
    (schedule && Array.isArray(schedule)) ||
    (workouts && typeof workouts === "object") ||
    (recovery && typeof recovery === "object") ||
    (page2 && typeof page2 === "object") ||
    (page3 && typeof page3 === "object") ||
    (page4 && typeof page4 === "object");

  if (hasNested) {
    const json = JSON.stringify(detailBlob);
    formData.append("programDetail", json);
    formData.append("program_detail", json);
  }

  // Some backends persist these pages as top-level JSON fields.
  if (page2 && typeof page2 === "object") formData.append("page2", JSON.stringify(page2));
  if (page3 && typeof page3 === "object") formData.append("page3", JSON.stringify(page3));
  if (page4 && typeof page4 === "object") formData.append("page4", JSON.stringify(page4));
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
  const baseNoApi = base.replace(/\/api$/i, "");

  const encId = encodeURIComponent(id);

  // Preferred endpoint (backend): GET /api/admin/programs/:id
  const paths = [
    `/api/admin/programs/${encId}`,
    `/api/admin/program/${encId}`,
    // Minimal backward-compat fallbacks
    `/api/admin/get-program-by-id/${encId}`,
  ];

  const headers = { token, Authorization: `Bearer ${token}` };

  for (const p of paths) {
    try {
      const urls = [`${base}${p}`, `${baseNoApi}${p}`];
      for (const url of urls) {
        const res = await axios.get(url, { headers, timeout: 30000 });
        const raw = unwrapProgramDocument(res?.data);
        if (raw && String(raw._id ?? raw.id) === String(id)) return raw;
      }
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
    // Retry list endpoint without `/api` prefix if needed.
    try {
      const res = await axios.get(`${baseNoApi}/admin/get-all-programs`, {
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
}

/**
 * Delete program — backend uses POST + multer for some routes; API returns HTTP 200 even on errors
 * (check JSON success / statusCode). Retries until a real success or runs out of strategies.
 */
// (removed) old deleteProgramById implementation (kept repo clean)
export async function deleteProgramById(programId, { token, baseUrl }) {
  if (!programId || !token || !baseUrl) {
    throw new Error("Missing program id, token, or base URL");
  }

  const base = String(baseUrl).replace(/\/$/, "");
  const baseNoApi = base.replace(/\/api$/i, "");
  const id = encodeURIComponent(programId);

  const paths = [
    `/api/admin/delete-program/${id}`,
  ];

  const attempts = [
    // Backend uses multer upload.none() => multipart/form-data
    (url) => {
      const fd = new FormData();
      fd.append("_", "");
      return axios.post(url, fd, {
        headers: { token, Authorization: `Bearer ${token}` },
        timeout: 30000,
      });
    },
    // Fallback: empty JSON body (some servers accept it)
    (url) =>
      axios.post(
        url,
        {},
        {
          headers: { token, Authorization: `Bearer ${token}` },
          timeout: 30000,
        }
      ),
  ];

  let lastNetworkErr;
  let lastErrorPayload;

  for (const p of paths) {
    const urls = [`${base}${p}`, `${baseNoApi}${p}`];

    for (const url of urls) {
      for (const run of attempts) {
        try {
          const res = await run(url);

          const data = res?.data ?? {};

          if (!isAdminApiErrorPayload(data)) {
            return res;
          }

          if (isAdminApiAuthError(data)) {
            const err = new Error(data.message || "Unauthorized");
            err.isAuthError = true;
            err.adminPayload = data;
            throw err;
          }

          lastErrorPayload = data;
        } catch (e) {
          if (e.isAuthError) throw e;

          const st = e?.response?.status;
          if (st === 401 || st === 403) {
            throw e;
          }
          lastNetworkErr = e;
        }
      }
    }
  }

  if (lastErrorPayload) {
    const err = new Error(
      lastErrorPayload.message || "Could not delete program"
    );
    err.adminPayload = lastErrorPayload;
    throw err;
  }

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
