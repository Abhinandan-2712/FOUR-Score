"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FaRegEdit } from "react-icons/fa";
import { HiOutlineEye, HiOutlineTrash } from "react-icons/hi";
import { toast } from "react-hot-toast";
import { MOCK_FITNESS_PROGRAMS, hasProgramEditor } from "./data";

const DEFAULT_ROWS_PER_PAGE = 6;

export default function FitnessProgramsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [programs, setPrograms] = useState(() => [...MOCK_FITNESS_PROGRAMS]);

  const filtered = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    if (!q) return programs;
    return programs.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.level.toLowerCase().includes(q) ||
        (p.subHeader && p.subHeader.toLowerCase().includes(q))
    );
  }, [searchTerm, programs]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = filtered.slice(start, start + rowsPerPage);

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const handleDelete = (p) => {
    const ok = window.confirm(`Delete “${p.title}”? This is UI-only — no API call.`);
    if (!ok) return;
    setPrograms((prev) => prev.filter((x) => x.id !== p.id));
    toast.success("Program removed from list (preview only).");
    setCurrentPage(1);
  };

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold text-[#0A3161] leading-6 tracking-normal">
            Fitness Programs
          </h1>
          <p className="mt-1 text-sm text-[#2158A3]">
            Thirteen programs (PDF catalog) — full tabbed editor for <strong>28-Day Foundations</strong> only in this
            admin preview. <span className="text-[#5671A6]">Not the member app.</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0 w-full sm:w-auto">
          <Button
            type="button"
            variant="outline"
            className="border-[#C8D7E9] bg-white text-[#0A3161] w-full sm:w-auto"
            asChild
          >
            <Link href="/fitness-programs/reference">PDF: Logic &amp; catalog</Link>
          </Button>
          <Button
            type="button"
            className="bg-[#0A3161] hover:bg-[#0D3D7A] w-full sm:w-auto"
            onClick={() => router.push("/fitness-programs/new")}
          >
            + Add Program
          </Button>
        </div>
      </div>

      <div className="p-4 mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md">
        <Input
          placeholder="Search by title, level, or tagline..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border-[#C8D7E9] rounded-md"
        />
      </div>

      <div className="mt-6 w-full overflow-x-auto border border-[#C8D7E9] rounded-lg shadow-md max-h-[520px] overflow-y-auto">
        <Table className="min-w-[1000px]">
          <TableHeader className="sticky top-0 z-10 bg-[#F2F5FA]">
            <TableRow className="border-b bg-[#F2F5FA]">
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">PROGRAM</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">LEVEL</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">DURATION</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">FREQ. / WK</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">AVG. SESSION</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">STATUS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">UPDATED</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3 w-[148px] min-w-[148px]">
                ACTIONS
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {pageRows.length > 0 ? (
              pageRows.map((p, idx) => (
                <TableRow key={p.id} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                  <TableCell className="px-4 py-3 max-w-[280px]">
                    <p className="font-medium text-[#0A3161]">{p.title}</p>
                    {p.subHeader && (
                      <p className="text-xs text-[#5671A6] mt-1 line-clamp-2" title={p.subHeader}>
                        {p.subHeader}
                      </p>
                    )}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-blue-50 text-blue-800 px-2.5 py-0.5 text-xs font-medium border border-blue-100">
                      {p.level}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] text-sm">
                    {p.durationWeeks} weeks
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] text-sm">{p.frequencyPerWeek} days</TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] text-sm">{p.avgSessionMinutes} min</TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        p.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-700"
                      }`}
                    >
                      {p.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] text-sm">{p.updatedAt}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => router.push(`/fitness-programs/${p.id}`)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        aria-label="View program"
                        title="View"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => hasProgramEditor(p.id) && router.push(`/fitness-programs/${p.id}/edit`)}
                        disabled={!hasProgramEditor(p.id)}
                        className={`flex h-8 w-8 items-center justify-center rounded-full transition-colors ${
                          hasProgramEditor(p.id)
                            ? "bg-blue-100 text-blue-700 hover:bg-blue-200"
                            : "bg-slate-100 text-slate-400 cursor-not-allowed"
                        }`}
                        aria-label={hasProgramEditor(p.id) ? "Edit program" : "Edit not available for this catalog row"}
                        title={
                          hasProgramEditor(p.id)
                            ? "Edit"
                            : "Full editor: 28-Day Foundations only (UI preview)"
                        }
                      >
                        <FaRegEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(p)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Delete program"
                        title="Delete"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-10">
                  {programs.length === 0
                    ? "No programs in the list. Add one with + Add Program."
                    : "No programs match your search."}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-[#C8D7E9] shadow-md px-4 py-4">
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>Rows per page:</span>
          <select
            className="border border-[#C8D7E9] rounded-md px-2 py-1 bg-white text-sm outline-none focus:ring-2 focus:ring-[#0A3161]/30"
            value={rowsPerPage}
            onChange={(e) => {
              setRowsPerPage(Number(e.target.value));
              setCurrentPage(1);
            }}
          >
            {[6, 10, 25, 50].map((n) => (
              <option key={n} value={n}>
                {n}
              </option>
            ))}
          </select>
        </div>
        <p className="text-sm text-gray-600">
          Showing {totalItems === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, totalItems)} of{" "}
          {totalItems} programs
        </p>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            }`}
          >
            &lt; Previous
          </button>
          {paginationItems.map((item, idx) => {
            if (item === "…") {
              return (
                <span key={`e-${idx}`} className="px-2 text-gray-500 select-none">
                  …
                </span>
              );
            }
            const page = item;
            const isActive = page === currentPage;
            return (
              <button
                key={page}
                type="button"
                onClick={() => goToPage(page)}
                className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-[#0A3161] text-white border-[#0A3161]"
                    : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
                }`}
              >
                {page}
              </button>
            );
          })}
          <button
            type="button"
            onClick={() => goToPage(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
              currentPage === totalPages
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            }`}
          >
            Next &gt;
          </button>
        </div>
      </div>
    </div>
  );
}
