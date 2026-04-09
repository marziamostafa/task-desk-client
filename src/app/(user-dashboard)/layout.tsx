import SideNavbar from "@/components/SideNavbar/SideNavbar";
import React from "react";

export default function UserLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex">
      <div className="sticky top-0 h-screen">
        <SideNavbar />
      </div>
      <div className="flex flex-col flex-1">
        {/* <AdminTopSection /> */}
        <div className="bg-[#F5F7FA]  h-screen max-h-full mt-4 flex flex-row flex-1 p-4">
          <div className="w-full">{children}</div>
        </div>
      </div>
    </div>
  );
}
