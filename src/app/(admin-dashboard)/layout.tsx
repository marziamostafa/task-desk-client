import AdminSideNavbar from "@/components/SideNavbar/SideNavbar";

export default function AdminLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="h-full flex">
      <div className="sticky top-0 h-screen">
        <AdminSideNavbar />
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
