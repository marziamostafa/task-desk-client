/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { DashboardItems, UserDashboardItems } from "@/utils/DashboardItem";

export default function SideNavbar() {
  const [email, setEmail] = useState<string | null>(null);
  const [role, setRole] = useState<"admin" | "user" | null>(null);
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  useEffect(() => {
    const storedEmail = localStorage.getItem("user");
    setEmail(storedEmail);

    if (storedEmail === "marzia@gmail.com") {
      setRole("admin");
    } else if (storedEmail === "user@gmail.com") {
      setRole("user");
    } else {
      setRole(null); // guest or unknown
    }
  }, []);

  const itemsToRender =
    role === "admin"
      ? DashboardItems
      : role === "user"
        ? UserDashboardItems
        : [];

  return (
    <div className="min-h-screen bg-[#6B9CCE] w-[240px] rounded-r-lg p-2">
      <div className="flex items-center justify-center mb-4">
        <span className="text-white font-bold text-lg">Dashboard</span>
      </div>

      {itemsToRender.map((item, index) => (
        <div key={index} className="mb-1">
          {/* Main menu item */}
          <Link href={item.menu_url}>
            <div className="flex justify-between items-center cursor-pointer text-white hover:bg-[#5A8CC4] p-2 rounded">
              <span>{item.menu_title}</span>
            </div>
          </Link>
        </div>
      ))}
    </div>
  );
}
