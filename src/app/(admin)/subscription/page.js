"use client";

import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";
import { toast } from "react-hot-toast";
import { useRouter } from "next/navigation";
import axios from "axios";
import {
  HiOutlineArrowLeft,
  HiOutlineCreditCard,
  HiOutlineTrash,
  HiOutlinePlus,
  HiOutlineEye,
  HiOutlinePencil,
  HiX,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import AdminHeaderCard from "@/components/admin/AdminHeaderCard";

const labelCls = "block text-xs font-semibold uppercase tracking-wide text-muted-foreground";

const DEFAULT_ACCESS = { exerciseLibrary: true, nutritionMacros: true, recoveryContent: true };

const DEFAULT_ACCESS_ITEMS = {
  exerciseLibrary: { mode: "all", ids: [] },
  nutritionMacros: { mode: "all", ids: [] },
  recoveryContent: { mode: "all", ids: [] },
};

const INITIAL_PLANS = [
  {
    id: "basic",
    name: "Basic",
    tagline: "Perfect to get started",
    price: "$9.99",
    period: "/month",
    features: ["Basic workouts", "Diet tracking", "Progress tracker", "Email support"],
    access: DEFAULT_ACCESS,
    accessItems: DEFAULT_ACCESS_ITEMS,
  },
  {
    id: "premium",
    name: "Premium",
    tagline: "Perfect to get started",
    price: "$19.99",
    period: "/month",
    features: ["All Basic +", "Advanced programs", "Meal plans", "Video tutorials", "Priority support"],
    access: DEFAULT_ACCESS,
    accessItems: DEFAULT_ACCESS_ITEMS,
  },
  {
    id: "pro",
    name: "Pro",
    tagline: "Perfect to get started",
    price: "$29.99",
    period: "/month",
    features: ["All Premium +", "Personal coaching", "Custom plans", "Nutrition consult", "Analytics"],
    access: DEFAULT_ACCESS,
    accessItems: DEFAULT_ACCESS_ITEMS,
  },
];

function makePlanId(name) {
  return name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

function planToDraft(plan) {
  const access = {
    exerciseLibrary: plan?.access?.exerciseLibrary ?? DEFAULT_ACCESS.exerciseLibrary,
    nutritionMacros: plan?.access?.nutritionMacros ?? DEFAULT_ACCESS.nutritionMacros,
    recoveryContent: plan?.access?.recoveryContent ?? DEFAULT_ACCESS.recoveryContent,
  };

  const accessItems = {
    exerciseLibrary: {
      mode: plan?.accessItems?.exerciseLibrary?.mode ?? "all",
      ids: plan?.accessItems?.exerciseLibrary?.ids ?? [],
    },
    nutritionMacros: {
      mode: plan?.accessItems?.nutritionMacros?.mode ?? "all",
      ids: plan?.accessItems?.nutritionMacros?.ids ?? [],
    },
    recoveryContent: {
      mode: plan?.accessItems?.recoveryContent?.mode ?? "all",
      ids: plan?.accessItems?.recoveryContent?.ids ?? [],
    },
  };

  return {
    name: plan?.name ?? "",
    tagline: plan?.tagline ?? "",
    price: plan?.price ?? "",
    period: plan?.period ?? "/month",
    featuresText: (plan?.features ?? []).join("\n"),
    access,
    accessItems,
  };
}

const chipClasses = (active) =>
  `w-full rounded-xl border text-sm font-medium py-2.5 px-4 text-center transition-all ${
    active
      ? "border-primary/60 bg-primary/10 text-foreground shadow-sm"
      : "border-border bg-background text-foreground/90 hover:bg-muted"
  }`;

const ACCESS_OPTIONS = [
  { key: "exerciseLibrary", label: "Exercise Library" },
  { key: "nutritionMacros", label: "Nutrition & Macros" },
  { key: "recoveryContent", label: "Recovery Content" },
];

function AccessItemPicker({
  title,
  items,
  labelGetter,
  mode,
  selectedIds,
  onModeChange,
  onSelectedIdsChange,
  disabled,
}) {
  const [q, setQ] = useState("");
  const filtered = useMemo(() => {
    const query = q.trim().toLowerCase();
    if (!query) return items;
    return items.filter((it) => labelGetter(it).toLowerCase().includes(query));
  }, [items, labelGetter, q]);

  const selectedSet = useMemo(() => new Set(selectedIds ?? []), [selectedIds]);

  const toggleId = (id) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onSelectedIdsChange?.(Array.from(next));
  };

  const allIds = useMemo(() => items.map((x) => x.id), [items]);

  return (
    <details
      className={`mt-3 rounded-xl border border-border bg-background overflow-hidden ${
        disabled ? "opacity-60 pointer-events-none" : ""
      }`}
      open={mode === "selected"}
    >
      <summary className="list-none cursor-pointer select-none px-3 py-3 bg-muted/10 flex items-center justify-between gap-3">
        <div className="min-w-0">
          <p className="text-sm font-semibold text-foreground leading-tight">{title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            {mode === "all" ? "All items included" : `${selectedIds?.length ?? 0} selected`}
          </p>
        </div>

        <div className="shrink-0 flex items-center gap-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onModeChange?.("all");
            }}
            className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-colors ${
              mode === "all"
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
            }`}
          >
            All
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              onModeChange?.("selected");
            }}
            className={`h-8 px-3 rounded-lg border text-xs font-semibold transition-colors ${
              mode === "selected"
                ? "border-primary/50 bg-primary/10 text-foreground"
                : "border-border bg-background text-muted-foreground hover:bg-muted/40"
            }`}
          >
            Choose
          </button>
        </div>
      </summary>

      {mode === "selected" ? (
        <div className="p-3 space-y-2">
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search..."
            className="h-9 bg-background"
            disabled={disabled}
          />
          <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
            <div className="flex items-center gap-3">
              <button type="button" className="underline" onClick={() => onSelectedIdsChange?.(allIds)}>
                Select all
              </button>
              <button type="button" className="underline" onClick={() => onSelectedIdsChange?.([])}>
                Clear
              </button>
            </div>
            <span className="shrink-0">
              {selectedIds?.length ?? 0} / {items.length}
            </span>
          </div>
          <div className="max-h-60 overflow-auto rounded-lg border border-border bg-background">
            {filtered.length ? (
              <div className="divide-y divide-border">
                {filtered.map((it) => (
                  <label
                    key={it.id}
                    className="flex items-center gap-3 px-3 py-2 text-sm hover:bg-muted/30 transition-colors"
                  >
                    <input
                      type="checkbox"
                      checked={selectedSet.has(it.id)}
                      onChange={() => toggleId(it.id)}
                      disabled={disabled}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-foreground">{labelGetter(it)}</span>
                  </label>
                ))}
              </div>
            ) : (
              <div className="px-3 py-6 text-sm text-muted-foreground">No matches.</div>
            )}
          </div>
        </div>
      ) : (
        <div className="px-3 py-3 text-xs text-muted-foreground">All items included.</div>
      )}
    </details>
  );
}

export default function SubscriptionAdminPage() {
  const router = useRouter();
  const [plans, setPlans] = useState(INITIAL_PLANS);
  const [selected, setSelected] = useState("basic");
  const [isSaving, setIsSaving] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const [modal, setModal] = useState({ open: false, mode: "add", planId: null });
  const [draft, setDraft] = useState(planToDraft(null));
  const [deleteModal, setDeleteModal] = useState({ open: false, planId: null });
  const [exerciseOptions, setExerciseOptions] = useState([]);
  const [nutritionOptions, setNutritionOptions] = useState([]);
  const [recoveryOptions, setRecoveryOptions] = useState([]);
  const [isLoadingAccessLists, setIsLoadingAccessLists] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!modal.open) return;
    if (exerciseOptions.length && nutritionOptions.length && recoveryOptions.length) return;

    const fetchAll = async () => {
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

      setIsLoadingAccessLists(true);
      try {
        const [exRes, nuRes, reRes] = await Promise.all([
          axios.get(`${baseUrl}/api/admin/get-all-exercises`, {
            headers: { token },
            params: { page: 1, limit: 1000 },
          }),
          axios.get(`${baseUrl}/api/admin/get-all-nutrition-items`, {
            headers: { token },
            params: { page: 1, limit: 1000 },
          }),
          axios.get(`${baseUrl}/api/admin/get-all-recovery-content`, {
            headers: { token },
            params: { page: 1, limit: 1000 },
          }),
        ]);

        const exList = exRes?.data?.result?.exercises ?? [];
        const nuList = nuRes?.data?.result?.items ?? [];
        const reList = reRes?.data?.result?.contentList ?? [];

        setExerciseOptions(
          Array.isArray(exList)
            ? exList
                .map((ex) => ({ id: ex?._id ?? ex?.id, title: ex?.title ?? "" }))
                .filter((x) => x.id && x.title)
            : []
        );
        setNutritionOptions(
          Array.isArray(nuList)
            ? nuList
                .map((n) => ({ id: n?._id ?? n?.id, name: n?.name ?? n?.foodItem ?? "" }))
                .filter((x) => x.id && x.name)
            : []
        );
        setRecoveryOptions(
          Array.isArray(reList)
            ? reList
                .map((r) => ({ id: r?._id ?? r?.id, title: r?.title ?? "" }))
                .filter((x) => x.id && x.title)
            : []
        );
      } catch (err) {
        console.error("Fetch access lists failed:", err?.response?.data || err?.message);
        toast.error(err?.response?.data?.message || "Failed to fetch access lists");
      } finally {
        setIsLoadingAccessLists(false);
      }
    };

    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [modal.open]);

  useEffect(() => {
    if (!modal.open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setModal({ open: false, mode: "add", planId: null });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modal.open]);

  useEffect(() => {
    if (!deleteModal.open) return;
    const onKeyDown = (e) => {
      if (e.key === "Escape") setDeleteModal({ open: false, planId: null });
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [deleteModal.open]);

  const totalPlans = plans.length;
  const selectedPlan = useMemo(() => plans.find((p) => p.id === selected) ?? null, [plans, selected]);

  const onConfirm = async (planId) => {
    setIsSaving(true);
    try {
      // Hook your API call here.
      await new Promise((r) => setTimeout(r, 500));
      toast.success(`Selected plan: ${planId}`);
    } catch (e) {
      toast.error(e?.message || "Failed to update plan");
    } finally {
      setIsSaving(false);
    }
  };

  const openAdd = () => {
    setDraft(planToDraft(null));
    setModal({ open: true, mode: "add", planId: null });
  };

  const openView = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setDraft(planToDraft(plan));
    setModal({ open: true, mode: "view", planId });
  };

  const openEdit = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    setDraft(planToDraft(plan));
    setModal({ open: true, mode: "edit", planId });
  };

  const closeModal = () => setModal({ open: false, mode: "add", planId: null });
  const closeDeleteModal = () => setDeleteModal({ open: false, planId: null });

  const normalizeDraftToPlan = (d) => {
    const name = d.name.trim();
    const tagline = d.tagline.trim() || "Perfect to get started";
    const price = d.price.trim();
    const period = d.period.trim() || "/month";
    const features = d.featuresText
      .split("\n")
      .map((f) => f.trim())
      .filter(Boolean);
    const access = {
      exerciseLibrary: !!d?.access?.exerciseLibrary,
      nutritionMacros: !!d?.access?.nutritionMacros,
      recoveryContent: !!d?.access?.recoveryContent,
    };
    const accessItems = {
      exerciseLibrary: access.exerciseLibrary
        ? {
            mode: d?.accessItems?.exerciseLibrary?.mode === "selected" ? "selected" : "all",
            ids: Array.isArray(d?.accessItems?.exerciseLibrary?.ids) ? d.accessItems.exerciseLibrary.ids : [],
          }
        : { mode: "all", ids: [] },
      nutritionMacros: access.nutritionMacros
        ? {
            mode: d?.accessItems?.nutritionMacros?.mode === "selected" ? "selected" : "all",
            ids: Array.isArray(d?.accessItems?.nutritionMacros?.ids) ? d.accessItems.nutritionMacros.ids : [],
          }
        : { mode: "all", ids: [] },
      recoveryContent: access.recoveryContent
        ? {
            mode: d?.accessItems?.recoveryContent?.mode === "selected" ? "selected" : "all",
            ids: Array.isArray(d?.accessItems?.recoveryContent?.ids) ? d.accessItems.recoveryContent.ids : [],
          }
        : { mode: "all", ids: [] },
    };

    return { name, tagline, price, period, features, access, accessItems };
  };

  const isValidPrice = (value) => {
    const v = String(value ?? "").trim();
    // Allow: 9, 9.9, 9.99, 1000.00 (no currency symbols / letters)
    if (!/^\d+(\.\d{1,2})?$/.test(v)) return false;
    const n = Number(v);
    return Number.isFinite(n) && n > 0 && n <= 99999.99;
  };

  const sanitizePriceInput = (value) => {
    // Keep digits + one dot, max 2 decimals.
    let v = String(value ?? "");
    v = v.replace(/[^\d.]/g, "");
    const firstDot = v.indexOf(".");
    if (firstDot !== -1) {
      v = v.slice(0, firstDot + 1) + v.slice(firstDot + 1).replace(/\./g, "");
      const [a, b = ""] = v.split(".");
      v = `${a}.${b.slice(0, 2)}`;
    }
    // Enforce max value limit
    const n = Number(v);
    if (Number.isFinite(n) && n > 99999.99) return "99999.99";
    return v;
  };

  const validatePlan = ({ name, price, features }) => {
    if (!name || !price) return "Plan name and price are required.";
    if (String(name).length > 50) return "Plan name must be 50 characters or less.";
    if (!isValidPrice(price)) return "Enter a valid price (1 - 99999.99, up to 2 decimals).";
    if (!features?.length) return "Add at least one feature.";
    const idBase = makePlanId(name);
    if (!idBase) return "Enter a valid plan name.";
    return null;
  };

  const handleCreatePlan = () => {
    const parsed = normalizeDraftToPlan(draft);
    const err = validatePlan(parsed);
    if (err) return toast.error(err, { id: "subscription-create-plan-validation" });

    const idBase = makePlanId(parsed.name);
    if (plans.some((p) => p.id === idBase || p.name.toLowerCase() === parsed.name.toLowerCase())) {
      toast.error("Plan with this name already exists.", { id: "subscription-create-plan-duplicate" });
      return;
    }

    const createdPlan = { id: idBase, ...parsed };
    setPlans((prev) => [...prev, createdPlan]);
    setSelected(createdPlan.id);
    toast.success(`Plan "${parsed.name}" created.`, { id: "subscription-create-plan-success" });
    closeModal();
  };

  const handleUpdatePlan = () => {
    if (!modal.planId) return;
    const existing = plans.find((p) => p.id === modal.planId);
    if (!existing) return;

    const parsed = normalizeDraftToPlan(draft);
    const err = validatePlan(parsed);
    if (err) return toast.error(err, { id: "subscription-update-plan-validation" });

    const nextId = makePlanId(parsed.name);
    if (!nextId) {
      toast.error("Enter a valid plan name.", { id: "subscription-update-plan-invalid-name" });
      return;
    }

    const nameClash = plans.some(
      (p) =>
        p.id !== existing.id &&
        (p.id === nextId || p.name.toLowerCase() === parsed.name.toLowerCase())
    );
    if (nameClash) {
      toast.error("Another plan with this name already exists.", { id: "subscription-update-plan-duplicate" });
      return;
    }

    setPlans((prev) =>
      prev.map((p) => (p.id === existing.id ? { ...p, id: nextId, ...parsed } : p))
    );

    if (selected === existing.id) setSelected(nextId);
    toast.success(`Plan "${parsed.name}" updated.`, { id: "subscription-update-plan-success" });
    closeModal();
  };

  const requestDeletePlan = (planId) => {
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;
    if (plans.length <= 1) {
      toast.error("At least one subscription plan must remain.", { id: "subscription-delete-plan-min-one" });
      return;
    }
    setDeleteModal({ open: true, planId });
  };

  const confirmDeletePlan = () => {
    const planId = deleteModal.planId;
    if (!planId) return;
    const plan = plans.find((p) => p.id === planId);
    if (!plan) return;

    const nextPlans = plans.filter((p) => p.id !== planId);
    setPlans(nextPlans);
    if (selected === planId) {
      setSelected(nextPlans[0]?.id || "");
    }
    toast.success(`Plan "${plan.name}" deleted.`, { id: "subscription-delete-plan-success" });
    closeDeleteModal();
  };

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <AdminHeaderCard
        title="Subscription"
        subtitle="Manage subscription plan offerings."
        stats={
          <p className="text-sm text-muted-foreground">
            Total plans: <span className="font-semibold text-foreground">{totalPlans}</span>
            {/* {selectedPlan ? (
              <>
                <span className="mx-2 text-muted-foreground/60">|</span>
                Active: <span className="font-semibold text-foreground">{selectedPlan.name}</span>
              </>
            ) : null} */}
          </p>
        }
        actions={
          <Button type="button" onClick={openAdd}>
            <HiOutlinePlus className="h-4 w-4" />
            Add plan
          </Button>
        }
      />

      <div className="bg-card text-card-foreground rounded-2xl border border-border shadow-md p-0 mt-6 overflow-hidden">
        {/* <div className="px-6 md:px-7 py-5 md:py-6 bg-gradient-to-r from-emerald-50 via-background to-amber-50/50 dark:from-emerald-950/35 dark:via-background dark:to-amber-950/15 border-b border-border">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold leading-6">Plans</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Total plans: <span className="font-semibold text-foreground">{totalPlans}</span>
              {selectedPlan ? (
                <>
                  {" "}
                  • Active: <span className="font-semibold text-foreground">{selectedPlan.name}</span>
                </>
              ) : null}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button
              type="button"
              variant="outline"
              className="justify-center"
              onClick={() => onConfirm(selected)}
              disabled={!selected}
            >
              Save active plan
            </Button>
            <Button type="button" variant="outline" className="justify-center" onClick={openAdd}>
              <HiOutlinePlus className="h-4 w-4" />
              Add plan
            </Button>
          </div>
        </div>
        </div> */}

        <div className="p-6 md:p-7">
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {plans.map((p) => (
            <div
              key={p.id}
              className={[
                "rounded-2xl border border-border bg-card shadow-sm overflow-hidden",
                selected === p.id ? "ring-1 ring-emerald-500/25 border-emerald-500/40" : "ring-1 ring-emerald-500/25 border-emerald-500/40",
              ].join(" ")}
            >
              <div className="px-5 py-4 bg-gradient-to-r from-emerald-50/70 via-background to-amber-50/30 dark:from-emerald-950/25 dark:via-background dark:to-amber-950/10 border-b border-border">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold truncate">{p.name}</p>
                    <p className="text-xs text-muted-foreground mt-1 truncate">{p.tagline}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <p className="text-sm font-semibold">
                      {p.price}
                      <span className="text-xs font-medium text-muted-foreground">{p.period}</span>
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">{p.features?.length ?? 0} features</p>
                  </div>
                </div>
              </div>

              <div className="p-5">

                <div>
                  <ul className="space-y-2 text-sm text-muted-foreground">
                    {(p.features ?? []).slice(0, 4).map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                        <span className="leading-snug">{f}</span>
                      </li>
                    ))}
                    {(p.features?.length ?? 0) > 4 ? (
                      <li className="text-sm text-muted-foreground">+{p.features.length - 4} more…</li>
                    ) : null}
                  </ul>
                </div>

                <div className="mt-4 border-t border-border pt-4">
                  <div className="grid grid-cols-3 gap-3">
                    <Button type="button" variant="outline" className="justify-center" onClick={() => openView(p.id)}>
                      <HiOutlineEye className="h-4 w-4" />
                      <span className="hidden sm:inline">Details</span>
                      <span className="sm:hidden">Info</span>
                    </Button>
                    <Button type="button" variant="outline" className="justify-center" onClick={() => openEdit(p.id)}>
                      <HiOutlinePencil className="h-4 w-4" />
                      <span className="hidden sm:inline">Update</span>
                      <span className="sm:hidden">Edit</span>
                    </Button>
                    <Button
                      type="button"
                      variant="destructive"
                      className="justify-center"
                      onClick={() => requestDeletePlan(p.id)}
                      disabled={plans.length <= 1}
                    >
                      <HiOutlineTrash className="h-4 w-4" />
                      <span className="hidden sm:inline">Remove</span>
                      <span className="sm:hidden">Del</span>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>
      </div>

      {isMounted && modal.open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1100] flex items-center justify-center bg-black/45 backdrop-blur-sm px-3"
              role="dialog"
              aria-modal="true"
              onClick={closeModal}
            >
              <div
                className="w-full max-w-2xl rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden max-h-[90vh] flex flex-col"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-4 md:px-6 md:py-4 border-b border-border flex items-center justify-between gap-3 bg-gradient-to-r from-emerald-50 via-background to-amber-50/40 dark:from-emerald-950/35 dark:via-background dark:to-amber-950/15 sticky top-0 z-10">
                  <div>
                    <p className="text-sm font-semibold">
                      {modal.mode === "add"
                        ? "Add Plan"
                        : modal.mode === "edit"
                          ? "Update Plan"
                          : "Plan details"}
                    </p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {modal.mode === "view"
                        ? "Read-only view of plan details."
                        : "Name, pricing, and features shown in the app."}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex h-10 w-10 items-center justify-center rounded-xl border border-border bg-background text-foreground hover:bg-muted transition-colors"
                    aria-label="Close"
                  >
                    <HiX className="h-5 w-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto">
                  {modal.mode === "view" ? (
                    <div className="p-5 md:p-6 space-y-4">
                      <div className="rounded-2xl border border-border bg-muted/20 p-4">
                        <div className="flex items-start justify-between gap-3">
                          <div className="min-w-0">
                            <p className="text-base font-semibold">{draft.name || "—"}</p>
                            <p className="text-sm text-muted-foreground mt-1">{draft.tagline || "—"}</p>
                          </div>
                          <div className="text-right shrink-0">
                            <p className="text-base font-semibold">
                              {draft.price || "—"}
                              <span className="text-sm font-medium text-muted-foreground">{draft.period || ""}</span>
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Features
                        </p>
                        <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
                          {(draft.featuresText || "")
                            .split("\n")
                            .map((x) => x.trim())
                            .filter(Boolean)
                            .map((f) => (
                              <li key={f} className="flex items-start gap-2">
                                <span className="mt-2 h-1.5 w-1.5 rounded-full bg-emerald-500 shrink-0" />
                                <span className="leading-snug">{f}</span>
                              </li>
                            ))}
                        </ul>
                      </div>

                      <div className="rounded-2xl border border-border bg-card p-4">
                        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                          Plan access
                        </p>
                        <div className="mt-3 grid gap-2 sm:grid-cols-3">
                          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                            <span className="font-semibold text-foreground">Exercise Library</span>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {!draft.access?.exerciseLibrary
                                ? "Not included"
                                : draft.accessItems?.exerciseLibrary?.mode === "selected"
                                  ? `${draft.accessItems?.exerciseLibrary?.ids?.length ?? 0} selected`
                                  : "All items"}
                            </div>
                          </div>
                          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                            <span className="font-semibold text-foreground">Nutrition &amp; Macros</span>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {!draft.access?.nutritionMacros
                                ? "Not included"
                                : draft.accessItems?.nutritionMacros?.mode === "selected"
                                  ? `${draft.accessItems?.nutritionMacros?.ids?.length ?? 0} selected`
                                  : "All items"}
                            </div>
                          </div>
                          <div className="rounded-xl border border-border bg-muted/20 px-3 py-2 text-sm">
                            <span className="font-semibold text-foreground">Recovery Content</span>
                            <div className="text-xs text-muted-foreground mt-0.5">
                              {!draft.access?.recoveryContent
                                ? "Not included"
                                : draft.accessItems?.recoveryContent?.mode === "selected"
                                  ? `${draft.accessItems?.recoveryContent?.ids?.length ?? 0} selected`
                                  : "All items"}
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                        <Button type="button" variant="outline" onClick={closeModal}>
                          Close
                        </Button>
                        <Button type="button" onClick={() => openEdit(modal.planId)}>
                          <HiOutlinePencil className="h-4 w-4" />
                          Update
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="p-5 md:p-6 space-y-4">
                    <div className="grid gap-4 md:grid-cols-2">
                      <div>
                        <label className={labelCls}>
                          Plan name <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={draft.name}
                          onChange={(e) => setDraft((p) => ({ ...p, name: e.target.value }))}
                          placeholder="e.g. Elite"
                          maxLength={50}
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>
                          Price <span className="text-red-500">*</span>
                        </label>
                        <Input
                          value={draft.price}
                          onChange={(e) =>
                            setDraft((p) => ({ ...p, price: sanitizePriceInput(e.target.value) }))
                          }
                          inputMode="decimal"
                          maxLength={9}
                          placeholder="e.g. 39.99"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Tagline</label>
                        <Input
                          value={draft.tagline}
                          onChange={(e) => setDraft((p) => ({ ...p, tagline: e.target.value }))}
                          placeholder="e.g. Best for serious athletes"
                          className="mt-1.5"
                        />
                      </div>
                      <div>
                        <label className={labelCls}>Period</label>
                        <Input
                          value={draft.period}
                          onChange={(e) => setDraft((p) => ({ ...p, period: e.target.value }))}
                          placeholder="/month"
                          className="mt-1.5"
                        />
                      </div>
                    </div>

                    <div>
                      <label className={labelCls}>
                        Features (one per line) <span className="text-red-500">*</span>
                      </label>
                      <Textarea
                        value={draft.featuresText}
                        onChange={(e) => setDraft((p) => ({ ...p, featuresText: e.target.value }))}
                        placeholder={"Priority support\nCustom plans\nCoach check-ins"}
                        className="mt-1.5 min-h-[140px]"
                      />
                    </div>

                    <div className="rounded-2xl border border-border bg-muted/10 p-4">
                      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Plan access
                      </p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        Select which admin modules are available for this plan in the app.
                      </p>

                      <div className="mt-3 grid gap-2 sm:grid-cols-3">
                        {ACCESS_OPTIONS.map((opt) => (
                          <label
                            key={opt.key}
                            className="flex items-center justify-between gap-3 rounded-xl border border-border bg-background px-3 py-2.5 text-sm hover:bg-muted/30 transition-colors"
                          >
                            <span className="font-medium text-foreground">{opt.label}</span>
                            <input
                              type="checkbox"
                              checked={!!draft.access?.[opt.key]}
                              onChange={() =>
                                setDraft((p) => ({
                                  ...p,
                                  access: { ...p.access, [opt.key]: !p.access?.[opt.key] },
                                }))
                              }
                              className="h-4 w-4 accent-primary"
                            />
                          </label>
                        ))}
                      </div>

                      {isLoadingAccessLists ? (
                        <div className="mt-3 rounded-xl border border-border bg-background px-3 py-2 text-xs text-muted-foreground">
                          Loading module lists…
                        </div>
                      ) : null}

                      {draft.access?.exerciseLibrary ? (
                        <AccessItemPicker
                          title="Exercise Library"
                          items={exerciseOptions}
                          labelGetter={(x) => x.title}
                          mode={draft.accessItems?.exerciseLibrary?.mode ?? "all"}
                          selectedIds={draft.accessItems?.exerciseLibrary?.ids ?? []}
                          onModeChange={(m) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, exerciseLibrary: { ...p.accessItems.exerciseLibrary, mode: m } },
                            }))
                          }
                          onSelectedIdsChange={(ids) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, exerciseLibrary: { ...p.accessItems.exerciseLibrary, ids } },
                            }))
                          }
                        />
                      ) : null}

                      {draft.access?.nutritionMacros ? (
                        <AccessItemPicker
                          title="Nutrition & Macros"
                          items={nutritionOptions}
                          labelGetter={(x) => x.name}
                          mode={draft.accessItems?.nutritionMacros?.mode ?? "all"}
                          selectedIds={draft.accessItems?.nutritionMacros?.ids ?? []}
                          onModeChange={(m) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, nutritionMacros: { ...p.accessItems.nutritionMacros, mode: m } },
                            }))
                          }
                          onSelectedIdsChange={(ids) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, nutritionMacros: { ...p.accessItems.nutritionMacros, ids } },
                            }))
                          }
                        />
                      ) : null}

                      {draft.access?.recoveryContent ? (
                        <AccessItemPicker
                          title="Recovery Content"
                          items={recoveryOptions}
                          labelGetter={(x) => x.title}
                          mode={draft.accessItems?.recoveryContent?.mode ?? "all"}
                          selectedIds={draft.accessItems?.recoveryContent?.ids ?? []}
                          onModeChange={(m) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, recoveryContent: { ...p.accessItems.recoveryContent, mode: m } },
                            }))
                          }
                          onSelectedIdsChange={(ids) =>
                            setDraft((p) => ({
                              ...p,
                              accessItems: { ...p.accessItems, recoveryContent: { ...p.accessItems.recoveryContent, ids } },
                            }))
                          }
                        />
                      ) : null}
                    </div>

                    <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                      <Button type="button" variant="outline" onClick={closeModal}>
                        Cancel
                      </Button>
                      {modal.mode === "add" ? (
                        <Button type="button" onClick={handleCreatePlan}>
                          <HiOutlinePlus className="h-4 w-4" />
                          Create plan
                        </Button>
                      ) : null}
                      {modal.mode === "edit" ? (
                        <Button type="button" onClick={handleUpdatePlan}>
                          <HiOutlinePencil className="h-4 w-4" />
                          Save
                        </Button>
                      ) : null}
                    </div>
                    </div>
                  )}
                </div>
              </div>
            </div>,
            document.body
          )
        : null}

      {isMounted && deleteModal.open
        ? createPortal(
            <div
              className="fixed inset-0 z-[1150] flex items-center justify-center bg-black/45 backdrop-blur-sm px-3"
              role="dialog"
              aria-modal="true"
              onClick={closeDeleteModal}
            >
              <div
                className="w-full max-w-md rounded-2xl border border-border bg-card text-card-foreground shadow-xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="px-5 py-4 border-b border-border bg-gradient-to-r from-emerald-50 via-background to-amber-50/40 dark:from-emerald-950/35 dark:via-background dark:to-amber-950/15">
                  <p className="text-sm font-semibold">Remove plan?</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    This will remove the plan from the catalog.
                  </p>
                </div>
                <div className="p-5 space-y-4">
                  <div className="rounded-xl border border-border bg-muted/20 p-3 text-sm">
                    <span className="text-muted-foreground">Plan ID:</span>{" "}
                    <span className="font-semibold">{deleteModal.planId}</span>
                  </div>
                  <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end">
                    <Button type="button" variant="outline" onClick={closeDeleteModal}>
                      Cancel
                    </Button>
                    <Button type="button" variant="destructive" onClick={confirmDeletePlan}>
                      <HiOutlineTrash className="h-4 w-4" />
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            </div>,
            document.body
          )
        : null}
    </div>
  );
}

