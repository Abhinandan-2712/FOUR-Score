"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineArrowLeft, HiOutlineUpload } from "react-icons/hi";
import { LiaDnaSolid } from "react-icons/lia";

export default function NewExercisePage() {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState("Beginner");
  const [mediaType, setMediaType] = useState("Video");
  const [mediaFile, setMediaFile] = useState(null);
  const [mediaError, setMediaError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const difficultyOptions = ["Beginner", "Intermediate", "Advanced"];
  const mediaOptions = ["Video", "Image", "GIF"];

  const chipClasses = (active) =>
    `flex-1 rounded-xl border text-sm font-medium py-2.5 px-4 text-center transition-all ${
      active
        ? "border-[#0A3161] bg-[#0A3161]/5 text-[#0A3161] shadow-sm"
        : "border-[#C8D7E9] bg-white text-[#2158A3] hover:bg-[#F2F5FA]"
    }`;

  return (
    <div className="min-h-[80vh] py-8 px-1">
      {/* Header */}
      <div className="flex items-center gap-4 ">
        <button
          type="button"
          onClick={() => router.back()}
          className="flex h-12 w-12 items-center justify-center rounded-lg border border-[#C8D7E9] bg-white text-[#0A3161] hover:bg-[#F2F5FA] transition-colors"
          aria-label="Back"
        >
          <HiOutlineArrowLeft className="h-5 w-5" />
        </button>

        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[#0A3161] text-white shadow-md">
            <LiaDnaSolid className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6">
              Add New Exercise
            </h1>
            <p className="text-sm text-[#2158A3]">Create a new exercise</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#C8D7E9] shadow-md p-6 md:p-7 mt-6">
        {/* Title & Category */}
        <div className="grid gap-5 md:grid-cols-2">
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Exercise Title <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="Enter exercise title"
            />
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Category <span className="text-red-500">*</span>
            </label>
            <Input
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="Enter category (e.g., Chest)"
            />
          </div>
        </div>

        {/* Difficulty Level */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Difficulty Level <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {difficultyOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={chipClasses(difficulty === opt)}
                onClick={() => setDifficulty(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Media Type */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Media Type <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 grid gap-3 md:grid-cols-3">
            {mediaOptions.map((opt) => (
              <button
                key={opt}
                type="button"
                className={chipClasses(mediaType === opt)}
                onClick={() => setMediaType(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div>

        {/* Upload Media */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">Upload Media</label>

          <input
            type="file"
            accept="video/mp4,video/quicktime"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const maxSize = 50 * 1024 * 1024; // 50MB
              const validTypes = ["video/mp4", "video/quicktime"];

              if (!validTypes.includes(file.type)) {
                setMediaError("Only MP4 or MOV files are allowed.");
                setMediaFile(null);
                return;
              }

              if (file.size > maxSize) {
                setMediaError("File size must be less than 50MB.");
                setMediaFile(null);
                return;
              }

              setMediaError("");
              setMediaFile(file);
            }}
          />

          <div
            className={`mt-2 flex flex-col items-center justify-center rounded-2xl border border-dashed px-4 py-10 text-center cursor-pointer transition-colors ${
              isDragging
                ? "border-[#0A3161] bg-[#E3ECF8]"
                : "border-[#C8D7E9] bg-[#F5F7FB] hover:border-[#0A3161]"
            }`}
            role="button"
            tabIndex={0}
            onClick={() => fileInputRef.current?.click()}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                fileInputRef.current?.click();
              }
            }}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={(e) => {
              e.preventDefault();
              setIsDragging(false);
            }}
            onDrop={(e) => {
              e.preventDefault();
              setIsDragging(false);

              const file = e.dataTransfer.files?.[0];
              if (!file) return;

              const maxSize = 50 * 1024 * 1024; // 50MB
              const validTypes = ["video/mp4", "video/quicktime"];

              if (!validTypes.includes(file.type)) {
                setMediaError("Only MP4 or MOV files are allowed.");
                setMediaFile(null);
                return;
              }

              if (file.size > maxSize) {
                setMediaError("File size must be less than 50MB.");
                setMediaFile(null);
                return;
              }

              setMediaError("");
              setMediaFile(file);
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0A3161] shadow-sm mb-3">
              <HiOutlineUpload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-[#0A3161]">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-[#5671A6]">MP4, MOV (max 50MB)</p>
          </div>

          {mediaFile && (
            <p className="mt-3 text-xs text-[#2158A3]">
              Selected: <span className="font-medium">{mediaFile.name}</span>{" "}
              ({(mediaFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}

          {mediaError && (
            <p className="mt-2 text-xs text-red-500">
              {mediaError}
            </p>
          )}
        </div>

        {/* Instructions */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Instructions <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className="mt-1.5 w-full border border-[#C8D7E9] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A3161]/30 resize-none"
            placeholder="Enter exercise instructions..."
          />
        </div>

        {/* Alternate Exercise */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Alternate Exercise <span className="text-xs font-normal text-[#5671A6]">
              (Optional)
            </span>
          </label>
          <Input
            className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
            placeholder="Enter alternate exercise..."
          />
        </div>

        {/* Footer buttons */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={() => router.push("/exercise-library")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full justify-center bg-[#0A3161] hover:bg-[#0D3D7A]"
            onClick={() => console.log("Add Exercise")}
          >
            Add Exercise
          </Button>
        </div>
      </div>
    </div>
  );
}

