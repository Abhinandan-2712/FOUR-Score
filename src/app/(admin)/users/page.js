"use client";

import { useEffect, useMemo, useState } from "react";
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
import { FaRegEye } from "react-icons/fa";
import { MdBlock } from "react-icons/md";
import { toast } from "react-hot-toast";
import ViewUserModal from "./components/ViewUserModal";
import BlockUserModal from "./components/BlockUserModal";

// Dummy user data matching the design
const MOCK_USERS = [
  { id: 1, name: "John Smith", email: "john@example.com", goal: "Weight Loss", bodyType: "Ectomorph", weeklyDays: "5 days", status: "Active", joinDate: "2025-12-10" },
  { id: 2, name: "Sarah Johnson", email: "sarah@example.com", goal: "Muscle Gain", bodyType: "Mesomorph", weeklyDays: "6 days", status: "Active", joinDate: "2025-12-09" },
  { id: 3, name: "Mike Williams", email: "mike@example.com", goal: "Stay Fit", bodyType: "Endomorph", weeklyDays: "4 days", status: "Blocked", joinDate: "2025-12-08" },
  { id: 4, name: "Emily Brown", email: "emily@example.com", goal: "Weight Loss", bodyType: "Mesomorph", weeklyDays: "5 days", status: "Active", joinDate: "2025-12-07" },
  { id: 5, name: "David Davis", email: "david@example.com", goal: "Muscle Gain", bodyType: "Ectomorph", weeklyDays: "6 days", status: "Active", joinDate: "2025-12-06" },
  { id: 6, name: "Lisa Anderson", email: "lisa@example.com", goal: "Stay Fit", bodyType: "Endomorph", weeklyDays: "4 days", status: "Blocked", joinDate: "2025-12-05" },
  { id: 7, name: "James Wilson", email: "james@example.com", goal: "Weight Loss", bodyType: "Mesomorph", weeklyDays: "5 days", status: "Active", joinDate: "2025-12-04" },
  { id: 8, name: "Anna Martinez", email: "anna@example.com", goal: "Muscle Gain", bodyType: "Ectomorph", weeklyDays: "6 days", status: "Blocked", joinDate: "2025-12-03" },
];

// const DEFAULT_ROWS_PER_PAGE = 6;

export default function UserManagementPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all"); // 'all' | 'active' | 'blocked'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [users, setUsers] = useState([]);
  const [isFetchingUsers, setIsFetchingUsers] = useState(false);
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState("");
  const [totalUsers, setTotalUsers] = useState(0);
  const [serverTotalPages, setServerTotalPages] = useState(1);
  const [viewTarget, setViewTarget] = useState(null);
  const [blockTarget, setBlockTarget] = useState(null);

  const handleView = (id) => {
    const user = users.find((u) => u.id === id);
    setViewTarget(user || null);
  };

  const handleBlock = (id) => {
    const user = users.find((u) => u.id === id);
    setBlockTarget(user || null);
  };

  const activeCount = users.filter((u) => u.status === "Active").length;
  const blockedCount = users.filter((u) => u.status === "Blocked").length;

  const totalPages = Math.max(1, serverTotalPages || 1);
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedUsers = users;

  const goToPage = (p) => setCurrentPage(Math.max(1, Math.min(p, totalPages)));

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedSearchTerm(searchTerm), 350);
    return () => window.clearTimeout(t);
  }, [searchTerm]);

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

  useEffect(() => {
    const fetchUsers = async () => {
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

      setIsFetchingUsers(true);
      try {
        const params = {
          page: currentPage,
          limit: rowsPerPage,
        };

        const trimmedSearch = debouncedSearchTerm.trim();
        if (trimmedSearch) params.search = trimmedSearch;

        if (statusFilter === "active") params.status = "Active";
        if (statusFilter === "blocked") params.status = "Blocked";

        const res = await axios.get(`${baseUrl}/api/admin/get-all-users`, {
          headers: { token },
          params,
        });

        const rawUsers = res?.data?.result?.users ?? [];
        const serverTotal = res?.data?.result?.total ?? 0;
        const serverPages = res?.data?.result?.totalPages ?? 1;

        // Map backend user shape into the fields expected by this UI.
        const mappedUsers = rawUsers.map((u) => {
          const joinDate = u?.createdAt
            ? new Date(u.createdAt).toISOString().slice(0, 10)
            : "";

          return {
            id: u?._id ?? u?.id,
            name: u?.name ?? "",
            email: u?.email ?? "",
            goal: u?.fitnessTarget ?? u?.goalDuration ?? "",
            bodyType: u?.workoutPreferences ?? u?.workoutSkillLevel ?? u?.gender ?? "",
            weeklyDays:
              typeof u?.workoutFrequency === "number"
                ? `${u.workoutFrequency} days`
                : u?.workoutFrequency
                  ? `${u.workoutFrequency} days`
                  : "",
            status: u?.status ?? "Active",
            joinDate,
          };
        });

        setUsers(mappedUsers);
        setTotalUsers(serverTotal);
        setServerTotalPages(serverPages);
      } catch (err) {
        console.error("Fetch users failed:", err?.response?.data || err?.message);
        toast.error(err?.response?.data?.message || "Failed to fetch users");
      } finally {
        setIsFetchingUsers(false);
      }
    };

    fetchUsers();
  }, [currentPage, rowsPerPage, statusFilter, debouncedSearchTerm]);

  return (
    <div className="min-h-[80vh] py-8 px-1">
      {/* Heading */}
      <h1 className="text-xl font-semibold text-[#0A3161] leading-6 tracking-normal ">User Management</h1>

      {/* Summary: Total | Active | Blocked */}
      <p className="mt-1 text-sm text-[#2158A3]">
        <span>Total: {totalUsers}</span>
        <span className="mx-2">|</span>
        <span className="text-green-600 font-normal">Active: {activeCount}</span>
        <span className="mx-2">|</span>
        <span className="text-red-600 font-normal">Blocked: {blockedCount}</span>
      </p>

      {/* Search */}
      <div className="p-4 mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md">
        <div className="">
          <Input
            placeholder="Search users by name or email..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full border-[#C8D7E9] rounded-md"
          />
        </div>

        {/* Filter tabs: All Users | Active | Blocked */}
        <div className="mt-4 flex gap-2">
          {[
              { key: "all", label: `All Users (${totalUsers})` },
            { key: "active", label: `Active (${activeCount})` },
            { key: "blocked", label: `Blocked (${blockedCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setStatusFilter(key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${statusFilter === key
                ? "bg-[#1e3a5f] text-white"
                : "bg-white text-[#1e3a5f] border border-gray-300 hover:bg-gray-50"
                }`}
            >
              {label}
            </button>
          ))}
        </div>


      </div>

      {/* Table */}
      <div className="mt-6 w-full overflow-x-auto border border-[#C8D7E9] rounded-lg shadow-md max-h-[500px] overflow-y-auto">
        <Table className="min-w-[1200px]">
          <TableHeader className="sticky top-0 z-10 bg-[#F2F5FA]">
            <TableRow className="border-b bg-[#F2F5FA]">
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">NAME</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">EMAIL</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">GOAL</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">BODY TYPE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">WEEKLY DAYS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">STATUS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">JOIN DATE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isFetchingUsers ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  Loading users...
                </TableCell>
              </TableRow>
            ) : paginatedUsers.length > 0 ? (
              paginatedUsers.map((user, idx) => (
                <TableRow
                  key={user.id}
                  className={idx % 2 === 1 ? "bg-gray-50/50" : ""}
                >
                  <TableCell className="px-4 py-3 font-medium text-[#0A3161]">{user.name}</TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">{user.email}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-gray-200 px-2.5 py-0.5 text-xs  font-medium text-[#0A3161]">
                      {user.goal}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">{user.bodyType}</TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">{user.weeklyDays}</TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${user.status === "Active"
                        ? "bg-green-100 text-green-800"
                        : "bg-red-100 text-red-800"
                        }`}
                    >
                      {user.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">{user.joinDate}</TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(user.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        aria-label="View user"
                      >
                        <FaRegEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleBlock(user.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 hover:bg-red-200 transition-colors"
                        aria-label="Block user"
                      >
                        <MdBlock className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={8} className="text-center text-gray-500 py-8">
                  No users found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="mt-4 flex flex-col sm:flex-row items-center justify-between gap-4 bg-white rounded-lg border border-[#C8D7E9] shadow-md px-4 py-4 ">
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
              {[10, 25, 50].map((n) => (
                <option key={n} value={n}>
                  {n}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div>
          <p className="text-sm text-gray-600">
            Showing {totalUsers === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, totalUsers)} of {totalUsers} users
          </p>

        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => goToPage(currentPage - 1)}
            disabled={currentPage === 1}
            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${currentPage === 1
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
              }`}
          >
            &lt;  Previous
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
                className={`h-10 w-10 rounded-lg border text-sm font-medium transition-colors ${isActive
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
            className={`h-10 px-4 rounded-lg border text-sm font-medium transition-colors ${currentPage === totalPages
                ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                : "bg-white text-gray-800 border-gray-200 hover:bg-gray-50"
              }`}
          >
            Next  &gt;
          </button>
        </div>
      </div>

      <ViewUserModal
        open={!!viewTarget}
        user={viewTarget}
        onClose={() => setViewTarget(null)}
      />

      <BlockUserModal
        open={!!blockTarget}
        user={blockTarget}
        onCancel={() => setBlockTarget(null)}
        onConfirm={() => {
          if (!blockTarget) return;
          const isCurrentlyBlocked = blockTarget.status === "Blocked";
          const updatedStatus = isCurrentlyBlocked ? "Active" : "Blocked";
          const userName = blockTarget.name;

          setUsers((prev) =>
            prev.map((u) =>
              u.id === blockTarget.id ? { ...u, status: updatedStatus } : u
            )
          );

          setBlockTarget(null);
          toast.success(
            `User "${userName}" ${
              updatedStatus === "Blocked" ? "blocked" : "unblocked"
            } successfully!`
          );
        }}
      />
    </div>
  );
}
