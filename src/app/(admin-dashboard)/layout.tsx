import DashboardTopBar from "@/components/DashboardTopBar/DashboardTopBar";
import PrivateRoute from "@/components/PrivateRoute/PrivateRoute";
import SideNavbar from "@/components/SideNavbar/SideNavbar";
import React from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex flex-col">
      {/* Topbar */}
      <DashboardTopBar />

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
