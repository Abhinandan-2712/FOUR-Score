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
import { FaRegEye, FaRegEdit } from "react-icons/fa";
import { HiOutlineTrash } from "react-icons/hi";
import { Button } from "@/components/ui/button";
import axios from "axios";

import DeleteNutritionModal from "./components/DeleteNutritionModal";
import ViewNutritionModal from "./components/ViewNutritionModal";
import AdminHeaderCard from "@/components/admin/AdminHeaderCard";

const DEFAULT_ROWS_PER_PAGE = 6;

function mapApiItemToRow(n) {
  const createdAt = n?.createdAt ? new Date(n.createdAt).toISOString().slice(0, 10) : "";
  return {
    id: n?._id ?? n?.id,
    foodItem: n?.name ?? n?.foodItem ?? "",
    category: n?.category ?? "",
    mealType: n?.mealType ?? "",
    calories: n?.calories ?? 0,
    protein: n?.protein ?? 0,
    carbs: n?.carbs ?? 0,
    fats: n?.fats ?? 0,
    status: n?.status ?? "Active",
    description: n?.description ?? "",
    alternateFood: n?.alternateFood ?? "",
    imagePath: n?.imagePath ?? "",
    createdAt,
  };
}

export default function NutritionMacros() {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState("");
  const [mealTypeFilter, setMealTypeFilter] = useState("all"); // 'all' | 'vegetarian' | 'non-vegetarian' | 'vegan'
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage, setRowsPerPage] = useState(DEFAULT_ROWS_PER_PAGE);
  const [nutritionItems, setNutritionItems] = useState([]);
  const [isFetching, setIsFetching] = useState(false);
  const [serverTotal, setServerTotal] = useState(0);
  const [refreshKey, setRefreshKey] = useState(0);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [viewTarget, setViewTarget] = useState(null);

  const categoryBadgeClass = (category) => {
    switch (String(category || "").toLowerCase()) {
      case "breakfast":
        return "bg-sky-100 text-sky-800 border-sky-200";
      case "lunch":
        return "bg-amber-100 text-amber-900 border-amber-200";
      case "dinner":
        return "bg-indigo-100 text-indigo-900 border-indigo-200";
      case "snack":
        return "bg-emerald-100 text-emerald-900 border-emerald-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const handleView = (id) => {
    const item = nutritionItems.find((n) => n.id === id);
    setViewTarget(item || null);
  };

  const handleEdit = (id) => {
    const item = nutritionItems.find((n) => n.id === id);
    try {
      if (item) sessionStorage.setItem("nutrition_edit_item", JSON.stringify(item));
    } catch {
      // ignore
    }
    router.push(`/nutrition-macros/${id}/edit`);
  };

  const handleDelete = (id) => {
    const item = nutritionItems.find((n) => n.id === id);
    setDeleteTarget(item || null);
  };

  const filteredItems = useMemo(() => {
    let list = nutritionItems.filter((n) => {
      const q = searchTerm.toLowerCase();
      return (
        n.foodItem.toLowerCase().includes(q) ||
        n.category.toLowerCase().includes(q) ||
        n.mealType.toLowerCase().includes(q)
      );
    });

    if (mealTypeFilter === "vegetarian") list = list.filter((n) => n.mealType === "Vegetarian");
    if (mealTypeFilter === "non-vegetarian")
      list = list.filter((n) => n.mealType === "Non-Vegetarian");
    if (mealTypeFilter === "vegan") list = list.filter((n) => n.mealType === "Vegan");
    return list;
  }, [searchTerm, mealTypeFilter, nutritionItems]);

  const totalItems = filteredItems.length;
  const activeCount = nutritionItems.filter((n) => n.status === "Active").length;
  const inactiveCount = nutritionItems.filter((n) => n.status === "Inactive").length;
  const vegetarianCount = nutritionItems.filter((n) => n.mealType === "Vegetarian").length;
  const nonVegetarianCount = nutritionItems.filter((n) => n.mealType === "Non-Vegetarian").length;
  const veganCount = nutritionItems.filter((n) => n.mealType === "Vegan").length;

  const totalPages = Math.max(1, Math.ceil(totalItems / rowsPerPage));
  const start = (currentPage - 1) * rowsPerPage;
  const paginatedItems = filteredItems.slice(start, start + rowsPerPage);

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

  useEffect(() => {
    const fetchNutrition = async () => {
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
        // UI is client-side search + filters; fetch big chunk once.
        const res = await axios.get(`${baseUrl}/api/admin/get-all-nutrition-items`, {
          headers: { token },
          params: { page: 1, limit: 1000 },
        });

        const list = res?.data?.result?.items ?? [];
        const mapped = Array.isArray(list) ? list.map(mapApiItemToRow) : [];
        setNutritionItems(mapped);
        setServerTotal(mapped.length);
      } catch (err) {
        console.error("Fetch nutrition items failed:", err?.response?.data || err?.message);
        toast.error(err?.response?.data?.message || "Failed to fetch nutrition items");
      } finally {
        setIsFetching(false);
      }
    };

    fetchNutrition();
  }, [refreshKey]);

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <AdminHeaderCard
        title="Nutrition & Macros"
        subtitle="Manage food items and macro information used in the app."
        stats={
          <p className="text-sm text-muted-foreground">
            Total: <span className="font-semibold text-foreground">{serverTotal}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Active:{" "}
            <span className="font-semibold text-emerald-700 dark:text-emerald-300">{activeCount}</span>
            <span className="mx-2 text-muted-foreground/60">|</span>
            Inactive:{" "}
            <span className="font-semibold text-rose-700 dark:text-rose-300">{inactiveCount}</span>
          </p>
        }
        actions={
          <Button onClick={() => router.push("/nutrition-macros/new")}>
            + Add new Nutrition Item
          </Button>
        }
      />

      <div className="p-4 mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md">
        <Input
          placeholder="Search by food item, category, or meal type..."
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            setCurrentPage(1);
          }}
          className="w-full border-[#C8D7E9] rounded-md"
        />

        <div className="mt-4 flex gap-2">
          {[
            { key: "all", label: `All (${serverTotal})` },
            { key: "vegetarian", label: `Vegetarian (${vegetarianCount})` },
            { key: "non-vegetarian", label: `Non-Vegetarian (${nonVegetarianCount})` },
            { key: "vegan", label: `Vegan (${veganCount})` },
          ].map(({ key, label }) => (
            <button
              key={key}
              onClick={() => {
                setMealTypeFilter(key);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                mealTypeFilter === key
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
        <Table className="min-w-[1400px]">
          <TableHeader className="sticky top-0 z-10 bg-[#F2F5FA]">
            <TableRow className="border-b bg-[#F2F5FA]">
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">FOOD ITEM</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CATEGORY</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">MEAL TYPE</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CALORIES</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">PROTEIN (g)</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CARBS (g)</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">FATS (g)</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">STATUS</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">CREATED AT</TableHead>
              <TableHead className="font-semibold text-[#2158A3] px-4 py-3">ACTIONS</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white">
            {isFetching ? (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                  Loading nutrition items...
                </TableCell>
              </TableRow>
            ) : paginatedItems.length > 0 ? (
              paginatedItems.map((item, idx) => (
                <TableRow key={item.id} className={idx % 2 === 1 ? "bg-gray-50/50" : ""}>
                  <TableCell className="px-4 py-3 font-medium text-[#0A3161] whitespace-normal break-words max-w-[340px]">
                    <p className="whitespace-normal break-words" title={item.foodItem}>
                      {item.foodItem}
                    </p>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium ${categoryBadgeClass(
                        item.category
                      )}`}
                    >
                      {item.category}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                        item.mealType === "Vegetarian"
                          ? "bg-green-100 text-green-800"
                          : item.mealType === "Non-Vegetarian"
                            ? "bg-red-100 text-red-800"
                            : "bg-purple-100 text-purple-800"
                      }`}
                    >
                      {item.mealType}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {item.calories} kcal
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {item.protein}g
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {item.carbs}g
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {item.fats}g
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <span
                      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        item.status === "Active"
                          ? "bg-green-100 text-green-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell className="px-4 py-3 text-[#2158A3] font-normal text-sm">
                    {item.createdAt}
                  </TableCell>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => handleView(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-gray-200 text-gray-700 hover:bg-gray-300 transition-colors"
                        aria-label="View nutrition item"
                      >
                        <FaRegEye className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleEdit(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors hover:bg-primary/18"
                        aria-label="Edit nutrition item"
                      >
                        <FaRegEdit className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(item.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-full bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                        aria-label="Delete nutrition item"
                      >
                        <HiOutlineTrash className="h-4 w-4" />
                      </button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} className="text-center text-gray-500 py-8">
                  No nutrition items found
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
            Showing {totalItems === 0 ? 0 : start + 1}-{Math.min(start + rowsPerPage, totalItems)}{" "}
            of {totalItems} items
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

      <DeleteNutritionModal
        open={!!deleteTarget}
        nutritionItem={deleteTarget}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={async () => {
          if (!deleteTarget) return;
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

          try {
            const res = await axios.delete(
              `${baseUrl}/api/admin/delete-nutrition-items/${deleteTarget.id}`,
              { headers: { token } }
            );

            if (res?.data?.success) {
              toast.success(res?.data?.message || "Nutrition item deleted successfully!");
              setDeleteTarget(null);
              setNutritionItems((prev) => prev.filter((n) => n.id !== deleteTarget.id));
              setServerTotal((prev) => Math.max(0, Number(prev || 0) - 1));
              setRefreshKey((k) => k + 1);
            } else {
              toast.error(res?.data?.message || "Failed to delete nutrition item");
            }
          } catch (err) {
            console.error("Delete nutrition item failed:", err?.response?.data || err?.message);
            toast.error(err?.response?.data?.message || "Failed to delete nutrition item");
          }
        }}
      />

      <ViewNutritionModal
        open={!!viewTarget}
        nutritionItem={viewTarget}
        onClose={() => setViewTarget(null)}
      />
    </div>
  );
}
