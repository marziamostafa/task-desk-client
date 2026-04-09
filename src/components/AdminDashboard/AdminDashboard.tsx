/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import React, { useCallback, useEffect, useState } from "react";
import AddTasks from "./AddTasks";
import EditTaskModal from "./EditTaskModal";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

export interface User {
  id: string;
  username: string;
  email: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  status: "PENDING" | "PROCESSING" | "DONE";
  assignedTo: string | null;
  assignedBy: string | null;
  createdAt: string;
  updatedAt: string;
  assignedToUser?: User;
  assignedByUser?: User;
}

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const fetchTasks = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem("token");
      const res = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal,
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();

      const mappedTasks: Task[] = data.map((t: Task) => ({
        // ← this line was missing
        id: t.id,
        title: t.title,
        description: t.description,
        status: t.status,
        assignedTo: t.assignedTo || null,
        assignedBy: t.assignedBy || null,
        createdAt: t.createdAt,
        updatedAt: t.updatedAt,
        assignedToUser: t.assignedToUser,
        assignedByUser: t.assignedByUser,
      }));

      setTasks(mappedTasks); // ← now mappedTasks is in scope
    } catch (err: any) {
      if (err.name === "AbortError") return;
      console.error("Failed to fetch tasks", err);
      setError("Could not load tasks. Server may still be starting up.");
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchUsers = useCallback(async (signal?: AbortSignal) => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetchWithRetry(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/users`,
        {
          headers: { Authorization: `Bearer ${token}` },
          signal, // ← pass signal so the request can be cancelled
        },
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setUsers(data);
    } catch (err: any) {
      if (err.name === "AbortError") return; // ← silently ignore cancelled requests
      console.error("Failed to fetch users", err);
    }
  }, []);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, [fetchTasks, fetchUsers]); // ← depend on stable useCallback refs

  useEffect(() => {
    const controller = new AbortController();
    fetchTasks(controller.signal);
    fetchUsers(controller.signal);
    return () => controller.abort(); // ← cancels the first request when Strict Mode unmounts
  }, [fetchTasks, fetchUsers]);

  const handleDeleteTask = async (taskId: string) => {
    if (!confirm("Are you sure?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks/${taskId}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        },
      );
      if (!res.ok) throw new Error();
      setTasks((prev) => prev.filter((t) => t.id !== taskId));
    } catch {
      alert("Failed to delete task");
    }
  };

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        Loading...
      </div>
    );

  if (error)
    return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <p className="text-sm text-red-400">{error}</p>
        <button
          onClick={() => {
            fetchTasks();
            fetchUsers();
          }}
          className="text-sm bg-gray-100 hover:bg-gray-200 text-gray-600 px-4 py-2 rounded-lg transition-colors"
        >
          Retry
        </button>
      </div>
    );

  return (
    <div>
      <AddTasks
        onTaskCreated={(newTask: Task) => setTasks([...tasks, newTask])}
      />

      <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
        <table className="table w-full">
          <thead className="bg-gray-400">
            <tr>
              <th></th>
              <th>Title</th>
              <th>Assignee</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody className="w-full">
            {tasks.map((task, i) => (
              <tr key={task.id}>
                <th>{i + 1}</th>
                <td>{task.title}</td>
                <td>{task.assignedToUser?.username || "N/A"}</td>
                <td>
                  <span
                    className={`px-2 py-1 rounded text-white text-xs ${
                      task.status === "PENDING"
                        ? "bg-yellow-500"
                        : task.status === "PROCESSING"
                          ? "bg-blue-500"
                          : "bg-green-500"
                    }`}
                  >
                    {task.status}
                  </span>
                </td>
                <td>
                  <button
                    className="text-blue-500 bg-white border px-2 py-1 rounded mr-2"
                    onClick={() => setEditingTask(task)}
                  >
                    Edit
                  </button>
                  <button
                    className="text-red-500 bg-white border px-2 py-1 rounded"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editingTask && (
        <EditTaskModal
          task={editingTask}
          users={users}
          onClose={() => setEditingTask(null)}
          onTaskUpdated={() => fetchTasks()}
        />
      )}
    </div>
  );
}
