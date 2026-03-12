"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { HiOutlineArrowLeft } from "react-icons/hi";
import { BiComment } from "react-icons/bi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { MOCK_FAQS } from "../../data";

export default function EditFaqPage() {
  const router = useRouter();
  const params = useParams();
  const faqId = parseInt(params.id);

  const [faq, setFaq] = useState(null);
  const [question, setQuestion] = useState("");
  const [category, setCategory] = useState("General");
  const [status, setStatus] = useState("Active");
  const [answer, setAnswer] = useState("");

  const categoryOptions = ["General", "Account", "Subscription", "Workout", "Nutrition", "Recovery"];

  const chipClasses = (active) =>
    `flex-1 rounded-xl border text-sm font-medium py-2.5 px-4 text-center transition-all ${
      active
        ? "border-[#0A3161] bg-[#0A3161]/5 text-[#0A3161] shadow-sm"
        : "border-[#C8D7E9] bg-white text-[#2158A3] hover:bg-[#F2F5FA]"
    }`;

  useEffect(() => {
    const found = MOCK_FAQS.find((f) => f.id === faqId);
    if (!found) {
      toast.error("FAQ not found");
      router.push("/faq");
      return;
    }
    setFaq(found);
    setQuestion(found.question || "");
    setCategory(found.category || "General");
    setStatus(found.status || "Active");
    setAnswer(found.answer || "");
  }, [faqId, router]);

  const handleSave = () => {
    if (!question.trim() || !answer.trim()) {
      toast.error("Please fill in question and answer");
      return;
    }
    toast.success(`FAQ "${question}" updated successfully!`);
    router.push("/faq");
  };

  if (!faq) {
    return (
      <div className="min-h-[80vh] py-8 px-1 flex items-center justify-center">
        <p className="text-[#2158A3]">Loading...</p>
      </div>
    );
  }

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
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6">Edit FAQ</h1>
            <p className="text-sm text-[#2158A3]">Update FAQ details</p>
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
          <label className="text-sm font-medium text-[#0A3161]">
            Answer <span className="text-red-500">*</span>
          </label>
          <div className="mt-2 border border-[#C8D7E9] rounded-lg overflow-hidden [&_.ck-editor__editable]:min-h-[260px] [&_.ck-editor__editable]:p-4 [&_.ck-toolbar]:border-t-0 [&_.ck-toolbar]:border-l-0 [&_.ck-toolbar]:border-r-0 [&_.ck-toolbar]:border-b [&_.ck-toolbar]:border-gray-200">
            <CKEditor
              editor={ClassicEditor}
              data={answer}
              onChange={(event, editor) => setAnswer(editor.getData())}
              config={{
                placeholder: "Write the answer...",
                toolbar: [
                  "heading",
                  "|",
                  "bold",
                  "italic",
                  "link",
                  "bulletedList",
                  "numberedList",
                  "|",
                  "blockQuote",
                  "insertTable",
                  "|",
                  "undo",
                  "redo",
                ],
              }}
            />
          </div>
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
          >
            Update FAQ
          </Button>
        </div>
      </div>
    </div>
  );
}

