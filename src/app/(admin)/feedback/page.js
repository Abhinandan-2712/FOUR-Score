"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { toast } from "react-hot-toast";
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
import { FaRegEye } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import AdminHeaderCard from "@/components/admin/AdminHeaderCard";
import ViewFeedbackModal from "./components/ViewFeedbackModal";
import DeleteFeedbackModal from "./components/DeleteFeedbackModal";
import { deleteFeedbackById, fetchAllFeedback, setFeedbackResolved } from "@/lib/feedbackApi";

const DEFAULT_ROWS_PER_PAGE = 10;

const MOCK_FEEDBACK = [
  {
    id: "demo-1",
    userName: "Demo User",
    userEmail: "demo.user@example.com",
    message:
      "Great app overall — workouts are easy to follow. Would love a dark mode toggle and a way to bookmark recovery videos.",
    status: "Open",
    createdAt: "2026-04-10",
  },
  {
    id: "demo-2",
    userName: "Ava K.",
    userEmail: "ava.k@example.com",
    message:
      "The macro calculator is helpful, but the onboarding steps felt long. Can we skip some steps and edit later?",
    status: "Resolved",
    createdAt: "2026-04-09",
  },
  {
    id: "demo-3",
    userName: "Rohit",
    userEmail: "rohit@example.com",
    message:
      "Please add more beginner-friendly mobility sessions and a weekly progress summary notification.",
    status: "Open",
    createdAt: "2026-04-08",
  },
];

export default function FeedbackPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | open | resolved
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [items, setItems] = useState([]);
  const [isFetching, setIsFetching] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);
  const [viewTarget, setViewTarget] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [hasShownDemoToast, setHasShownDemoToast] = useState(false);
  const updateLockRef = useRef(false);

  useEffect(() => {
    const load = async () => {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
      if (!baseUrl) {
        if (!hasShownDemoToast) {
          toast.error("Feedback service is not configured yet. Showing sample feedback for preview.", {
            id: "feedback-missing-base-url",
          });
          setHasShownDemoToast(true);
        }
        setItems(MOCK_FEEDBACK);
        setIsFetching(false);
        return;
      }
      if (!token) {
        if (!hasShownDemoToast) {
          toast.error("Could not verify your session. Showing sample feedback for preview.", {
            id: "feedback-missing-token",
          });
          setHasShownDemoToast(true);
        }
        setItems(MOCK_FEEDBACK);
        setIsFetching(false);
        return;
      }
      setIsFetching(true);
      try {
        const list = await fetchAllFeedback({ token, baseUrl });
        setItems(Array.isArray(list) && list.length ? list : MOCK_FEEDBACK);
      } catch (err) {
        console.error("Load feedback failed:", err?.adminPayload || err?.message);
        toast.error("Feedback is temporarily unavailable. Showing sample feedback for preview.", {
          id: "feedback-load-failed",
        });
        setItems(MOCK_FEEDBACK);
      } finally {
        setIsFetching(false);
      }
    };
    load();
  }, [refreshKey, hasShownDemoToast]);

  const openCount = items.filter((i) => i.status === "Open").length;
  const resolvedCount = items.filter((i) => i.status === "Resolved").length;

  const filtered = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let list = items.filter((i) => {
      return (
        (i.userName || "").toLowerCase().includes(q) ||
        (i.userEmail || "").toLowerCase().includes(q) ||
        (i.message || "").toLowerCase().includes(q)
      );
    });
    if (statusFilter === "open") list = list.filter((i) => i.status === "Open");
    if (statusFilter === "resolved") list = list.filter((i) => i.status === "Resolved");
    return list;
  }, [items, searchTerm, statusFilter]);

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const paginated = filtered.slice(start, start + rowsPerPage);

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const confirmDelete = async () => {
    if (!deleteTarget) return;
    const token = localStorage.getItem("token");
    const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
    if (!baseUrl) {
      toast.error("API base URL is missing (NEXT_PUBLIC_API_BASE_URL).", { id: "feedback-missing-base-url" });
      return;
    }
    if (!token) {
      toast.error("Session expired. Please login again.", { id: "feedback-missing-token" });
      return;
    }
    setIsDeleting(true);
    try {
      await deleteFeedbackById(deleteTarget.id, { token, baseUrl });
      toast.success("Feedback deleted.", { id: `feedback-deleted:${deleteTarget.id}` });
      setDeleteTarget(null);
      setRefreshKey((k) => k + 1);
    } catch (err) {
      console.error("Delete feedback failed:", err?.adminPayload || err?.message);
      toast.error(err?.adminPayload?.message || err?.message || "Failed to delete feedback", {
        id: `feedback-delete-failed:${deleteTarget?.id || "unknown"}`,
      });
    } finally {
      setIsDeleting(false);
    }
  };

  const toggleResolved = async (row) => {
    if (updateLockRef.current) return;
    updateLockRef.current = true;
    try {
      const token = localStorage.getItem("token");
      const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();
      if (!baseUrl) {
        toast.error("API base URL is missing (NEXT_PUBLIC_API_BASE_URL).", { id: "feedback-missing-base-url" });
        return;
      }
      if (!token) {
        toast.error("Session expired. Please login again.", { id: "feedback-missing-token" });
        return;
      }

      setIsUpdating(true);
      try {
        const nextResolved = row.status !== "Resolved";
        await setFeedbackResolved(row.id, nextResolved, { token, baseUrl });
        toast.success(nextResolved ? "Marked as resolved." : "Reopened feedback.", {
          id: "feedback-status-updated",
        });
        setRefreshKey((k) => k + 1);
      } catch (err) {
        console.error("Update feedback failed:", err?.adminPayload || err?.message);
        toast.error(err?.adminPayload?.message || err?.message || "Failed to update feedback", {
          id: "feedback-update-failed",
        });
      } finally {
        setIsUpdating(false);
      }
    } finally {
      updateLockRef.current = false;
    }
  };

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <AdminHeaderCard
        title="Feedback"
        subtitle="View and manage feedback submitted from the app."
        stats={
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{items.length}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Open: <span className="font-semibold text-amber-700 dark:text-amber-300">{openCount}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Resolved: <span className="font-semibold text-emerald-700 dark:text-emerald-300">{resolvedCount}</span>
          </p>
        }
        actions={
          <Button type="button" variant="outline" onClick={() => setRefreshKey((k) => k + 1)}>
            Refresh
          </Button>
        }
      />

      <div className="p-4 mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md">
        <Input
          placeholder="Search by name, email, or message..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border-[#C8D7E9] rounded-md"
        />

        <div className="mt-4 flex gap-2">
          {[
            { key: "all", label: `All (${items.length})` },
            { key: "open", label: `Open (${openCount})` },
            { key: "resolved", label: `Resolved (${resolvedCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => {
                setStatusFilter(key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                statusFilter === key
                  ? "bg-[#1e3a5f] text-white"
                  : "bg-white text-[#1e3a5f] border border-gray-300 hover:bg-gray-50"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-6 w-full overflow-x-auto border border-[#C8D7E9] rounded-lg shadow-md max-h-[500px] overflow-y-auto">
        <Table className="min-w-[1200px]">
          <TableHeader className="sticky top-0 z-10 bg-[#F2F5FA]">
            <TableRow className="border-b bg-[#F2F5FA]">
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">USER</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">USER EMAIL</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">MESSAGE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">STATUS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CREATED AT</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  Loading feedback...
                </TableCell>
              </TableRow>
            ) : paginated.length > 0 ? (
              paginated.map((row, idx) => (
                <TableRow key={row.id} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                  <TableCell className="px-4 py-3">
                    <div className="min-w-0">
                      <p className="font-medium text-[#0A3161] truncate" title={row.userName}>
                        {row.userName || "—"}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[240px]">
                    <p className="text-sm text-[#2158A3] truncate" title={row.userEmail || ""}>
                      {row.userEmail || "—"}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3 max-w-[520px]">
                    <div className="fs-line-clamp-3 text-sm text-[#0A3161]" title={row.message}>
                      {row.message || "—"}
                    </div>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        row.status === "Resolved"
                          ? "bg-emerald-100 text-emerald-800"
                          : "bg-amber-100 text-amber-800"
                      }`}
                    >
                      {row.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {row.createdAt}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setViewTarget(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        aria-label="View feedback"
                      >
                        <FaRegEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => toggleResolved(row)}
                        disabled={isUpdating}
                        aria-busy={isUpdating}
                        className={`h-8 rounded-full px-3 text-xs font-medium border transition-colors disabled:pointer-events-none disabled:opacity-50 ${
                          row.status === "Resolved"
                            ? "bg-white text-amber-800 border-amber-200 hover:bg-amber-50"
                            : "bg-white text-emerald-800 border-emerald-200 hover:bg-emerald-50"
                        }`}
                      >
                        {row.status === "Resolved" ? "Reopen" : "Resolve"}
                      </button>
                      <button
                        type="button"
                        onClick={() => setDeleteTarget(row)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Delete feedback"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-gray-500 py-8">
                  No feedback found
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
          Showing {totalItems === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, totalItems)} of {totalItems} items
        </p>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${
              currentPage === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
            }`}
          >
            &lt; Previous
          </button>

          <span className="text-sm text-gray-700">
            Page {currentPage} / {totalPages}
          </span>

          <button
            type="button"
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
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

      <DeleteFeedbackModal
        open={!!deleteTarget}
        feedback={deleteTarget}
        isDeleting={isDeleting}
        onCancel={() => (isDeleting ? null : setDeleteTarget(null))}
        onConfirm={confirmDelete}
      />

      <ViewFeedbackModal open={!!viewTarget} feedback={viewTarget} onClose={() => setViewTarget(null)} />
    </div>
  );
}

