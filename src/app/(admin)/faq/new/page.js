"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { BiComment } from "react-icons/bi";
import { createFaq } from "@/lib/faqApi";

export default function NewFaqPage() {
  const router = useRouter();
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState("Active");
  const [answer, setAnswer] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const categoryOptions = ["General", "Account", "Subscription", "Workout", "Nutrition", "Recovery"];

  const chipClasses = (active) =>
    `flex-1 rounded-xl border text-sm font-medium py-2.5 px-4 text-center transition-all ${
      active
        ? "border-[#0A3161] bg-[#0A3161]/5 text-[#0A3161] shadow-sm"
        : "border-[#C8D7E9] bg-white text-[#2158A3] hover:bg-[#F2F5FA]"
    }`;

  const handleSave = async () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in question and answer");
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
      await createFaq(
        { question: question.trim(), category, status, answer },
        { token, baseUrl }
      );
      toast.success(`FAQ "${question}" created successfully!`);
      router.push("/faq");
    } catch (err) {
      console.error("Create FAQ failed:", err?.adminPayload || err?.message);
      toast.error(err?.adminPayload?.message || err?.message || "Failed to create FAQ");
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-[80vh] py-8 px-1">
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
            <BiComment className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6">Add New FAQ</h1>
            <p className="text-sm text-[#2158A3]">Create a new frequently asked question</p>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#C8D7E9] shadow-md p-6 md:p-7 mt-6 space-y-6">
        <div>
          <label className="text-sm font-medium text-[#0A3161]">
            Question <span className="text-red-500">*</span>
          </label>
          <Input
            className="mt-1.5 h-12 w-full rounded-lg border border-[#C8D7E9] bg-white px-4 text-sm shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30"
            placeholder="Enter question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
          />
        </div>

        <div>
          <label className="text-sm font-medium text-[#0A3161]">Category</label>
          <div className="mt-2 grid gap-3 grid-cols-3">
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
        </div>

        <div>
          <label htmlFor="faq-answer" className="text-sm font-medium text-[#0A3161]">
            Answer <span className="text-red-500">*</span>
          </label>
          <Textarea
            id="faq-answer"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            placeholder="Write the answer. You can use HTML (e.g. &lt;p&gt;, &lt;strong&gt;, &lt;ul&gt;) for formatting and tables."
            className="mt-2 min-h-[280px] w-full rounded-lg border-[#C8D7E9] bg-white px-4 py-3 text-sm text-[#0A3161] shadow-none focus-visible:ring-2 focus-visible:ring-[#0A3161]/30 resize-y"
          />
          <p className="mt-2 text-xs text-[#5671A6]">
            HTML is supported in the app preview. For tables, paste HTML or use &lt;table&gt; tags.
          </p>
        </div>

        <div className="mt-2 grid gap-4 md:grid-cols-2">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-center"
            onClick={() => router.push("/faq")}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="w-full justify-center bg-[#0A3161] hover:bg-[#0D3D7A]"
            onClick={handleSave}
            disabled={isSaving}
          >
            {isSaving ? "Saving…" : "Create FAQ"}
          </Button>
        </div>
      </div>
    </div>
  );
}

