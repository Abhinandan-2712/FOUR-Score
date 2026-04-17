"use client";

import { useEffect, useMemo, useState } from "react";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCalendar,
} from "react-icons/hi";
import { FaHeartbeat, FaLeaf } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import Link from "next/link";
import { FormSection, lbl, choiceChip } from "./FormSection";

/** Matches “Fitness Programs — Four Score (For team)” PDF: Foundations template pp. 8–11 + catalog p.1 */
/** Tab labels mirror PDF section names (Foundations template). */
const TABS = [
  { id: "overview", label: "Copy & quick stats" },
  { id: "schedule", label: "Part 1 · Logic grid" },
  { id: "workouts", label: "Part 2 · Library" },
  { id: "recovery", label: "Part 3 · Recovery" },
];

/** One-line hint per wizard step (add program) */
const STEP_HINTS = [
  "Title, overview, bullets, goal & quick stats.",
  "Fill the week × day grid (Mon–Sun).",
  "Exercises for Workout A, B & C with tags.",
  "LISS + stretches + developer note — then save.",
];

const TAB_IDS = TABS.map((t) => t.id);

function tabIndex(id) {
  return TAB_IDS.indexOf(id);
}

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const TAG_OPTIONS = ["Large Muscle", "Primary Strength", "Accessory", "Core"];

function tabBtn(active, locked) {
  if (locked) {
    return "flex-shrink-0 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-medium whitespace-nowrap opacity-45 cursor-not-allowed text-[#94a3b8] border border-transparent";
  }
  return `flex-shrink-0 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
    active
      ? "bg-white text-[#0A3161] shadow-sm border border-[#C8D7E9]"
      : "text-[#2158A3] border border-transparent hover:bg-white/70"
  }`;
}

function validateOverviewStep(d) {
  if (!d?.title?.trim() || !d?.subHeader?.trim() || !d?.overview?.trim()) {
    return "Program name, Sub-header, and Overview are required.";
  }
  if (!d?.level?.trim()) {
    return "Level is required.";
  }
  const w = Number(d.durationWeeks);
  const f = Number(d.frequencyPerWeek);
  const a = Number(d.avgSessionMinutes);
  if (Number.isNaN(w) || w < 1 || Number.isNaN(f) || f < 1 || Number.isNaN(a) || a < 1) {
    return "Enter valid duration, days per week, and avg. session (numbers ≥ 1).";
  }
  return null;
}

/** PDF flow: only step 1 is required before Next; Parts 1–3 can be filled as you go (API validation later). */
function validateScheduleStep() {
  return null;
}

function validateWorkoutsStep() {
  return null;
}

export default function FitnessProgramEditorForm({
  draft,
  setDraft,
  isSaving,
  onCancel,
  onSave,
  saveLabel = "Save",
  /** Add-program flow: Overview → Schedule → Workouts → Recovery in order */
  wizardMode = false,
}) {
  const [activeTab, setActiveTab] = useState("overview");
  /** Highest tab index (0–3) the user may open; unlocked by Next */
  const [furthestStep, setFurthestStep] = useState(0);
  const [isAdvancing, setIsAdvancing] = useState(false);

  const currentIdx = tabIndex(activeTab);

  useEffect(() => {
    // Clear the "advance" latch once the UI has moved.
    if (isAdvancing) setIsAdvancing(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const goToTab = (id) => {
    const idx = tabIndex(id);
    if (idx < 0) return;
    if (wizardMode && idx > furthestStep) {
      toast.error("Complete the current step and tap “Next” before opening this tab.", {
        id: "fitness-program-wizard-lock",
      });
      return;
    }
    setActiveTab(id);
  };

  const validateCurrentAndGoNext = () => {
    if (!draft) return;
    if (isAdvancing) return;
    setIsAdvancing(true);
    const idx = currentIdx;
    let err = null;
    if (idx === 0) err = validateOverviewStep(draft);
    else if (idx === 1) err = validateScheduleStep();
    else if (idx === 2) err = validateWorkoutsStep();
    if (err) {
      toast.error(err, { id: "fitness-program-wizard-next-error" });
      setIsAdvancing(false);
      return;
    }
    if (idx < TAB_IDS.length - 1) {
      const nextIdx = idx + 1;
      setFurthestStep((f) => Math.max(f, nextIdx));
      setActiveTab(TAB_IDS[nextIdx]);
    }
  };

  const goToPrevious = () => {
    if (currentIdx > 0) {
      setActiveTab(TAB_IDS[currentIdx - 1]);
    }
  };

  const nextButtonText = useMemo(() => {
    if (!wizardMode || currentIdx >= TAB_IDS.length - 1) return "Next";
    const labels = ["Next — 4-week schedule", "Next — Workouts A / B / C", "Next — Recovery"];
    return labels[currentIdx] ?? "Next";
  }, [wizardMode, currentIdx]);

  const lissOptionChips = useMemo(() => {
    if (!draft?.recovery?.lissOptions) return [];
    return draft.recovery.lissOptions
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }, [draft?.recovery?.lissOptions]);

  const updateScheduleCell = (weekIndex, key, value) => {
    setDraft((d) => {
      if (!d) return d;
      const next = [...d.schedule];
      next[weekIndex] = { ...next[weekIndex], [key]: value };
      return { ...d, schedule: next };
    });
  };

  const updateWorkoutExercise = (letter, index, field, value) => {
    setDraft((d) => {
      if (!d) return d;
      const list = [...d.workouts[letter]];
      list[index] = { ...list[index], [field]: value };
      return {
        ...d,
        workouts: { ...d.workouts, [letter]: list },
      };
    });
  };

  const updateStretch = (index, field, value) => {
    setDraft((d) => {
      if (!d) return d;
      const stretches = [...d.recovery.stretches];
      stretches[index] = { ...stretches[index], [field]: value };
      return { ...d, recovery: { ...d.recovery, stretches } };
    });
  };

  const removeStretch = (index) => {
    setDraft((d) => {
      if (!d || d.recovery.stretches.length <= 1) return d;
      const stretches = d.recovery.stretches.filter((_, i) => i !== index);
      return { ...d, recovery: { ...d.recovery, stretches } };
    });
  };

  const addStretch = () => {
    setDraft((d) => {
      if (!d) return d;
      return {
        ...d,
        recovery: {
          ...d.recovery,
          stretches: [...d.recovery.stretches, { name: "", detail: "" }],
        },
      };
    });
  };

  const ta =
    "w-full rounded-xl border border-[#C8D7E9] bg-white px-3.5 py-2.5 text-sm text-[#0A3161] outline-none focus:ring-2 focus:ring-[#0A3161]/25 resize-y";
  const inp =
    "h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm text-[#0A3161] shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/25";

  if (!draft) return null;

  return (
    <>
      {wizardMode && (
        <div className="mt-6 rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
          <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between sm:gap-4 border-b border-[#E8EEF4] bg-[#FAFCFF]/80">
            <ol className="flex flex-wrap items-center gap-x-1 gap-y-2 text-[13px] text-[#5671A6]">
              {[
                "Copy & stats",
                "Schedule",
                "Workouts",
                "Recovery",
              ].map((label, i) => (
                <li key={label} className="flex items-center">
                  <span
                    className={`inline-flex h-8 min-w-[2rem] items-center justify-center rounded-full text-xs font-bold ${
                      i === currentIdx
                        ? "bg-[#0A3161] text-white ring-2 ring-[#0A3161]/20"
                        : i < currentIdx
                          ? "bg-emerald-500/15 text-emerald-800"
                          : "bg-[#E8EEF4] text-[#94a3b8]"
                    }`}
                  >
                    {i + 1}
                  </span>
                  <span
                    className={`ml-2 mr-1 max-[380px]:max-w-[76px] max-[380px]:truncate sm:max-w-none ${
                      i === currentIdx ? "font-semibold text-[#0A3161]" : ""
                    }`}
                  >
                    {label}
                  </span>
                  {i < 3 && <span className="mx-1 text-[#C8D7E9] hidden sm:inline">→</span>}
                </li>
              ))}
            </ol>
            <p className="text-xs text-[#5671A6] sm:text-right sm:max-w-xs">
              <Link href="/fitness-programs/reference" className="text-[#2158A3] font-medium underline underline-offset-2">
                PDF reference
              </Link>
            </p>
          </div>
          <div className="px-4 py-3 sm:px-5">
            <p className="text-sm text-[#2158A3]">
              <span className="font-semibold text-[#0A3161]">Step {currentIdx + 1} of 4</span>
              <span className="text-[#5671A6]"> — {STEP_HINTS[currentIdx]}</span>
            </p>
          </div>
        </div>
      )}

      <div className="mt-4 flex overflow-x-auto pb-1 gap-2 rounded-xl border border-[#C8D7E9] bg-[#F2F5FA] p-2">
        {TABS.map((t, i) => {
          const locked = wizardMode && i > furthestStep;
          const tabTitles = [
            "Program copy & quick stats",
            "Part 1 — 4-week schedule grid",
            "Part 2 — Workouts A, B, C",
            "Part 3 — Recovery + implementation note",
          ];
          return (
            <button
              key={t.id}
              type="button"
              title={locked ? "Complete the previous step with Next first" : tabTitles[i]}
              onClick={() => goToTab(t.id)}
              disabled={locked}
              className={`${tabBtn(activeTab === t.id, locked)} shrink-0`}
            >
              {t.label}
            </button>
          );
        })}
      </div>

      <div className="mt-6 rounded-2xl border border-[#C8D7E9] bg-white shadow-md overflow-hidden">
        <div className="p-6 md:p-8 min-h-[280px] bg-[linear-gradient(180deg,#FAFCFF_0%,#FFFFFF_35%)]">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-6xl">
              <p className="text-sm text-[#5671A6] -mt-1 leading-relaxed border-l-4 border-[#2158A3]/35 pl-4">
                {wizardMode ? (
                  <>
                    Section order matches the PDF: marketing copy first, then{" "}
                    <span className="font-medium text-[#2158A3]">Quick Stats for the App UI</span>, then Parts 1–3 in
                    the following tabs.
                  </>
                ) : (
                  <>
                    Program copy and stats for the member app — align with the{" "}
                    <span className="font-medium text-[#2158A3]">Fitness Programs (For team)</span> PDF where applicable.
                  </>
                )}
              </p>
              <FormSection
                title="Program Title & Sub-header"
                hint="As on the PDF: title line and sub-header under the program name."
                icon={<HiOutlineDocumentText />}
                tone="sky"
              >
                <div>
                  <label className={lbl}>
                    Program Title <span className="text-red-500 normal-case">*</span>
                  </label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className={`mt-1.5 ${inp}`}
                    placeholder="e.g. 28-Day Full Body Foundations"
                  />
                </div>
                <div>
                  <label className={lbl}>
                    Sub-header <span className="text-red-500 normal-case">*</span>
                  </label>
                  <Input
                    value={draft.subHeader}
                    onChange={(e) => setDraft({ ...draft, subHeader: e.target.value })}
                    className={`mt-1.5 ${inp}`}
                    placeholder="e.g. Build your base. Master the moves. Start your journey."
                  />
                </div>
              </FormSection>

              <FormSection
                title="The Overview"
                hint="PDF section heading: main intro paragraph(s)."
                icon={<HiOutlineDocumentText />}
                tone="sky"
              >
                <div>
                  <label className={lbl}>
                    Body copy <span className="text-red-500 normal-case">*</span>
                  </label>
                  <textarea
                    rows={6}
                    value={draft.overview}
                    onChange={(e) => setDraft({ ...draft, overview: e.target.value })}
                    className={`mt-1.5 ${ta} min-h-[140px]`}
                    placeholder="Ready to start your fitness journey but not sure where to begin? …"
                  />
                </div>
              </FormSection>

              <FormSection
                title="What’s Inside"
                hint="PDF: bullet list — one line per bullet (use ● or plain lines)."
                icon={<HiOutlineClipboardList />}
                tone="violet"
              >
                <textarea
                  rows={4}
                  value={draft.whatsInside}
                  onChange={(e) => setDraft({ ...draft, whatsInside: e.target.value })}
                  className={ta}
                  placeholder={"● 3 Strength Days: …\n● 2 Active Recovery Days: …"}
                />
              </FormSection>

              <FormSection
                title="Is This For You?"
                hint="PDF: audience bullets."
                icon={<HiOutlineClipboardList />}
                tone="violet"
              >
                <textarea
                  rows={4}
                  value={draft.isThisForYou}
                  onChange={(e) => setDraft({ ...draft, isThisForYou: e.target.value })}
                  className={ta}
                  placeholder="● New to the gym? …"
                />
              </FormSection>

              <FormSection
                title="The Goal"
                hint="PDF: closing outcome paragraph."
                icon={<HiOutlineClipboardList />}
                tone="violet"
              >
                <textarea
                  rows={3}
                  value={draft.theGoal}
                  onChange={(e) => setDraft({ ...draft, theGoal: e.target.value })}
                  className={ta}
                  placeholder="By the end of the program…"
                />
              </FormSection>

              <FormSection
                title="Quick Stats for the App UI"
                hint="PDF list: Level, Duration, Frequency, Avg. Session, Location Tag, Necessary Equipment, Note — plus admin Status."
                icon={<HiOutlineChartBar />}
                tone="emerald"
              >
                <div>
                  <label className={lbl}>
                    Level (workout skill level) <span className="text-red-500 normal-case">*</span>
                  </label>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {LEVEL_OPTIONS.map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={choiceChip(draft.level === opt)}
                        onClick={() => setDraft({ ...draft, level: opt })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid gap-4 sm:grid-cols-3">
                  <div>
                    <label className={lbl}>Duration</label>
                    <p className="text-xs text-[#5671A6] mt-0.5 mb-1">Weeks (PDF: e.g. 4 Weeks)</p>
                    <Input
                      type="number"
                      min={1}
                      value={draft.durationWeeks}
                      onChange={(e) => setDraft({ ...draft, durationWeeks: Number(e.target.value) || 1 })}
                      className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Days / week (numeric)</label>
                    <p className="text-xs text-[#5671A6] mt-0.5 mb-1">For filters; pair with Frequency line below.</p>
                    <Input
                      type="number"
                      min={1}
                      value={draft.frequencyPerWeek}
                      onChange={(e) => setDraft({ ...draft, frequencyPerWeek: Number(e.target.value) || 1 })}
                      className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Avg. Session</label>
                    <p className="text-xs text-[#5671A6] mt-0.5 mb-1">Minutes (PDF: e.g. 35 Minutes)</p>
                    <Input
                      type="number"
                      min={1}
                      value={draft.avgSessionMinutes}
                      onChange={(e) => setDraft({ ...draft, avgSessionMinutes: Number(e.target.value) || 1 })}
                      className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    />
                  </div>
                </div>
                <div>
                  <label className={lbl}>Frequency</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">
                    Single line for the app (PDF: “5 Days/Week (3 Strength, 2 Recovery)”).
                  </p>
                  <Input
                    value={draft.frequencyCaption ?? ""}
                    onChange={(e) => setDraft({ ...draft, frequencyCaption: e.target.value })}
                    className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    placeholder="5 Days/Week (3 Strength, 2 Recovery)"
                  />
                </div>
                <div>
                  <label className={lbl}>Location Tag</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">e.g. “Workout From Home (Friendly)”</p>
                  <Input
                    value={draft.locationTag}
                    onChange={(e) => setDraft({ ...draft, locationTag: e.target.value })}
                    className={`mt-1.5 h-11 rounded-lg border border-[#C8D7E9]`}
                    placeholder="🏠 Workout From Home (Friendly)"
                  />
                </div>
                <div>
                  <label className={lbl}>Necessary equipment</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">PDF: bullet list — one item per line.</p>
                  <textarea
                    rows={4}
                    value={draft.equipment}
                    onChange={(e) => setDraft({ ...draft, equipment: e.target.value })}
                    className={ta}
                    placeholder="Bodyweight (Primary)…"
                  />
                </div>
                <div>
                  <label className={lbl}>Note</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">
                    Under equipment in the PDF (e.g. zero-barrier / no gym required).
                  </p>
                  <Input
                    value={draft.equipmentNote ?? ""}
                    onChange={(e) => setDraft({ ...draft, equipmentNote: e.target.value })}
                    className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    placeholder="No gym membership required…"
                  />
                </div>
                <div>
                  <label className={lbl}>Status</label>
                  <div className="mt-2 flex flex-wrap gap-2 max-w-md">
                    {["Active", "Inactive"].map((opt) => (
                      <button
                        key={opt}
                        type="button"
                        className={choiceChip(draft.status === opt)}
                        onClick={() => setDraft({ ...draft, status: opt })}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              </FormSection>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4 w-full">
              <p className="text-sm text-[#5671A6] -mt-1 w-full max-w-none leading-relaxed">
                <span className="font-medium text-[#2158A3]">Part 1: The 4-week logic grid</span> — PDF: set global
                rules for what the user sees each day. The app iterates sets/reps by week while keeping exercise lists
                constant for the block.
              </p>
              <FormSection
                title="The 4-Week Logic Grid"
                hint="PDF Part 1 — Mon (Legs), Tue recovery, Wed (Upper), Thu recovery, Fri (Full body), Sat/Sun."
                icon={<HiOutlineCalendar />}
                tone="slate"
              >
                <p className="text-xs text-[#5671A6] -mt-1 mb-1">
                  Scroll horizontally on small screens. Week column stays pinned while you edit.
                </p>
                <div className="overflow-x-auto rounded-xl border border-[#C8D7E9] bg-[#FAFCFF]/40 shadow-inner">
                  <Table className="min-w-[720px]">
                    <TableHeader>
                      <TableRow className="bg-[#F2F5FA] hover:bg-[#F2F5FA] border-b border-[#D9E8F5]">
                        <TableHead className="sticky left-0 z-20 w-14 min-w-[3.5rem] bg-[#F2F5FA] px-2 py-3 text-[#2158A3] font-semibold shadow-[2px_0_0_0_#E8EEF4]">
                          Wk
                        </TableHead>
                        {[
                          { key: "mon", line: "Mon", sub: "Legs", kind: "strength" },
                          { key: "tue", line: "Tue", sub: "Recovery", kind: "recovery" },
                          { key: "wed", line: "Wed", sub: "Upper", kind: "strength" },
                          { key: "thu", line: "Thu", sub: "Recovery", kind: "recovery" },
                          { key: "fri", line: "Fri", sub: "Full", kind: "strength" },
                          { key: "weekend", line: "Sat / Sun", sub: "Rest", kind: "rest" },
                        ].map((col) => (
                          <TableHead
                            key={col.key}
                            className="min-w-[128px] px-2 py-3 text-[#2158A3] font-semibold align-bottom"
                          >
                            <span className="block text-sm leading-tight">{col.line}</span>
                            <span
                              className={`mt-0.5 inline-flex rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${
                                col.kind === "recovery"
                                  ? "bg-emerald-100/90 text-emerald-900"
                                  : col.kind === "rest"
                                    ? "bg-slate-200/80 text-slate-700"
                                    : "bg-sky-100/90 text-sky-900"
                              }`}
                            >
                              {col.sub}
                            </span>
                          </TableHead>
                        ))}
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {draft.schedule.map((row, wi) => (
                        <TableRow
                          key={row.week}
                          className="border-b border-[#E8EEF4] last:border-0 hover:bg-white/90"
                        >
                          <TableCell className="sticky left-0 z-10 bg-[#F8FAFC] px-2 py-2 font-semibold text-[#0A3161] align-middle shadow-[2px_0_0_0_#E8EEF4]">
                            W{row.week}
                          </TableCell>
                          {["mon", "tue", "wed", "thu", "fri", "weekend"].map((col) => (
                            <TableCell key={col} className="p-2 align-middle whitespace-normal">
                              <Input
                                value={row[col]}
                                onChange={(e) => updateScheduleCell(wi, col, e.target.value)}
                                className="h-10 text-xs border-[#C8D7E9] bg-white rounded-lg shadow-sm"
                              />
                            </TableCell>
                          ))}
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </FormSection>
            </div>
          )}

          {activeTab === "workouts" && (
            <div className="space-y-6 max-w-6xl">
              <p className="text-sm text-[#5671A6] -mt-1 w-full max-w-none leading-relaxed">
                <span className="font-medium text-[#2158A3]">Part 2: The workout library</span> — PDF: tag workouts
                to specific days. Three templates — Workout A (e.g. Monday legs), B (Wednesday upper), C (Friday full
                body). Use movement tags (Large Muscle, Primary Strength, etc.).
              </p>
              {["A", "B", "C"].map((letter) => {
                const label =
                  letter === "A"
                    ? "Workout A — Beginner Legs (Monday)"
                    : letter === "B"
                      ? "Workout B — Beginner Upper (Wednesday)"
                      : "Workout C — Beginner Full Body (Friday)";
                const tone = letter === "A" ? "sky" : letter === "B" ? "violet" : "emerald";
                return (
                  <FormSection
                    key={letter}
                    title={label}
                    hint="PDF: workout name and tag in parentheses, e.g. Goblet Squat (Large Muscle)."
                    icon={
                      <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#0A3161] text-xs font-bold text-white shadow-sm">
                        {letter}
                      </span>
                    }
                    tone={tone}
                  >
                    <div className="overflow-hidden rounded-xl border border-[#C8D7E9] bg-white shadow-sm">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-[#F2F5FA] hover:bg-[#F2F5FA] border-b border-[#D9E8F5]">
                            <TableHead className="w-14 px-2 py-3 text-[#2158A3] font-semibold">#</TableHead>
                            <TableHead className="min-w-[180px] px-2 py-3 text-[#2158A3] font-semibold">
                              Workout
                            </TableHead>
                            <TableHead className="w-[min(240px,45vw)] px-2 py-3 text-[#2158A3] font-semibold">
                              Tag
                            </TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {draft.workouts[letter].map((ex, i) => {
                            const tagChoices =
                              ex.tag && !TAG_OPTIONS.includes(ex.tag)
                                ? [ex.tag, ...TAG_OPTIONS]
                                : TAG_OPTIONS;
                            return (
                              <TableRow
                                key={`${letter}-${i}`}
                                className="border-b border-[#EEF2F7] last:border-0 hover:bg-[#FAFCFF]/70"
                              >
                                <TableCell className="px-2 py-2 align-middle">
                                  <span className="inline-flex h-8 min-w-[2rem] items-center justify-center rounded-lg bg-[#E8EEF4] text-xs font-bold text-[#0A3161]">
                                    {letter}
                                    {i + 1}
                                  </span>
                                </TableCell>
                                <TableCell className="p-2 align-middle">
                                  <Input
                                    value={ex.name}
                                    onChange={(e) => updateWorkoutExercise(letter, i, "name", e.target.value)}
                                    className="h-10 border-[#C8D7E9] bg-white rounded-lg text-sm"
                                  />
                                </TableCell>
                                <TableCell className="p-2 align-middle">
                                  <select
                                    value={ex.tag}
                                    onChange={(e) => updateWorkoutExercise(letter, i, "tag", e.target.value)}
                                    className="h-10 w-full rounded-lg border border-[#C8D7E9] bg-white px-3 text-sm text-[#0A3161] outline-none focus:ring-2 focus:ring-[#0A3161]/25"
                                  >
                                    {tagChoices.map((t) => (
                                      <option key={t} value={t}>
                                        {t}
                                      </option>
                                    ))}
                                  </select>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </FormSection>
                );
              })}
            </div>
          )}

          {activeTab === "recovery" && (
            <div className="space-y-4 w-full max-w-6xl">
              <p className="text-sm text-[#5671A6] -mt-2 mb-2 w-full max-w-none leading-relaxed">
                <span className="font-medium text-[#2158A3]">Part 3: Active recovery protocol (Tue / Thu)</span> — PDF:
                two blocks for recovery days — Block 1 LISS cardio (duration, prompt, options), then Block 2 “Big 4”
                stretches in order.
              </p>
              <p className="text-sm text-[#5671A6] mb-2">
                Flow: <span className="font-medium text-[#2158A3]">LISS first</span>, then{" "}
                <span className="font-medium text-[#2158A3]">stretches in order</span>.
              </p>

              <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
                <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden h-full">
                  <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-sky-50 via-white to-emerald-50/80 border-b border-[#D9E8F5]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
                      <FaHeartbeat className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0A3161]">Block 1: LISS cardio (PDF)</h3>
                    <p className="text-xs text-[#5671A6]">PDF: duration, prompt, activity options (e.g. Brisk Walk, …)</p>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 space-y-5">
                    <div className="flex flex-wrap items-end gap-4">
                      <div>
                        <label className={lbl}>Duration</label>
                        <div className="mt-1.5 flex items-center gap-2">
                          <Input
                            type="number"
                            min={1}
                            value={draft.recovery.lissMinutes}
                            onChange={(e) =>
                              setDraft({
                                ...draft,
                                recovery: {
                                  ...draft.recovery,
                                  lissMinutes: Number(e.target.value) || 1,
                                },
                              })
                            }
                            className="h-12 w-24 text-center text-lg font-semibold text-[#0A3161] border-[#C8D7E9] rounded-xl"
                          />
                          <span className="text-sm font-medium text-[#2158A3] pb-1">minutes</span>
                        </div>
                      </div>
                    </div>
                    <div>
                      <label className={lbl}>Coach prompt</label>
                      <textarea
                        rows={3}
                        value={draft.recovery.lissPrompt}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            recovery: { ...draft.recovery, lissPrompt: e.target.value },
                          })
                        }
                        className={`mt-1.5 ${ta}`}
                        placeholder="How hard should it feel?"
                      />
                    </div>
                    <div>
                      <label className={lbl}>Activity options</label>
                      <p className="text-xs text-[#5671A6] mt-0.5 mb-2">
                        Comma-separated — preview below shows how chips may appear in the app.
                      </p>
                      <Input
                        value={draft.recovery.lissOptions}
                        onChange={(e) =>
                          setDraft({
                            ...draft,
                            recovery: { ...draft.recovery, lissOptions: e.target.value },
                          })
                        }
                        className="h-11 border-[#C8D7E9] rounded-xl bg-white"
                        placeholder="Brisk Walk, Incline Treadmill, …"
                      />
                      {lissOptionChips.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-2">
                          {lissOptionChips.map((opt) => (
                            <span
                              key={opt}
                              className="inline-flex items-center rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-xs font-medium text-sky-900"
                            >
                              {opt}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden h-full">
                  <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 border-b border-[#E5EDE5]">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-sm">
                      <FaLeaf className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-semibold text-[#0A3161]">Block 2: The Big 4 stretches (PDF)</h3>
                      <p className="text-xs text-[#5671A6]">Ordered steps after cardio — name + detail/duration per line</p>
                    </div>
                  </div>
                  <div className="p-5 md:p-6 space-y-4">
                    {draft.recovery.stretches.map((s, i) => (
                      <div
                        key={i}
                        className="flex gap-2 sm:gap-3 rounded-xl border border-[#D4E4D4] bg-[#FAFDF8] p-3 sm:p-4 shadow-sm"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0A3161] text-xs font-bold text-white">
                          {i + 1}
                        </div>
                        <div className="grid min-w-0 flex-1 gap-3 sm:grid-cols-2">
                          <div>
                            <label className={lbl}>Stretch name</label>
                            <Input
                              value={s.name}
                              onChange={(e) => updateStretch(i, "name", e.target.value)}
                              className="mt-1.5 h-10 border-[#C8D7E9] bg-white rounded-lg"
                            />
                          </div>
                          <div>
                            <label className={lbl}>Detail / duration</label>
                            <Input
                              value={s.detail}
                              onChange={(e) => updateStretch(i, "detail", e.target.value)}
                              className="mt-1.5 h-10 border-[#C8D7E9] bg-white rounded-lg"
                              placeholder="e.g. 1m per side"
                            />
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="h-9 w-9 shrink-0 text-[#B91C1C] hover:bg-red-50 hover:text-[#991B1B] disabled:opacity-40"
                          disabled={draft.recovery.stretches.length <= 1}
                          onClick={() => removeStretch(i)}
                          aria-label="Delete stretch"
                          title={
                            draft.recovery.stretches.length <= 1
                              ? "At least one stretch required"
                              : "Delete stretch"
                          }
                        >
                          <HiOutlineTrash className="h-5 w-5" />
                        </Button>
                      </div>
                    ))}
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full border-dashed border-[#C8D7E9] text-[#2158A3] hover:bg-[#F2F5FA]"
                      onClick={addStretch}
                    >
                      + Add stretch
                    </Button>
                  </div>
                </div>
              </div>

              <FormSection
                title="Implementation note for the developer"
                hint="PDF (after Part 3): progressive overload uses the week variable; workout list stays constant for the 4-week block."
                tone="slate"
              >
                <textarea
                  rows={4}
                  value={draft.implementationNote ?? ""}
                  onChange={(e) => setDraft({ ...draft, implementationNote: e.target.value })}
                  className={ta}
                  placeholder='e.g. "The app should iterate the Sets and Reps based on the Week variable, while keeping the Exercise List constant for the 4-week block."'
                />
              </FormSection>
            </div>
          )}
        </div>

        <div className="px-4 py-4 sm:px-8 bg-[#F2F5FA] border-t border-[#E0E7F5] flex flex-col-reverse sm:flex-row sm:flex-wrap sm:items-center sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-[#C8D7E9] bg-white"
            onClick={onCancel}
            disabled={isSaving}
          >
            Cancel
          </Button>
          {wizardMode && currentIdx > 0 && (
            <Button
              type="button"
              variant="outline"
              className="border-[#C8D7E9] bg-white"
              onClick={goToPrevious}
              disabled={isSaving}
            >
              Back
            </Button>
          )}
          {wizardMode && currentIdx < TAB_IDS.length - 1 && (
            <Button
              type="button"
              className="bg-[#2158A3] hover:bg-[#1a4682] min-w-[min(100%,220px)] px-5"
              onClick={validateCurrentAndGoNext}
              disabled={isSaving || isAdvancing}
            >
              {nextButtonText}
            </Button>
          )}
          {(!wizardMode || currentIdx === TAB_IDS.length - 1) && (
            <Button
              type="button"
              className="bg-[#0A3161] hover:bg-[#0D3D7A] min-w-[140px]"
              onClick={() => onSave()}
              disabled={isSaving}
            >
              {isSaving ? "Saving…" : saveLabel}
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
