"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {Button} from "@/components/ui/button";
import { FiMenu, FiX } from "react-icons/fi"; 
import Sidebar from "@/components/Sidebar";

export default function Navbar() {
  const router = useRouter();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false); 

  const handleLogout = () => {
    // console.log("User logged out");
    localStorage.removeItem("token");
    setIsModalOpen(false);
    // window.location.href = "/login";
    router.replace("/login");
  };

  return (
    <>
      <header className="w-full bg-white border-b border-gray-200 shadow px-4 py-3 sticky top-0 z-30">
        <nav className="flex justify-between items-center gap-4">
          {/* === Mobile menu toggle button (visible only on <sm) === */}
          <button
            onClick={() => setIsSidebarOpen(true)}
            className="sm:hidden text-2xl text-gray-700"
            aria-label="Open Sidebar"
          >
            <FiMenu />
          </button>

          {/* Title */}
          <div className="text-xl sm:text-2xl font-bold text-gray-800">
            Welcome Admin 👋
          </div>

          {/* Logout button */}
          <div className="flex items-center">
            <Button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 text-sm sm:text-base"
            >
              Logout
            </Button>
          </div>
        </nav>
      </header>

      {/* === Slide-in Sidebar (mobile only) === */}
      {isSidebarOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/40 z-40 sm:hidden"
            onClick={() => setIsSidebarOpen(false)}
          ></div>

          {/* Sidebar content */}
          <aside className="fixed top-0 left-0 h-full w-64 shadow-lg z-50 transition-transform duration-300 sm:hidden ">
            <div className=" relative">
              <div className="flex justify-between items-center absolute z-50 ">
                {/* <h2 className="text-lg font-semibold">Menu</h2> */}
                <button
                  onClick={() => setIsSidebarOpen(false)}
                  className="text-2xl text-gray-700"
                  aria-label="Close Sidebar"
                >
                  <FiX />
                </button>
              </div>
              {/* 👉 Your sidebar links/components go here */}
              <div className=" absolute">
                <Sidebar />
              </div>
            </div>
          </aside>
        </>
      )}

      {/* ✅ Logout Confirmation Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-sm text-center shadow-xl">
            <h2 className="text-lg font-semibold mb-4">
              Are you sure you want to logout?
            </h2>
            <div className="flex justify-center gap-4 flex-wrap">
              <Button onClick={handleLogout}>Yes, Logout</Button>
              <Button variant="outline" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
