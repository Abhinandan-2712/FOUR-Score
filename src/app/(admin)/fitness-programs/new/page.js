"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineArrowLeft, HiOutlineDocumentText, HiOutlineClipboardList, HiOutlineChartBar } from "react-icons/hi";
import { MdFitnessCenter } from "react-icons/md";
import { FormSection, lbl, choiceChip } from "../components/FormSection";

const LEVEL_OPTIONS = ["Beginner", "Intermediate", "Advanced"];

export default function NewFitnessProgramPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [subHeader, setSubHeader] = useState("");
  const [overview, setOverview] = useState("");
  const [whatsInside, setWhatsInside] = useState("");
  const [isThisForYou, setIsThisForYou] = useState("");
  const [theGoal, setTheGoal] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [durationWeeks, setDurationWeeks] = useState("4");
  const [frequencyPerWeek, setFrequencyPerWeek] = useState("5");
  const [avgSessionMinutes, setAvgSessionMinutes] = useState("35");
  const [locationTag, setLocationTag] = useState("Workout From Home");
  const [equipment, setEquipment] = useState("");
  const [status, setStatus] = useState("Active");
  const [isSaving, setIsSaving] = useState(false);

  const handleSave = async () => {
    if (!title.trim() || !subHeader.trim() || !overview.trim()) {
      toast.error("Please fill Title, Sub-header, and Overview.");
      return;
    }

    const w = Number(durationWeeks);
    const f = Number(frequencyPerWeek);
    const a = Number(avgSessionMinutes);
    if (Number.isNaN(w) || w < 1 || Number.isNaN(f) || f < 1 || Number.isNaN(a) || a < 1) {
      toast.error("Please enter valid numbers for duration, frequency, and session length.");
      return;
    }

    setIsSaving(true);
    await new Promise((r) => setTimeout(r, 400));
    try {
      toast.success("Program saved (UI preview — no API yet).");
      router.push("/fitness-programs");
    } finally {
      setIsSaving(false);
    }
  };

  const ta =
    "w-full rounded-xl border border-[#C8D7E9] bg-white px-3.5 py-2.5 text-sm text-[#0A3161] placeholder:text-[#94a3c8] outline-none focus:ring-2 focus:ring-[#0A3161]/25 resize-y";
  const inp =
    "h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm text-[#0A3161] shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/25";

  return (
    <div className="min-h-[80vh] py-8 px-1  mx-auto">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
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
              <h1 className="text-xl font-semibold text-[#0A3161] leading-6 truncate">Add fitness program</h1>
              <p className="text-sm text-[#2158A3] truncate">
                Content &amp; stats for the app — preview only until API is connected.
              </p>
            </div>
          </div>
        </div>
        <span className="self-start sm:self-center inline-flex items-center rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-medium text-amber-900">
          UI preview
        </span>
      </div>

      <div className="mt-8 rounded-2xl border border-[#C8D7E9] bg-white shadow-md overflow-hidden">
        <div className="p-6 md:p-8 space-y-6 bg-[linear-gradient(180deg,#FAFCFF_0%,#FFFFFF_40%)] max-w-6xl mx-auto w-full">
          <FormSection
            title="Program content"
            hint="Title and overview appear on the program detail screen in the app."
            icon={<HiOutlineDocumentText />}
            tone="sky"
          >
            <div>
              <label className={lbl}>
                Program title <span className="text-red-500 normal-case">*</span>
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className={`mt-1.5 ${inp}`}
                placeholder="e.g. 28-Day Full Body Foundations"
              />
            </div>
            <div>
              <label className={lbl}>
                Sub-header <span className="text-red-500 normal-case">*</span>
              </label>
              <Input
                value={subHeader}
                onChange={(e) => setSubHeader(e.target.value)}
                className={`mt-1.5 ${inp}`}
                placeholder="Short line under the title"
              />
            </div>
            <div>
              <label className={lbl}>
                Overview <span className="text-red-500 normal-case">*</span>
              </label>
              <textarea
                rows={5}
                value={overview}
                onChange={(e) => setOverview(e.target.value)}
                className={`mt-1.5 ${ta} min-h-[120px]`}
                placeholder="Intro paragraphs for the program…"
              />
            </div>
          </FormSection>

          <FormSection
            title="Additional sections"
            hint="Optional. Use one line per bullet where noted — the app can render them as a list."
            icon={<HiOutlineClipboardList />}
            tone="violet"
          >
            <div>
              <label className={lbl}>What&apos;s inside</label>
              <textarea
                rows={4}
                value={whatsInside}
                onChange={(e) => setWhatsInside(e.target.value)}
                className={`mt-1.5 ${ta}`}
                placeholder={"3 Strength Days: …\n2 Active Recovery Days: …"}
              />
            </div>
            <div>
              <label className={lbl}>Is this for you?</label>
              <textarea
                rows={4}
                value={isThisForYou}
                onChange={(e) => setIsThisForYou(e.target.value)}
                className={`mt-1.5 ${ta}`}
                placeholder="One bullet per line"
              />
            </div>
            <div>
              <label className={lbl}>The goal</label>
              <textarea
                rows={3}
                value={theGoal}
                onChange={(e) => setTheGoal(e.target.value)}
                className={`mt-1.5 ${ta}`}
                placeholder="What the user achieves by the end"
              />
            </div>
          </FormSection>

          <FormSection
            title="Quick stats &amp; metadata"
            hint="Shown as badges / summary rows in the mobile UI."
            icon={<HiOutlineChartBar />}
            tone="emerald"
          >
            <div>
              <label className={lbl}>Level</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {LEVEL_OPTIONS.map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={choiceChip(level === opt)}
                    onClick={() => setLevel(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              <div>
                <label className={lbl}>Duration (weeks)</label>
                <Input
                  type="number"
                  min={1}
                  value={durationWeeks}
                  onChange={(e) => setDurationWeeks(e.target.value)}
                  className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                />
              </div>
              <div>
                <label className={lbl}>Days / week</label>
                <Input
                  type="number"
                  min={1}
                  value={frequencyPerWeek}
                  onChange={(e) => setFrequencyPerWeek(e.target.value)}
                  className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                />
              </div>
              <div>
                <label className={lbl}>Avg. session (min)</label>
                <Input
                  type="number"
                  min={1}
                  value={avgSessionMinutes}
                  onChange={(e) => setAvgSessionMinutes(e.target.value)}
                  className="mt-1.5 h-11 rounded-lg border-[#C8D7E9]"
                />
              </div>
            </div>
            <div>
              <label className={lbl}>Location tag</label>
              <Input
                value={locationTag}
                onChange={(e) => setLocationTag(e.target.value)}
                className={`mt-1.5 h-11 rounded-lg border border-[#C8D7E9]`}
                placeholder="e.g. Workout From Home"
              />
            </div>
            <div>
              <label className={lbl}>Equipment</label>
              <p className="text-xs text-[#5671A6] mt-0.5 mb-1">One item per line.</p>
              <textarea
                rows={4}
                value={equipment}
                onChange={(e) => setEquipment(e.target.value)}
                className={ta}
                placeholder={"Bodyweight\nChair or bench\nYoga mat"}
              />
            </div>
            <div>
              <label className={lbl}>Status</label>
              <div className="mt-2 flex flex-wrap gap-2 max-w-md">
                {["Active", "Inactive"].map((opt) => (
                  <button
                    key={opt}
                    type="button"
                    className={choiceChip(status === opt)}
                    onClick={() => setStatus(opt)}
                  >
                    {opt}
                  </button>
                ))}
              </div>
            </div>
          </FormSection>
        </div>

        <div className="px-6 py-4 md:px-8 bg-[#F2F5FA] border-t border-[#E0E7F5] flex flex-col-reverse sm:flex-row sm:justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            className="border-[#C8D7E9] bg-white"
            onClick={() => router.push("/fitness-programs")}
            disabled={isSaving}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#0A3161] hover:bg-[#0D3D7A] min-w-[140px]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Save program"}
          </Button>
        </div>
      </div>
    </div>
  );
}
