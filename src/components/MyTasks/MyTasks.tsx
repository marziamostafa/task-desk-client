"use client";

import React, { useEffect, useState } from "react";

interface User {
  id: string;
  username: string;
  email: string;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "DONE";
  createdAt: string;
  updatedAt: string;
  assignedToUser: User | null;
  assignedByUser: User | null;
}

const STATUS_STYLES = {
  PENDING: "bg-amber-100 text-amber-800",
  PROCESSING: "bg-blue-100 text-blue-800",
  DONE: "bg-green-100 text-green-800",
};

export default function MyTasks() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingTaskId, setUpdatingTaskId] = useState<string | null>(null);

  const fetchTasks = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        },
      );
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data: Task[] = await response.json();
      setTasks(data);
    } catch (error) {
      console.error("Error fetching tasks:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTasks();
  }, []);

  const handleStatusChange = async (
    taskId: string,
    newStatus: Task["status"],
  ) => {
    try {
      setUpdatingTaskId(taskId);
      const token = localStorage.getItem("token");
      const taskToUpdate = tasks.find((t) => t.id === taskId);
      if (!taskToUpdate) return;

      const response = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks/${taskId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            title: taskToUpdate.title,
            description: taskToUpdate.description,
            status: newStatus,
          }),
        },
      );

      if (!response.ok)
        throw new Error(`Failed to update task: ${response.status}`);
      await fetchTasks(); // Refetch tasks after update
    } catch (error) {
      console.error("Error updating task:", error);
    } finally {
      setUpdatingTaskId(null);
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        Loading tasks...
      </div>
    );

  if (tasks.length === 0)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        No tasks assigned to you.
      </div>
    );

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium">My tasks</h2>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1">
          {tasks.length} total
        </span>
      </div>

      <div className="overflow-x-auto rounded-xl border border-gray-100">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50 text-xs text-gray-500">
              <th className="text-left font-medium px-4 py-3">Title</th>
              <th className="text-left font-medium px-4 py-3">Description</th>
              <th className="text-left font-medium px-4 py-3">Status</th>
              <th className="text-left font-medium px-4 py-3">Assigned by</th>
              <th className="text-left font-medium px-4 py-3">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50 bg-white">
            {tasks.map((task) => (
              <tr key={task.id} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-800 whitespace-nowrap">
                  {task.title}
                </td>
                <td className="px-4 py-3 text-gray-400 max-w-xs truncate">
                  {task.description || "—"}
                </td>
                <td className="px-4 py-3">
                  <select
                    disabled={updatingTaskId === task.id}
                    value={task.status}
                    onChange={(e) =>
                      handleStatusChange(
                        task.id,
                        e.target.value as Task["status"],
                      )
                    }
                    className={`text-xs font-medium px-2 py-0.5 rounded ${STATUS_STYLES[task.status]}`}
                  >
                    <option value="PENDING">pending</option>
                    <option value="PROCESSING">processing</option>
                    <option value="DONE">done</option>
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500">
                  {task.assignedByUser?.username ?? "—"}
                </td>
                <td className="px-4 py-3 text-gray-400 text-xs whitespace-nowrap">
                  {new Date(task.createdAt).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                  })}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
