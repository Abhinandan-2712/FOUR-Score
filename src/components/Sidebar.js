"use client";

import {  FaRegFileAlt,FaRegHeart, FaSignOutAlt } from "react-icons/fa";
import { MdDashboard } from "react-icons/md";
import { TbActivityHeartbeat } from "react-icons/tb";
import { LiaDumbbellSolid } from "react-icons/lia";
import { LuUsers, LuApple } from "react-icons/lu";      
import { BiBell, BiComment } from "react-icons/bi";
import { HiOutlineCog } from "react-icons/hi";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
    { href: "/dashboard", label: "Dashboard", icon: MdDashboard },
    { href: "/users", label: "User", icon: LuUsers },
    {
      href: "/exercise-library",
      label: "Exercise Library",
      icon: LiaDumbbellSolid,
    },
    { 
      href: "/nutrition-macros", 
      label: "Nutrition & Macros", 
      icon: LuApple 
    },
    {
      href: "/recovery-content",
      label: "Recovery Content",
      icon: FaRegHeart,
    },
    {
      href: "/notification",
      label: "Notifications",
      icon: BiBell,
    },
    // {
    //   href: "/faq",
    //   label: "FAQ",
    //   icon: BiComment,
    // },
    // { 
    //   href: "/unity-community", 
    //   label: "Unity (Community)", 
    //   icon: BiComment 
    // },
    { 
      href: "/active-users-today", 
      label: "Active Users Today", 
      icon: TbActivityHeartbeat 
    },
    { 
      href: "/content-management", 
      label: "Content Management", 
      icon: FaRegFileAlt 
    },
    {
      href: "/settings",
      label: "Settings",
      icon: HiOutlineCog,
    },
  ];

  return (
    <div className="min-h-screen h-full w-64 bg-[#0A3161] text-white flex flex-col shadow-lg">
      {/* Logo */}
      <div className=" flex p-4 text-center border-b border-[#0D3D7A]">
        <Image
          src="/logo.jpg" // ✅ absolute path from the public folder
          alt="Medi Admin Logo"
          width={100}
          height={40}
          className="h-18 p-1 mx-auto rounded-3xl"
        />{" "}
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-xl font-bold">FOUR Score</h1>
          <p className="text-sm text-gray-400">Admin Panel</p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-2">
        {links.map(({ href, label, icon: Icon }) => {
          const active = pathname === href; // ✅ check active route
          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 p-3 rounded-4xl transition 
                ${active
                  ? "bg-[#0D3D7A] text-white font-semibold "
                  : "hover:bg-[#0D3D7A]"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-[#0D3D7A]">
        <button className="flex items-center gap-3 p-3 w-full rounded-full hover:bg-[#0D3D7A] transition">
          <FaSignOutAlt className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
