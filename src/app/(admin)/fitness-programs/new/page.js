"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-hot-toast";
import { appendProgramFields } from "@/lib/fitnessProgramApi";
import { Button } from "@/components/ui/button";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { MdFitnessCenter } from "react-icons/md";
import { createEmptyProgramDetailForId } from "../data";
import FitnessProgramEditorForm from "../components/FitnessProgramEditorForm";

export default function NewFitnessProgramPage() {
  const router = useRouter();
  const [draft, setDraft] = useState(() => createEmptyProgramDetailForId("new"));
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!draft?.title?.trim() || !draft?.subHeader?.trim() || !draft?.overview?.trim()) {
      toast.error("Program name, Sub-header, and Overview are required.");
      return;
    }
    if (!draft?.level?.trim()) {
      toast.error("Level is required.");
      return;
    }

    const w = Number(draft.durationWeeks);
    const f = Number(draft.frequencyPerWeek);
    const a = Number(draft.avgSessionMinutes);
    if (Number.isNaN(w) || w < 1 || Number.isNaN(f) || f < 1 || Number.isNaN(a) || a < 1) {
      toast.error("Please enter valid numbers for duration, frequency, and session length.");
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
      const emailFromToken = (() => {
        try {
          const base64Url = token.split(".")[1];
          if (!base64Url) return null;
          const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
          const padded = base64.padEnd(base64.length + (4 - (base64.length % 4)) % 4, "=");
          return JSON.parse(atob(padded))?.email ?? null;
        } catch {
          return null;
        }
      })();

      const buildFormData = () => {
        const formData = new FormData();
        appendProgramFields(formData, draft);
        if (emailFromToken) {
          formData.append("email", emailFromToken);
        }
        return formData;
      };

      const authHeaders = {
        token,
        Authorization: `Bearer ${token}`,
      };

      const postProgram = (path) =>
        axios.post(`${baseUrl}${path}`, buildFormData(), { headers: authHeaders });

      let res;
      try {
        res = await postProgram("/api/admin/add-programs");
      } catch (firstErr) {
        if (firstErr?.response?.status === 404) {
          res = await postProgram("/api/admin/add-program");
        } else {
          throw firstErr;
        }
      }

      const data = res?.data ?? {};
      const failed =
        data.success === false ||
        (typeof data.statusCode === "number" && data.statusCode >= 400);

      if (failed) {
        toast.error(data.message || "Failed to save program");
        return;
      }

      toast.success(data.message || "Program saved.");
      router.push("/fitness-programs");
    } catch (err) {
      console.error("Add program failed:", err?.response?.data || err?.message);
      const msg =
        err?.response?.data?.message ||
        err?.response?.data?.error ||
        (typeof err?.response?.data === "string" ? err.response.data : null) ||
        err?.message ||
        "Failed to save program";
      toast.error(msg);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-6 sm:py-8 px-3 sm:px-4 mx-auto ">
      <header className="flex flex-wrap items-center gap-4">
        <button
          type="button"
          onClick={() => router.push("/fitness-programs")}
          className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#F2F5FA] transition-colors shadow-sm"
          aria-label="Back to programs"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>
        <div className="flex min-w-0 flex-1 items-center gap-3">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#0A3161] text-white shadow-md">
            <MdFitnessCenter className="h-6 w-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-xl font-semibold text-[#0A3161] tracking-tight">Add program</h1>
            <p className="text-sm text-[#5671A6] mt-0.5">
              Four steps — <span className="text-[#2158A3]">Next</span> opens schedule, workouts, then recovery.
            </p>
          </div>
        </div>
      </header>

      <FitnessProgramEditorForm
        draft={draft}
        setDraft={setDraft}
        isSaving={isSaving}
        onCancel={() => router.push("/fitness-programs")}
        onSave={handleSave}
        saveLabel="Save program"
        wizardMode
      />
    </div>
  );
}
