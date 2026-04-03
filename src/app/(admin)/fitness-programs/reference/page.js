"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowLeft } from "react-icons/hi";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  RECOMMENDATION_MATRIX,
  TIE_BREAKER_RULES,
  NO_MATCH_BACKUP,
  PROGRAM_CATALOG,
} from "../reference-data";

export default function FitnessProgramsReferencePage() {
  const router = useRouter();

  return (
    <div className="min-h-[80vh] py-8 px-1 max-w-6xl mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => router.push("/fitness-programs")}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#F2F5FA] shadow-sm"
            aria-label="Back"
          >
            <HiOutlineArrowLeft className="h-5 w-5" />
          </button>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6">
              Program logic &amp; catalog (PDF)
            </h1>
            <p className="mt-1 text-sm text-[#2158A3]">
              Recommendation rules and full program list — reference for app implementation (UI only).
            </p>
          </div>
        </div>
        <span className="inline-flex shrink-0 self-start rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          Read-only spec
        </span>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 text-sm">
        <a href="#recommendation" className="text-[#2158A3] hover:underline font-medium">
          Recommendation matrix
        </a>
        <span className="text-[#C8D7E9]">·</span>
        <a href="#tie-breakers" className="text-[#2158A3] hover:underline font-medium">
          Tie-breaker rules
        </a>
        <span className="text-[#C8D7E9]">·</span>
        <a href="#catalog" className="text-[#2158A3] hover:underline font-medium">
          Program catalog
        </a>
      </nav>

      {/* Part A — Recommendation matrix */}
      <section id="recommendation" className="mt-10 scroll-mt-24">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E8EEF7] bg-gradient-to-r from-sky-50/90 via-white to-white px-5 py-4 md:px-6">
            <h2 className="text-sm font-semibold text-[#0A3161]">Program recommendation logic</h2>
            <p className="text-xs text-[#5671A6] mt-1">
              If training location, skill level, and primary goal match — recommend the program (PDF: Program
              Recommendation Logic).
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[800px]">
              <TableHeader>
                <TableRow className="bg-[#F2F5FA] hover:bg-[#F2F5FA]">
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-normal max-w-[140px]">
                    Training location
                  </TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-normal max-w-[120px]">
                    Skill level
                  </TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-normal min-w-[200px]">
                    Primary preference / goal
                  </TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-normal min-w-[220px]">
                    Recommend program
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {RECOMMENDATION_MATRIX.map((row, i) => (
                  <TableRow key={i} className="border-b border-[#EEF2F7] hover:bg-[#FAFCFF]/80">
                    <TableCell className="px-3 py-2.5 text-sm text-[#0A3161] align-top">{row.location}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.skillLevel}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.primaryGoal}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm font-medium text-[#0A3161] align-top">
                      {row.program}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      {/* Tie-breakers */}
      <section id="tie-breakers" className="mt-10 scroll-mt-24">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E8EEF7] bg-gradient-to-r from-violet-50/80 via-white to-white px-5 py-4 md:px-6">
            <h2 className="text-sm font-semibold text-[#0A3161]">Developer implementation — tie-breaker rules</h2>
            <p className="text-xs text-[#5671A6] mt-1">When multiple programs could match, apply these in order (PDF).</p>
          </div>
          <div className="p-5 md:p-6 space-y-4">
            <div className="space-y-3">
              {TIE_BREAKER_RULES.map((rule, i) => (
                <div
                  key={i}
                  className="flex gap-3 rounded-xl border border-[#E8EEF4] bg-[#FAFCFF]/80 px-4 py-3"
                >
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#0A3161] text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <div>
                    <p className="text-sm font-semibold text-[#0A3161]">{rule.title}</p>
                    <p className="mt-1 text-sm text-[#2158A3] leading-relaxed">{rule.body}</p>
                  </div>
                </div>
              ))}
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/60 px-4 py-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-amber-950/90">No match backup</p>
              <p className="mt-1 text-sm text-amber-950/85 leading-relaxed">{NO_MATCH_BACKUP}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Program catalog table */}
      <section id="catalog" className="mt-10 scroll-mt-24 mb-8">
        <div className="rounded-2xl border border-[#C8D7E9] bg-white shadow-sm overflow-hidden">
          <div className="border-b border-[#E8EEF7] bg-gradient-to-r from-emerald-50/70 via-white to-white px-5 py-4 md:px-6">
            <h2 className="text-sm font-semibold text-[#0A3161]">Full program catalog</h2>
            <p className="text-xs text-[#5671A6] mt-1">
              Program name, goals, location tag, skills, preference, frequency (PDF catalog table).
            </p>
          </div>
          <div className="overflow-x-auto">
            <Table className="min-w-[960px]">
              <TableHeader>
                <TableRow className="bg-[#F2F5FA] hover:bg-[#F2F5FA]">
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold min-w-[200px]">Program name</TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold min-w-[180px]">Primary goal</TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold min-w-[160px]">Location tag</TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-nowrap">
                    Workout skills
                  </TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold min-w-[140px]">
                    Workout preference
                  </TableHead>
                  <TableHead className="px-3 py-3 text-[#2158A3] font-semibold whitespace-nowrap">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {PROGRAM_CATALOG.map((row, i) => (
                  <TableRow key={i} className="border-b border-[#EEF2F7] hover:bg-[#FAFCFF]/80">
                    <TableCell className="px-3 py-2.5 text-sm font-medium text-[#0A3161] align-top">{row.name}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.primaryGoal}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top whitespace-pre-wrap">
                      {row.locationTag}
                    </TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.workoutSkills}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.preference}</TableCell>
                    <TableCell className="px-3 py-2.5 text-sm text-[#2158A3] align-top">{row.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </section>

      <div className="flex flex-wrap gap-3 justify-end border-t border-[#E0E7F5] pt-6">
        <Button variant="outline" className="border-[#C8D7E9] bg-white" asChild>
          <Link href="/fitness-programs">Back to programs</Link>
        </Button>
      </div>
    </div>
  );
}
