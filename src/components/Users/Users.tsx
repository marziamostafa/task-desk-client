"use client";

import React, { useEffect, useState } from "react";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface User {
  id: string;
  email: string;
  username: string;
  role: "ADMIN" | "USER";
  createdAt: string;
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

export default function Users() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const controller = new AbortController();

    async function fetchUsers() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetchWithRetry(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/users`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
            signal: controller.signal,
          },
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: User[] = await response.json();
        setUsers(data);
      } catch (error: any) {
        if (error.name === "AbortError") return;
        console.error("Error fetching users:", error);
        setError("Could not load users. Server may still be starting up.");
      } finally {
        setLoading(false);
      }
    }

    fetchUsers();
    return () => controller.abort();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        Loading users...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => window.location.reload()}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );

  return (
    // ... your JSX stays completely unchanged
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium">Users</h2>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1">
          {users.length} total
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              <th className="text-left font-medium px-4 py-3">User</th>
              <th className="text-left font-medium px-4 py-3">Email</th>
              <th className="text-left font-medium px-4 py-3">Role</th>
              <th className="text-left font-medium px-4 py-3">Joined</th>
              <th className="text-left font-medium px-4 py-3">ID</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {users.map((user) => (
              <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-medium flex-shrink-0">
                      {getInitials(user.username)}
                    </div>
                    <span className="font-medium text-gray-800">
                      {user.username}
                    </span>
                  </div>
                </td>
                <td className="px-4 py-3 text-gray-500">{user.email}</td>
                <td className="px-4 py-3">
                  <span
                    className={`text-xs font-medium px-2 py-0.5 rounded ${
                      user.role === "ADMIN"
                        ? "bg-purple-100 text-purple-800"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {user.role.toLowerCase()}
                  </span>
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(user.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs text-gray-300 font-mono">
                    {user.id}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
