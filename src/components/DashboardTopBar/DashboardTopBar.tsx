"use client";

export default function DashboardTopBar() {
  const handleLogout = () => {
    localStorage.clear();
    window.location.href = "/";
  };

  return (
    <div className="flex items-center justify-between bg-white shadow px-4 h-16 sticky top-0 z-10">
      <h1 className="font-semibold text-lg">Dashboard</h1>
      <button
        onClick={handleLogout}
        className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded"
      >
        Logout
      </button>
    </div>
  );
}
