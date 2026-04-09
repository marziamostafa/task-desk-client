"use client";

import React, { useEffect, useState } from "react";
import AddTasks from "./AddTasks";
import EditTaskModal from "./EditTaskModal";

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
  assignedTo: string | null; // user ID
  assignedBy: string | null; // user ID
  createdAt: string;
  updatedAt: string;
  assignedToUser?: User;
  assignedByUser?: User;
}

export default function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<User[]>([]);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  useEffect(() => {
    fetchTasks();
    fetchUsers();
  }, []);

  const fetchTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();

      const mappedTasks: Task[] = data.map((t: Task) => ({
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

      setTasks(mappedTasks);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      setUsers(data);
    } catch (error) {
      console.error(error);
    }
  };

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

  if (loading) return <p className="p-4">Loading...</p>;

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
