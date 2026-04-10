"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { MdFitnessCenter } from "react-icons/md";
import { getProgramDetail, createEmptyProgramDetailForId } from "../../data";
import FitnessProgramEditorForm from "../../components/FitnessProgramEditorForm";
import {
  apiRowToEditorDraft,
  appendProgramFields,
  programEditKey,
  fetchProgramRawById,
} from "@/lib/fitnessProgramApi";

export default function EditFitnessProgramPage() {
  const router = useRouter();
  const params = useParams();
  const id = params?.id;

  const [draft, setDraft] = useState(null);
  const [loaded, setLoaded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    let cancelled = false;
    setLoaded(false);

    const applyDraft = (d) => {
      if (cancelled) return;
      setDraft(d ? JSON.parse(JSON.stringify(d)) : null);
      setLoaded(true);
    };

    try {
      const cached = sessionStorage.getItem(programEditKey(id));
      if (cached) {
        const raw = JSON.parse(cached);
        const empty = createEmptyProgramDetailForId(id);
        // Use cached data as fast placeholder, but still fetch full detail by id.
        applyDraft(apiRowToEditorDraft(raw, empty));
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
          applyDraft(apiRowToEditorDraft(found, empty));
          return;
        }
      }

      const mock = getProgramDetail(id);
      if (mock) {
        applyDraft(mock);
        return;
      }

      applyDraft(null);
    })();

    return () => {
      cancelled = true;
    };
  }, [id]);

  const titleLine = useMemo(() => draft?.title || "Program", [draft]);

  const handleSave = async () => {
    if (!draft?.title?.trim() || !draft?.subHeader?.trim() || !draft?.overview?.trim()) {
      toast.error("Program name, Sub-header, and Overview are required.");
      return;
    }
    if (!draft?.level?.trim()) {
      toast.error("Level is required.");
      return;
    }

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

    setIsSaving(true);
    try {
      const formData = new FormData();
      appendProgramFields(formData, draft);

      const res = await axios.post(
        `${baseUrl}/api/admin/update-programs/${encodeURIComponent(id)}`,
        formData,
        {
          headers: {
            token,
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = res?.data ?? {};
      if (data.success === false || (typeof data.statusCode === "number" && data.statusCode >= 400)) {
        toast.error(data.message || "Failed to update program");
        return;
      }

      try {
        sessionStorage.removeItem(programEditKey(id));
      } catch {
        /* ignore */
      }

      toast.success(data.message || "Program updated.");
      router.push("/fitness-programs");
    } catch (err) {
      console.error("Update program failed:", err?.response?.data || err?.message);
      toast.error(err?.response?.data?.message || "Failed to update program");
    } finally {
      setIsSaving(false);
    }
  };

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
              <h1 className="text-xl font-semibold text-[#0A3161] leading-6 truncate">{titleLine}</h1>
              <p className="text-sm text-[#2158A3] truncate">
                Edit program · <span className="font-mono text-xs text-[#5671A6]">{id}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <FitnessProgramEditorForm
        draft={draft}
        setDraft={setDraft}
        isSaving={isSaving}
        onCancel={() => router.push("/fitness-programs")}
        onSave={handleSave}
        saveLabel="Save changes"
      />
    </div>
  );
}
