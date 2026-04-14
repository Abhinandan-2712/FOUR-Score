"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
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
import { FaRegEye, FaRegEdit } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { MOCK_NOTIFICATIONS, getAudienceLabel } from "./data";
import DeleteNotificationModal from "./components/DeleteNotificationModal";
import ViewNotificationModal from "./components/ViewNotificationModal";
import AdminHeaderCard from "@/components/admin/AdminHeaderCard";

const DEFAULT_ROWS_PER_PAGE = 6;

export default function NotificationPage() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // all | sent | scheduled | draft
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [notifications, setNotifications] = useState(MOCK_NOTIFICATIONS);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const filteredNotifications = useMemo(() => {
    const q = searchTerm.toLowerCase();
    let list = notifications.filter((n) => {
      const audienceLabel = getAudienceLabel(n.recipientMode, n.selectedUserIds);
      return (
        n.title.toLowerCase().includes(q) ||
        n.message?.toLowerCase().includes(q) ||
        audienceLabel.toLowerCase().includes(q) ||
        (n.type || "").toLowerCase().includes(q)
      );
    });
    if (statusFilter === "sent") list = list.filter((n) => n.status === "Sent");
    if (statusFilter === "scheduled") list = list.filter((n) => n.status === "Scheduled");
    if (statusFilter === "draft") list = list.filter((n) => n.status === "Draft");
    return list;
  }, [notifications, searchTerm, statusFilter]);

  const totalItems = filteredNotifications.length;
  const sentCount = notifications.filter((n) => n.status === "Sent").length;
  const scheduledCount = notifications.filter((n) => n.status === "Scheduled").length;
  const draftCount = notifications.filter((n) => n.status === "Draft").length;

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filteredNotifications.slice(start, start + rowsPerPage);

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useEffect(() => {
    if (currentPage > totalPages) setCurrentPage(totalPages);
  }, [currentPage, totalPages]);

  const paginationItems = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (currentPage <= 4) return [1, 2, 3, 4, 5, "…", totalPages];
    if (currentPage >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", currentPage - 1, currentPage, currentPage + 1, "…", totalPages];
  }, [currentPage, totalPages]);

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <AdminHeaderCard
        title="Notifications"
        subtitle="Create and manage push notifications sent to users."
        stats={
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{notifications.length}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Sent:{" "}
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{sentCount}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Scheduled:{" "}
            <span className="font-semibold text-sky-700 dark:text-sky-300">{scheduledCount}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Draft:{" "}
            <span className="font-semibold text-amber-800 dark:text-amber-300">{draftCount}</span>
          </p>
        }
        actions={<Button onClick={() => router.push("/notification/new")}>+ New Notification</Button>}
      />

      <div className="p-4 mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md">
        <Input
          placeholder="Search by title, message, audience, or type..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border-[#C8D7E9] rounded-md"
        />

        <div className="mt-4 flex gap-2 flex-wrap">
          {[
            { key: "all", label: `All (${notifications.length})` },
            { key: "sent", label: `Sent (${sentCount})` },
            { key: "scheduled", label: `Scheduled (${scheduledCount})` },
            { key: "draft", label: `Draft (${draftCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
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
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">TITLE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">MESSAGE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">AUDIENCE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">TYPE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">STATUS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">SCHEDULED AT</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CREATED AT</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {paginatedItems.length > 0 ? (
              paginatedItems.map((item, idx) => {
                const audienceLabel = getAudienceLabel(item.recipientMode, item.selectedUserIds);
                return (
                  <TableRow key={item.id} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                    <TableCell className="px-4 py-3 font-medium text-[#0A3161]">
                      {item.title}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm max-w-[200px]">
                      <p className="truncate" title={item.message}>
                        {item.message || "—"}
                      </p>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-gray-200 px-3 py-1 text-xs font-medium text-[#0A3161]">
                        {audienceLabel}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span className="inline-flex items-center rounded-full bg-white px-3 py-1 text-xs font-medium text-[#2158A3] border border-[#C8D7E9]">
                        {item.type}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          item.status === "Sent"
                            ? "bg-green-100 text-green-800"
                            : item.status === "Scheduled"
                              ? "bg-blue-100 text-blue-800"
                              : "bg-yellow-100 text-yellow-800"
                        }`}
                      >
                        {item.status}
                      </span>
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                      {item.scheduledAt || "—"}
                    </TableCell>
                    <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                      {item.createdAt}
                    </TableCell>
                    <TableCell className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => setViewTarget(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                          aria-label="View notification"
                        >
                          <FaRegEye className="h-4 w-4" />
                        </button>
                        {/* <button
                          type="button"
                          onClick={() => router.push(`/notification/${item.id}/edit`)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/18"
                          aria-label="Edit notification"
                        >
                          <FaRegEdit className="h-4 w-4" />
                        </button> */}
                        <button
                          type="button"
                          onClick={() => setDeleteTarget(item)}
                          className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                          aria-label="Delete notification"
                        >
                          <HiOutlineTrash className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No notifications found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-[#C8D7E9] shadow-md px-4 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center gap-3 w-full sm:w-auto">
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
        </div>

        <div>
          <p className="text-sm text-gray-600">
            Showing {totalItems === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, totalItems)} of{" "}
            {totalItems} items
          </p>
        </div>

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
                <span key={`ellipsis-${idx}`} className="px-2 text-gray-500 select-none">
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
                aria-current={isActive ? "page" : undefined}
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

      <DeleteNotificationModal
        open={!!deleteTarget}
        notification={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => {
          if (!deleteTarget) return;
          const title = deleteTarget.title;
          setNotifications((prev) => prev.filter((n) => n.id !== deleteTarget.id));
          setDeleteTarget(null);
          toast.success(`Notification "${title}" deleted successfully!`);
        }}
      />

      <ViewNotificationModal
        open={!!viewTarget}
        notification={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}

