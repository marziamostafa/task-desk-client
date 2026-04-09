"use client";

import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import SideNavbar from "@/components/SideNavbar/SideNavbar";
import React, { useEffect } from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const handleLogout = () => {
    localStorage.clear(); // Clear all localStorage items
    window.location.href = "/"; // Redirect to login page
  };

  useEffect(() => {
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/health`).catch(() => {});
  }, []);

  return (
    <div className="h-full flex flex-col">
      {/* Topbar */}
      <div className="flex items-center justify-between bg-white shadow px-4 h-16 sticky top-0 z-10">
        <h1 className="font-semibold text-lg">Dashboard</h1>
        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
        >
          Logout
        </button>
      </div>

      <div className="flex flex-1">
        {/* Sidebar */}
        <div className="sticky top-16 h-[calc(100vh-4rem)]">
          <SideNavbar />
        </div>

        {/* Main content */}
        <PrivateRoute>
          <div className="flex flex-col flex-1 bg-[#F5F7FA] h-screen max-h-full mt-0 p-4">
            {children}
          </div>
        </PrivateRoute>
      </div>
    </div>
  );
}
