"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineArrowLeft, HiOutlineUpload } from "react-icons/hi";
import { FaUtensils } from "react-icons/fa";

export default function NewNutritionPage() {
  const router = useRouter();
  const [category, setCategory] = useState("Breakfast");
  const [mealType, setMealType] = useState("Vegetarian");
  const [status, setStatus] = useState("Active");
  const [imageFile, setImageFile] = useState(null);
  const [imageError, setImageError] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const categoryOptions = ["Breakfast", "Lunch", "Dinner", "Snack"];
  const mealTypeOptions = ["Vegetarian", "Non-Vegetarian", "Vegan"];

  const chipClasses = (active) =>
    `flex-1 rounded-xl border text-sm font-medium py-2.5 px-4 text-center transition-all ${
      active
        ? "border-[#0A3161] bg-[#0A3161]/5 text-[#0A3161] shadow-sm"
        : "border-[#C8D7E9] bg-white text-[#2158A3] hover:bg-[#F2F5FA]"
    }`;

  return (
    <div className="min-h-[80vh] py-8 px-1">
      {/* Header */}
      <div className="flex items-center gap-4">
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
            <FaUtensils className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6">
              Add New Nutrition Item
            </h1>
            <p className="text-sm text-[#2158A3]">Create a new nutrition item</p>
          </div>
        </div>
      </div>

      {/* Card */}
      <div className="bg-white rounded-2xl border border-[#C8D7E9] shadow-md p-6 md:p-7 mt-6">
        {/* Food Item Name */}
        <div>
          <label className="text-sm font-medium text-[#0A3161]">
            Food Item Name <span className="text-red-500">*</span>
          </label>
          <Input
            className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
            placeholder="Enter food item name"
          />
        </div>

        {/* Category & Meal Type */}
        <div className="grid gap-5 md:grid-cols-2 mt-6">
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Category <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid gap-3 grid-cols-2">
              {categoryOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={chipClasses(category === opt)}
                  onClick={() => setCategory(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Meal Type <span className="text-red-500">*</span>
            </label>
            <div className="mt-2 grid gap-3 grid-cols-3">
              {mealTypeOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  className={chipClasses(mealType === opt)}
                  onClick={() => setMealType(opt)}
                >
                  {opt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Macros */}
        <div className="grid gap-5 md:grid-cols-4 mt-6">
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Calories (kcal) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Protein (g) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Carbs (g) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="0"
            />
          </div>
          <div>
            <label className="text-sm font-medium text-[#0A3161]">
              Fats (g) <span className="text-red-500">*</span>
            </label>
            <Input
              type="number"
              className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
              placeholder="0"
            />
          </div>
        </div>

        {/* Status */}
        {/* <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">Status</label>
          <div className="mt-2 grid gap-3 md:grid-cols-2">
            {["Active", "Inactive"].map((opt) => (
              <button
                key={opt}
                type="button"
                className={chipClasses(status === opt)}
                onClick={() => setStatus(opt)}
              >
                {opt}
              </button>
            ))}
          </div>
        </div> */}

        {/* Upload Image */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">Upload Image</label>

          <input
            type="file"
            accept="image/*"
            ref={fileInputRef}
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (!file) return;

              const maxSize = 10 * 1024 * 1024; // 10MB
              const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

              if (!validTypes.includes(file.type)) {
                setImageError("Only JPEG, PNG, or WEBP images are allowed.");
                setImageFile(null);
                return;
              }

              if (file.size > maxSize) {
                setImageError("File size must be less than 10MB.");
                setImageFile(null);
                return;
              }

              setImageError("");
              setImageFile(file);
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

              const maxSize = 10 * 1024 * 1024; // 10MB
              const validTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

              if (!validTypes.includes(file.type)) {
                setImageError("Only JPEG, PNG, or WEBP images are allowed.");
                setImageFile(null);
                return;
              }

              if (file.size > maxSize) {
                setImageError("File size must be less than 10MB.");
                setImageFile(null);
                return;
              }

              setImageError("");
              setImageFile(file);
            }}
          >
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white text-[#0A3161] shadow-sm mb-3">
              <HiOutlineUpload className="h-5 w-5" />
            </div>
            <p className="text-sm font-medium text-[#0A3161]">
              Click to upload or drag and drop
            </p>
            <p className="mt-1 text-xs text-[#5671A6]">JPEG, PNG, WEBP (max 10MB)</p>
          </div>

          {imageFile && (
            <p className="mt-3 text-xs text-[#2158A3]">
              Selected: <span className="font-medium">{imageFile.name}</span>{" "}
              ({(imageFile.size / (1024 * 1024)).toFixed(1)} MB)
            </p>
          )}

          {imageError && <p className="mt-2 text-xs text-red-500">{imageError}</p>}
        </div>

        {/* Description */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Description <span className="text-red-500">*</span>
          </label>
          <textarea
            rows={4}
            className="mt-1.5 w-full border border-[#C8D7E9] rounded-xl px-3.5 py-2.5 text-sm outline-none focus:ring-2 focus:ring-[#0A3161]/30 resize-none"
            placeholder="Enter nutritional information and description..."
          />
        </div>

        {/* Alternate Food */}
        <div className="mt-6">
          <label className="text-sm font-medium text-[#0A3161]">
            Alternate Food <span className="text-xs font-normal text-[#5671A6]">(Optional)</span>
          </label>
          <Input
            className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
            placeholder="Enter alternate food item..."
          />
        </div>

        {/* Footer buttons */}
        <div className="mt-8 grid gap-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={() => router.push("/nutrition-macros")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full justify-center bg-[#0A3161] hover:bg-[#0D3D7A]"
            onClick={() => console.log("Add Nutrition Item")}
          >
            Add Nutrition Item
          </Button>
        </div>
      </div>
    </div>
  );
}
