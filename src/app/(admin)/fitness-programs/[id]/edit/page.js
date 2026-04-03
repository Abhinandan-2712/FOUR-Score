"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  HiOutlineArrowLeft,
  HiOutlineTrash,
  HiOutlineDocumentText,
  HiOutlineClipboardList,
  HiOutlineChartBar,
  HiOutlineCalendar,
} from "react-icons/hi";
import { MdFitnessCenter } from "react-icons/md";
import { FaHeartbeat, FaLeaf } from "react-icons/fa";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { getProgramDetail } from "../../data";
import { FormSection, lbl, choiceChip } from "../../components/FormSection";

const TABS = [
  { id: "overview", label: "Overview" },
  { id: "schedule", label: "4-week schedule" },
  { id: "workouts", label: "Workouts A / B / C" },
  { id: "recovery", label: "Recovery" },
];

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];
const TAG_OPTIONS = ["Large Muscle", "Primary Strength", "Accessory", "Core"];

function tabBtn(active) {
  return `flex-shrink-0 rounded-lg px-3 sm:px-4 py-2.5 text-sm font-medium transition-all whitespace-nowrap ${
    active
      ? "bg-white text-[#0A3161] shadow-sm border border-[#C8D7E9]"
      : "text-[#2158A3] border border-transparent hover:bg-white/70"
  }`;
}

export default function EditFitnessProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [activeTab, setActiveTab] = useState("overview");
  const [draft, setDraft] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const p = getProgramDetail(id);
    setDraft(p ? JSON.parse(JSON.stringify(p)) : null);
    setLoaded(true);
  }, [id]);

  const titleLine = useMemo(() => draft?.title || "Program", [draft]);

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

  const handleSave = async () => {
    if (!draft?.title?.trim() || !draft?.overview?.trim()) {
      toast.error("Title and Overview are required.");
      return;
    }
    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 450));
    try {
      toast.success("Program updated (UI only — no API).");
    } finally {
      setIsSaving(false);
    }
  };

  const ta =
    "w-full rounded-xl border border-[#C8D7E9] bg-white px-3.5 py-2.5 text-sm text-[#0A3161] outline-none focus:ring-2 focus:ring-[#0A3161]/25 resize-y";
  const inp =
    "h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm text-[#0A3161] shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/25";

  if (!loaded) {
    return (
      <div className="min-h-[50vh] py-12 px-4 max-w-5xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-10 bg-slate-200 rounded w-1/3" />
          <div className="h-12 bg-slate-200 rounded" />
          <div className="h-40 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!draft) {
    return (
      <div className="min-h-[50vh] py-16 px-4 text-center max-w-lg mx-auto">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white p-8 shadow-sm">
          <p className="text-[#2158A3] mb-2 font-medium">Program not found</p>
          <p className="text-sm text-[#5671A6] mb-6">This ID is not in the preview data.</p>
          <Button className="bg-[#0A3161] hover:bg-[#0D3D7A]" onClick={() => router.push("/fitness-programs")}>
            Back to programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8 px-1  mx-auto">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-4 min-w-0">
          <button
            type="button"
            onClick={() => router.push("/fitness-programs")}
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#F2F5FA] transition-colors shadow-sm"
            aria-label="Back"
          >
            <HiOutlineArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex items-center gap-3 min-w-0">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A3161] text-white shadow-md">
              <MdFitnessCenter className="h-6 w-6" />
            </div>
            <div className="min-w-0">
              <h1 className="text-xl font-semibold text-[#0A3161] leading-6 truncate">{titleLine}</h1>
              <p className="text-sm text-[#2158A3] truncate">
                Edit program · <span className="font-mono text-xs text-[#5671A6]">{id}</span>
              </p>
            </div>
          </div>
        </div>
        <span className="inline-flex self-start lg:self-center items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          UI preview
        </span>
      </div>

      <div className="mt-6 flex overflow-x-auto pb-1 -mx-1 px-1 gap-1 p-1.5 rounded-xl bg-[#E8EEF4] border border-[#C8D7E9]">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            onClick={() => setActiveTab(t.id)}
            className={tabBtn(activeTab === t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-6 rounded-2xl border border-[#C8D7E9] bg-white shadow-md overflow-hidden">
        <div className="p-6 md:p-8 min-h-[280px] bg-[linear-gradient(180deg,#FAFCFF_0%,#FFFFFF_35%)]">
          {activeTab === "overview" && (
            <div className="space-y-6 max-w-6xl">
              <p className="text-sm text-[#5671A6] -mt-1">
                Core copy and stats for this program — matches what members see before they start.
              </p>
              <FormSection
                title="Program content"
                hint="Same fields as Add program — shown on the program screen in the app."
                icon={<HiOutlineDocumentText />}
                tone="sky"
              >
                <div>
                  <label className={lbl}>
                    Program title <span className="text-red-500 normal-case">*</span>
                  </label>
                  <Input
                    value={draft.title}
                    onChange={(e) => setDraft({ ...draft, title: e.target.value })}
                    className={`mt-1.5 ${inp}`}
                  />
                </div>
                <div>
                  <label className={lbl}>Sub-header</label>
                  <Input
                    value={draft.subHeader}
                    onChange={(e) => setDraft({ ...draft, subHeader: e.target.value })}
                    className={`mt-1.5 ${inp}`}
                  />
                </div>
                <div>
                  <label className={lbl}>
                    Overview <span className="text-red-500 normal-case">*</span>
                  </label>
                  <textarea
                    rows={5}
                    value={draft.overview}
                    onChange={(e) => setDraft({ ...draft, overview: e.target.value })}
                    className={`mt-1.5 ${ta} min-h-[120px]`}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Additional sections"
                hint="Optional bullets — one line per bullet where applicable."
                icon={<HiOutlineClipboardList />}
                tone="violet"
              >
                <div>
                  <label className={lbl}>What&apos;s inside</label>
                  <textarea
                    rows={4}
                    value={draft.whatsInside}
                    onChange={(e) => setDraft({ ...draft, whatsInside: e.target.value })}
                    className={`mt-1.5 ${ta}`}
                  />
                </div>
                <div>
                  <label className={lbl}>Is this for you?</label>
                  <textarea
                    rows={4}
                    value={draft.isThisForYou}
                    onChange={(e) => setDraft({ ...draft, isThisForYou: e.target.value })}
                    className={`mt-1.5 ${ta}`}
                  />
                </div>
                <div>
                  <label className={lbl}>The goal</label>
                  <textarea
                    rows={3}
                    value={draft.theGoal}
                    onChange={(e) => setDraft({ ...draft, theGoal: e.target.value })}
                    className={`mt-1.5 ${ta}`}
                  />
                </div>
              </FormSection>

              <FormSection
                title="Quick stats & metadata"
                hint="Badges, duration, and filters — used in lists and the program header."
                icon={<HiOutlineChartBar />}
                tone="emerald"
              >
                <div>
                  <label className={lbl}>Level</label>
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
                    <label className={lbl}>Duration (weeks)</label>
                    <Input
                      type="number"
                      min={1}
                      value={draft.durationWeeks}
                      onChange={(e) => setDraft({ ...draft, durationWeeks: Number(e.target.value) || 1 })}
                      className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Days / week</label>
                    <Input
                      type="number"
                      min={1}
                      value={draft.frequencyPerWeek}
                      onChange={(e) => setDraft({ ...draft, frequencyPerWeek: Number(e.target.value) || 1 })}
                      className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    />
                  </div>
                  <div>
                    <label className={lbl}>Avg. session (min)</label>
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
                  <label className={lbl}>Frequency (app display line)</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">PDF “Quick stats” — e.g. 3 strength + 2 recovery.</p>
                  <Input
                    value={draft.frequencyCaption ?? ""}
                    onChange={(e) => setDraft({ ...draft, frequencyCaption: e.target.value })}
                    className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                    placeholder="5 days/week (3 strength, 2 recovery)"
                  />
                </div>
                <div>
                  <label className={lbl}>Location tag</label>
                  <Input
                    value={draft.locationTag}
                    onChange={(e) => setDraft({ ...draft, locationTag: e.target.value })}
                    className={`mt-1.5 h-11 rounded-lg border border-[#C8D7E9]`}
                  />
                </div>
                <div>
                  <label className={lbl}>Equipment</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">One item per line.</p>
                  <textarea
                    rows={4}
                    value={draft.equipment}
                    onChange={(e) => setDraft({ ...draft, equipment: e.target.value })}
                    className={ta}
                  />
                </div>
                <div>
                  <label className={lbl}>Equipment note</label>
                  <p className="text-xs text-[#5671A6] mt-0.5 mb-1">Short PDF line under equipment (e.g. zero-barrier).</p>
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

              <FormSection
                title="Implementation note (PDF)"
                hint="Shown in admin view as developer hand-off — week vs exercise list logic."
                tone="slate"
              >
                <textarea
                  rows={3}
                  value={draft.implementationNote ?? ""}
                  onChange={(e) => setDraft({ ...draft, implementationNote: e.target.value })}
                  className={ta}
                  placeholder="Progressive overload note from PDF…"
                />
              </FormSection>
            </div>
          )}

          {activeTab === "schedule" && (
            <div className="space-y-4 max-w-[100%]">
              <FormSection
                title="4-week progression grid"
                hint="Mon / Wed / Fri are strength templates; Tue / Thu are recovery. Edit copy per cell — the app can use week index for progressive overload."
                icon={<HiOutlineCalendar />}
                tone="slate"
              >
                <p className="text-xs text-[#5671A6] -mt-1 mb-1">
                  Scroll horizontally on small screens. Week column stays visible while you edit.
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
              <p className="text-sm text-[#5671A6] -mt-1">
                Three strength templates (A / B / C). Order matches the schedule: legs, upper, full body.
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
                    hint="Exercise name and movement tag — used for logging and coaching cues."
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
                              Exercise
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
              <p className="text-sm text-[#5671A6] -mt-2 mb-2">
                Recovery day flow: <span className="font-medium text-[#2158A3]">LISS first</span>, then{" "}
                <span className="font-medium text-[#2158A3]">stretches in order</span>.
              </p>

              <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
              {/* Block 1 — LISS */}
              <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden h-full">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-sky-50 via-white to-emerald-50/80 border-b border-[#D9E8F5]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
                    <FaHeartbeat className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0A3161]">Block 1 — LISS cardio</h3>
                    <p className="text-xs text-[#5671A6]">Low-intensity steady state · typical days: Tue / Thu</p>
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

              {/* Block 2 — Stretches */}
              <div className="flex-1 min-w-0 flex flex-col rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden h-full">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 border-b border-[#E5EDE5]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-sm">
                    <FaLeaf className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-[#0A3161]">Block 2 — Stretch routine</h3>
                    <p className="text-xs text-[#5671A6]">Ordered steps after cardio · “Big 4” style list</p>
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
                        title={draft.recovery.stretches.length <= 1 ? "At least one stretch required" : "Delete stretch"}
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
            </div>
          )}
        </div>

        <div className="px-6 py-4 md:px-8 bg-[#F2F5FA] border-t border-[#E0E7F5] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-[#C8D7E9] bg-white"
            onClick={() => router.push("/fitness-programs")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#0A3161] hover:bg-[#0D3D7A] min-w-[140px]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save changes"}
          </Button>
        </div>
      </div>
    </div>
  );
}
