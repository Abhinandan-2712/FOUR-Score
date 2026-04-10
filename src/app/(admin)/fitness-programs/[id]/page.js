"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowLeft } from "react-icons/hi";
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
import {
  getProgramDetail,
  MOCK_FITNESS_PROGRAMS,
  FOUNDATIONS_PROGRAM_ID,
  createEmptyProgramDetailForId,
} from "../data";
import {
  apiRowToEditorDraft,
  mapProgramFromApi,
  programCacheKey,
  programEditKey,
  fetchProgramRawById,
  coerceMultilineText,
} from "@/lib/fitnessProgramApi";

function BulletBlock({ title, text }) {
  const body = coerceMultilineText(text);
  if (!body.trim()) return null;
  const lines = body.split(/\n/).filter(Boolean);
  return (
    <div>
      <h2 className="text-sm font-semibold text-[#0A3161] mb-2">{title}</h2>
      <ul className="list-disc pl-5 space-y-1.5 text-sm text-[#2158A3] leading-relaxed">
        {lines.map((line, i) => (
          <li key={i}>{line.replace(/^[●•]\s*/, "")}</li>
        ))}
      </ul>
    </div>
  );
}

export default function ViewFitnessProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [loaded, setLoaded] = useState(false);
  const [summary, setSummary] = useState(null);
  const [detail, setDetail] = useState(null);

  useEffect(() => {
    if (!id) {
      setSummary(null);
      setDetail(null);
      setLoaded(true);
      return;
    }

    let cancelled = false;
    setLoaded(false);

    const finish = (s, d) => {
      if (cancelled) return;
      setSummary(s);
      setDetail(d);
      setLoaded(true);
    };

    try {
      const cached = sessionStorage.getItem(programCacheKey(id));
      if (cached) {
        const raw = JSON.parse(cached);
        const empty = createEmptyProgramDetailForId(id);
        const d = apiRowToEditorDraft(raw, empty);
        const s = mapProgramFromApi(raw);
        // Use cached as fast placeholder, but still fetch full detail by id.
        finish(s, d);
      }
    } catch {
      /* ignore */
    }

    (async () => {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
      if (baseUrl && token) {
        const found = await fetchProgramRawById(id, { token, baseUrl });
        if (found) {
          const empty = createEmptyProgramDetailForId(id);
          finish(mapProgramFromApi(found), apiRowToEditorDraft(found, empty));
          return;
        }
      }

      const mockSummary = MOCK_FITNESS_PROGRAMS.find((p) => p.id === id) ?? null;
      const mockDetail = getProgramDetail(id);
      finish(mockSummary, mockDetail);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const title = detail?.title ?? summary?.title ?? "Program";
  const subHeader = detail?.subHeader ?? summary?.subHeader;

  if (!loaded) {
    return (
      <div className="min-h-[40vh] py-12 px-4 max-w-3xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-slate-200 rounded w-1/2" />
          <div className="h-24 bg-slate-200 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!summary && !detail && loaded) {
    return (
      <div className="min-h-[50vh] py-16 px-4 text-center max-w-lg mx-auto">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white p-8 shadow-sm">
          <p className="text-[#2158A3] mb-2 font-medium">Program not found</p>
          <p className="text-sm text-[#5671A6] mb-6">This ID is not in the admin preview data.</p>
          <Button className="bg-[#0A3161] hover:bg-[#0D3D7A]" onClick={() => router.push("/fitness-programs")}>
            Back to programs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] py-8 px-1 mx-auto">
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
              <h1 className="text-xl font-semibold text-[#0A3161] leading-6 truncate">{title}</h1>
              <p className="text-sm text-[#2158A3] truncate">
                Admin · read-only preview
                {id === FOUNDATIONS_PROGRAM_ID ? " · PDF pages 7–11" : " · catalog row"}
              </p>
            </div>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          {/* <span className="inline-flex rounded-full border border-[#C8D7E9] bg-[#F2F5FA] px-3 py-1 text-xs font-medium text-[#0A3161]">
            Admin panel only — not the member app
          </span> */}
          <Button
            variant="outline"
            className="border-[#C8D7E9] bg-white"
            type="button"
            onClick={() => {
              try {
                const c = sessionStorage.getItem(programCacheKey(id));
                if (c) sessionStorage.setItem(programEditKey(id), c);
                else if (summary?._raw) {
                  sessionStorage.setItem(programEditKey(id), JSON.stringify(summary._raw));
                }
              } catch {
                /* ignore */
              }
              router.push(`/fitness-programs/${id}/edit`);
            }}
          >
            Edit program
          </Button>
        </div>
      </div>

      {!detail && summary && (
        <div className="mt-8 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-950">
          <p className="font-medium">Catalog entry</p>
          <p className="mt-1 text-amber-950/85">
            Full schedule / workout / recovery content for this title lives in the master PDF. In this admin preview,
            only <strong>28-Day Full Body Foundations</strong> has a complete editable payload. Use{" "}
            {/* <Link href="/fitness-programs/reference" className="underline font-medium">
              PDF: Logic &amp; catalog
            </Link>{" "} */}
            for the full thirteen-program spec.
          </p>
        </div>
      )}

      <div className="mt-8 space-y-8">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white p-6 md:p-8 shadow-sm">
          {subHeader ? <p className="text-[#2158A3] text-sm md:text-base mb-6">{subHeader}</p> : null}

          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 mb-8">
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Level</p>
              <p className="mt-1 text-sm font-medium text-[#0A3161]">{(detail ?? summary).level}</p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Duration</p>
              <p className="mt-1 text-sm font-medium text-[#0A3161]">
                {(detail ?? summary).durationWeeks} weeks
              </p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Status</p>
              <p className="mt-1 text-sm font-medium text-[#0A3161]">{(detail ?? summary).status}</p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Freq. / week</p>
              <p className="mt-1 text-sm font-medium text-[#0A3161]">
                {(detail ?? summary).frequencyPerWeek} days
                {detail?.frequencyCaption ? (
                  <span className="block text-xs font-normal text-[#5671A6] mt-1">{detail.frequencyCaption}</span>
                ) : null}
              </p>
            </div>
            <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Avg. session</p>
              <p className="mt-1 text-sm font-medium text-[#0A3161]">
                {(detail ?? summary).avgSessionMinutes} min
              </p>
            </div>
            {summary?.updatedAt && (
              <div className="rounded-xl border border-[#E8EEF4] bg-[#FAFCFF] px-4 py-3">
                <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Updated</p>
                <p className="mt-1 text-sm font-medium text-[#0A3161]">{summary.updatedAt}</p>
              </div>
            )}
          </div>

          {(detail ?? summary).locationTag && (
            <div className="mb-6">
              <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6]">Location tag</p>
              <p className="mt-1 text-sm text-[#0A3161]">{(detail ?? summary).locationTag}</p>
            </div>
          )}

          {detail?.overview && (
            <div className="mb-8">
              <h2 className="text-sm font-semibold text-[#0A3161] mb-2">Overview</h2>
              <div className="text-sm text-[#2158A3] leading-relaxed whitespace-pre-wrap">{detail.overview}</div>
            </div>
          )}

          {detail && (
            <>
              <BulletBlock title="What's inside" text={detail.whatsInside} />
              <div className="mt-6">
                <BulletBlock title="Is this for you?" text={detail.isThisForYou} />
              </div>
              <div className="mt-6">
                <h2 className="text-sm font-semibold text-[#0A3161] mb-2">The goal</h2>
                <p className="text-sm text-[#2158A3] leading-relaxed whitespace-pre-wrap">{detail.theGoal}</p>
              </div>

              <div className="mt-8">
                <h2 className="text-sm font-semibold text-[#0A3161] mb-2">Necessary equipment</h2>
                <p className="text-sm text-[#2158A3] leading-relaxed whitespace-pre-wrap">{detail.equipment}</p>
                {detail.equipmentNote ? (
                  <p className="mt-3 text-sm text-[#5671A6] italic border-l-2 border-[#C8D7E9] pl-3">
                    Note: {detail.equipmentNote}
                  </p>
                ) : null}
              </div>
            </>
          )}
        </div>

        {detail?.schedule && (
          <div className="rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
            <div className="border-b border-[#E8EEF7] bg-gradient-to-r from-slate-50 via-white to-white px-5 py-4 md:px-6">
              <h2 className="text-sm font-semibold text-[#0A3161]">Part 1: 4-week logic grid</h2>
              <p className="text-xs text-[#5671A6] mt-1">Global rules per day — PDF table.</p>
            </div>
            <div className="overflow-x-auto p-4 md:p-6">
              <Table className="min-w-[720px]">
                <TableHeader>
                  <TableRow className="bg-[#F2F5FA]">
                    <TableHead className="text-[#2158A3] font-semibold px-2">Wk</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Mon (Legs)</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Tue (Recovery)</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Wed (Upper)</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Thu (Recovery)</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Fri (Full)</TableHead>
                    <TableHead className="text-[#2158A3] font-semibold px-2">Sat / Sun</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {detail.schedule.map((row) => (
                    <TableRow key={row.week} className="border-b border-[#EEF2F7]">
                      <TableCell className="font-semibold text-[#0A3161] px-2 py-2">W{row.week}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2 whitespace-pre-wrap">{row.mon}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2">{row.tue}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2 whitespace-pre-wrap">{row.wed}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2">{row.thu}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2 whitespace-pre-wrap">{row.fri}</TableCell>
                      <TableCell className="text-sm text-[#2158A3] px-2 py-2">{row.weekend}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}

        {detail?.workouts && (
          <div className="space-y-6">
            <h2 className="text-sm font-semibold text-[#0A3161] px-1">Part 2: Exercise library (workouts A / B / C)</h2>
            {[
              { letter: "A", label: "Workout A — Beginner Legs (Monday)" },
              { letter: "B", label: "Workout B — Beginner Upper (Wednesday)" },
              { letter: "C", label: "Workout C — Beginner Full Body (Friday)" },
            ].map(({ letter, label }) => (
              <div
                key={letter}
                className="rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden"
              >
                <div className="border-b border-[#E8EEF7] bg-[#F2F5FA] px-5 py-3">
                  <p className="text-sm font-semibold text-[#0A3161]">{label}</p>
                </div>
                <div className="overflow-x-auto p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="text-[#2158A3] font-semibold">#</TableHead>
                        <TableHead className="text-[#2158A3] font-semibold">Exercise</TableHead>
                        <TableHead className="text-[#2158A3] font-semibold">Tag</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {detail.workouts[letter].map((ex, i) => (
                        <TableRow key={i}>
                          <TableCell className="text-[#5671A6] text-sm font-medium">
                            {letter}
                            {i + 1}
                          </TableCell>
                          <TableCell className="text-sm text-[#0A3161]">{ex.name}</TableCell>
                          <TableCell className="text-sm text-[#2158A3]">{ex.tag}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ))}
          </div>
        )}

        {detail?.recovery && (
          <div>
            <h2 className="text-sm font-semibold text-[#0A3161] mb-3 px-1">Part 3: Active recovery (Tue / Thu)</h2>
            <div className="flex flex-col lg:flex-row gap-6 lg:items-stretch">
              <div className="flex-1 min-w-0 rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-sky-50 via-white to-emerald-50/80 border-b border-[#D9E8F5]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-sky-100 text-sky-700 shadow-sm">
                    <FaHeartbeat className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A3161]">Block 1 — LISS cardio ({detail.recovery.lissMinutes} min)</h3>
                    <p className="text-xs text-[#5671A6]">PDF prompt & options</p>
                  </div>
                </div>
                <div className="p-5 space-y-3 text-sm text-[#2158A3]">
                  <p>{detail.recovery.lissPrompt}</p>
                  <p className="text-xs text-[#5671A6]">Options: {detail.recovery.lissOptions}</p>
                </div>
              </div>
              <div className="flex-1 min-w-0 rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
                <div className="flex flex-wrap items-center gap-3 px-5 py-4 bg-gradient-to-r from-emerald-50 via-white to-amber-50/60 border-b border-[#E5EDE5]">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-emerald-100 text-emerald-800 shadow-sm">
                    <FaLeaf className="h-5 w-5" />
                  </span>
                  <div>
                    <h3 className="text-sm font-semibold text-[#0A3161]">Block 2 — The Big 4 stretches</h3>
                  </div>
                </div>
                <ol className="p-5 space-y-2 list-decimal list-inside text-sm text-[#2158A3]">
                  {detail.recovery.stretches.map((s, i) => (
                    <li key={i}>
                      <span className="font-medium text-[#0A3161]">{s.name}</span>: {s.detail}
                    </li>
                  ))}
                </ol>
              </div>
            </div>
          </div>
        )}

        {detail?.implementationNote && (
          <div className="rounded-xl border border-[#2158A3]/25 bg-[#0A3161]/5 px-4 py-3 text-sm text-[#0A3161]">
            <p className="text-xs font-semibold uppercase tracking-wide text-[#5671A6] mb-1">Implementation note (developer)</p>
            <p className="leading-relaxed">{detail.implementationNote}</p>
          </div>
        )}
      </div>
    </div>
  );
}
