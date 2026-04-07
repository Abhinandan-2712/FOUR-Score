"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
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
import {
  mapProgramFromApi,
  programCacheKey,
  programEditKey,
  extractProgramsFromListResponse,
  extractListMeta,
  deleteProgramById,
  isAdminApiErrorPayload,
} from "@/lib/fitnessProgramApi";
import DeleteProgramModal from "./components/DeleteProgramModal";

const DEFAULT_ROWS_PER_PAGE = 6;

export default function FitnessProgramsPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [programs, setPrograms] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [serverTotal, setServerTotal] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

      if (!baseUrl) {
        toast.error("API base URL is missing (NEXT_PUBLIC_API_BASE_URL).");
        return;
      }
      if (!token) {
        toast.error("Session expired. Please login again.");
        return;
      }

      setIsFetching(true);
      try {
        const params = {
          page: currentPage,
          limit: rowsPerPage,
        };
        const q = debouncedSearchTerm.trim();
        if (q) params.search = q;

        const res = await axios.get(`${baseUrl}/api/admin/get-all-programs`, {
          headers: { token, Authorization: `Bearer ${token}` },
          params,
        });

        const payload = res?.data ?? {};
        if (isAdminApiErrorPayload(payload)) {
          toast.error(payload.message || "Failed to fetch programs");
          setPrograms([]);
          return;
        }

        const rawList = extractProgramsFromListResponse(res?.data);
        const meta = extractListMeta(res?.data);

        const mapped = rawList.map(mapProgramFromApi).filter(Boolean);

        if (meta.total !== undefined) setServerTotal(meta.total);
        else setServerTotal(mapped.length);

        if (meta.totalPages !== undefined) setServerTotalPages(Math.max(1, meta.totalPages));
        else setServerTotalPages(1);

        setPrograms(mapped);
      } catch (err) {
        console.error("Fetch programs failed:", err?.response?.data || err?.message);
        toast.error(err?.response?.data?.message || "Failed to fetch programs");
        setPrograms([]);
      } finally {
        setIsFetching(false);
      }
    };

    load();
  }, [currentPage, rowsPerPage, debouncedSearchTerm, refreshKey]);

  const totalItems = serverTotal || programs.length;
  const totalPages = Math.max(1, serverTotalPages || 1);
  const start = (currentPage - 1) * rowsPerPage;
  const pageRows = programs;

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const confirmDeleteProgram = async () => {
    const p = deleteTarget;
    if (!p) return;

    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    if (!baseUrl) {
      toast.error("API base URL is missing (NEXT_PUBLIC_API_BASE_URL).");
      return;
    }
    if (!token) {
      toast.error("Session expired. Please login again.");
      return;
    }

    setIsDeleting(true);
    try {
      const res = await deleteProgramById(p.id, { token, baseUrl });
      const data = res?.data ?? {};
      if (isAdminApiErrorPayload(data)) {
        toast.error(data.message || data.msg || "Failed to delete program");
        return;
      }
      try {
        sessionStorage.removeItem(programCacheKey(p.id));
        sessionStorage.removeItem(programEditKey(p.id));
      } catch {
        /* ignore */
      }
      toast.success("Program deleted.");
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
      setCurrentPage(1);
    } catch (err) {
      console.error("Delete program failed:", err?.response?.data || err?.message);
      const msg =
        err?.adminPayload?.message ||
        err?.response?.data?.message ||
        err?.message ||
        "Failed to delete program";
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  const stashProgramForRoute = (p) => {
    try {
      if (p?._raw) {
        sessionStorage.setItem(programCacheKey(p.id), JSON.stringify(p._raw));
        sessionStorage.setItem(programEditKey(p.id), JSON.stringify(p._raw));
      }
    } catch (e) {
      console.warn("sessionStorage program cache failed", e);
    }
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
            Manage programs from the API. Reference PDF:{" "}
            <span className="text-[#5671A6]">not the member app preview.</span>
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2 sm:items-center shrink-0 w-full sm:w-auto">
          {/* <Button
            type="button"
            variant="outline"
            className="border-[#C8D7E9] bg-white text-[#0A3161] w-full sm:w-auto"
            asChild
          >
            <Link href="/fitness-programs/reference">PDF: Logic &amp; catalog</Link>
          </Button> */}
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
                        onClick={() => {
                          stashProgramForRoute(p);
                          router.push(`/fitness-programs/${p.id}`);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                        aria-label="View program"
                        title="View"
                      >
                        <HiOutlineEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          stashProgramForRoute(p);
                          router.push(`/fitness-programs/${p.id}/edit`);
                        }}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-100 text-blue-700 hover:bg-blue-200 transition-colors"
                        aria-label="Edit program"
                        title="Edit"
                      >
                        <FaRegEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(p)}
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
                  {isFetching
                    ? "Loading programs…"
                    : programs.length === 0
                      ? "No programs yet. Add one with + Add Program."
                      : "No programs on this page."}
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

      <DeleteProgramModal
        open={!!deleteTarget}
        program={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => {
          if (!isDeleting) setDeleteTarget(null);
        }}
        onConfirm={confirmDeleteProgram}
      />
    </div>
  );
}
