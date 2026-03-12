"use client";

import { useEffect, useMemo, useState } from "react";
import dynamic from "next/dynamic";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { FaSave } from "react-icons/fa";
import { MOCK_CONTENT_ITEMS } from "./data";

const CKEditor = dynamic(
  () => import("@ckeditor/ckeditor5-react").then((mod) => mod.CKEditor),
  { ssr: false }
);

const ClassicEditor = dynamic(
  () => import("@ckeditor/ckeditor5-build-classic"),
  { ssr: false }
);


const TABS = [
  { id: "privacy", label: "Privacy Policy" },
  { id: "about", label: "About App" },
  { id: "social", label: "Social Media" },
  { id: "quotes", label: "Quotes" },
];

function getTabMeta(tabId) {
  switch (tabId) {
    case "privacy":
      return { contentType: "Privacy Policy", title: "Privacy Policy" };
    case "about":
      // existing mock uses "About Us"
      return { contentType: "About Us", title: "About App" };
    case "social":
      return { contentType: "Custom", title: "Social Media" };
    case "quotes":
      return { contentType: "Custom", title: "Quotes" };
    default:
      return { contentType: "Custom", title: "Content" };
  }
}

export default function ContentManagement() {
  const [contentItems, setContentItems] = useState(MOCK_CONTENT_ITEMS);
  const [activeTab, setActiveTab] = useState("privacy");
  const [editorTitle, setEditorTitle] = useState("Privacy Policy Editor");
  const [editorData, setEditorData] = useState("");

  const currentTabMeta = useMemo(() => getTabMeta(activeTab), [activeTab]);

  useEffect(() => {
    const { contentType, title } = currentTabMeta;
    setEditorTitle(`${title} Editor`);

    const found = contentItems.find((c) => {
      if (contentType === "Custom") return c.contentType === "Custom" && c.title === title;
      return c.contentType === contentType;
    });

    setEditorData(found?.body || "");
  }, [activeTab, contentItems, currentTabMeta]);

  const handleSave = () => {
    const { contentType, title } = currentTabMeta;
    const today = new Date().toISOString().slice(0, 10);

    setContentItems((prev) => {
      const idx = prev.findIndex((c) => {
        if (contentType === "Custom") return c.contentType === "Custom" && c.title === title;
        return c.contentType === contentType;
      });

      if (idx === -1) {
        const nextId = Math.max(0, ...prev.map((c) => c.id || 0)) + 1;
        return [
          ...prev,
          {
            id: nextId,
            title,
            contentType,
            status: "Published",
            excerpt: "",
            body: editorData,
            lastUpdated: today,
            createdAt: today,
          },
        ];
      }

      const copy = [...prev];
      copy[idx] = { ...copy[idx], body: editorData, lastUpdated: today };
      return copy;
    });

    toast.success(`${currentTabMeta.title} saved successfully!`);
  };

  return (
    <div className="min-h-[80vh] py-8 px-1">
      <div className="">

        <div className="flex items-center justify-between">
          <div className="mb-6">
            <h1 className="text-xl font-semibold text-[#0A3161] leading-6 tracking-normal">
              Content Management
            </h1>
            <p className="text-sm text-[#2158A3] mt-1">Manage app content and settings</p>
          </div>

        </div>

        {/* Tabs */}
        <div className="inline-flex rounded-lg border border-[#C8D7E9] bg-white p-1 shadow-sm">
          {TABS.map((tab) => {
            const active = tab.id === activeTab;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${active
                    ? "bg-[#0A3161] text-white shadow-sm"
                    : "text-[#2158A3] hover:bg-[#F2F5FA]"
                  }`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Editor */}
        <div className="mt-6 bg-white rounded-lg border border-[#C8D7E9] shadow-md p-6 md:p-4">
          <h2 className="text-sm font-semibold text-[#0A3161] mb-3">{editorTitle}</h2>

          <div className="border border-[#C8D7E9] rounded-lg overflow-hidden [&_.ck-editor__editable]:min-h-[360px] [&_.ck-editor__editable]:p-4 [&_.ck-toolbar]:border-t-0 [&_.ck-toolbar]:border-l-0 [&_.ck-toolbar]:border-r-0 [&_.ck-toolbar]:border-b [&_.ck-toolbar]:border-gray-200">
            <CKEditor
              key={activeTab}
              editor={ClassicEditor}
              data={editorData}
              onChange={(event, editor) => setEditorData(editor.getData())}
              config={{
                placeholder: `Enter ${currentTabMeta.title.toLowerCase()}...`,
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

          <div className="mt-6">
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#0A3161] hover:bg-[#0D3D7A] text-white font-medium px-6 gap-2"
            >
              <FaSave className="h-4 w-4" />
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
