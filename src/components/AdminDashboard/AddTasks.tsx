"use client";

import React, { useEffect, useState } from "react";
import { Task } from "./AdminDashboard";
import { fetchWithRetry } from "@/lib/fetchWithRetry";

interface User {
  id: string;
  username: string;
  email: string;
}
interface AddTasksProps {
  onTaskCreated: (newTask: Task) => void;
}

export default function AddTasks({ onTaskCreated }: AddTasksProps) {
  const [users, setUsers] = useState<User[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignedTo, setAssignedTo] = useState("");

  useEffect(() => {
    const controller = new AbortController(); // ← abort controller

    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await fetchWithRetry(
          // ← fetchWithRetry
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/users`,
          {
            headers: { Authorization: `Bearer ${token}` },
            signal: controller.signal, // ← pass signal
          },
        );
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        setUsers(data);
      } catch (error: any) {
        if (error.name === "AbortError") return; // ← ignore Strict Mode cancellations
        console.error("Failed to fetch users:", error);
      } finally {
        setLoadingUsers(false);
      }
    };

    fetchUsers();
    return () => controller.abort(); // ← cleanup on unmount
  }, []);

  const handleCreateTask = async () => {
    try {
      const token = localStorage.getItem("token");
      const res = await fetchWithRetry(
        // ← swap fetch → fetchWithRetry
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            status: "PENDING",
            assignedTo,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to create task");

      const newTask = await res.json();
      onTaskCreated(newTask);

      const modal = document.getElementById(
        "add_task_modal",
      ) as HTMLDialogElement;
      modal.close();
      setTitle("");
      setDescription("");
      setAssignedTo("");
    } catch (error) {
      console.error(error);
      alert(
        "Failed to create task. Server may be starting up, please try again.",
      );
    }
  };

  return (
    <div className="w-full flex items-center justify-between my-2">
      <span className="text-4xl">Task Management</span>
      <button
        className="text-2xl px-2 py-1 bg-blue-500 text-white rounded"
        onClick={() =>
          (
            document.getElementById("add_task_modal") as HTMLDialogElement
          ).showModal()
        }
      >
        Add Task
      </button>

      <dialog id="add_task_modal" className="modal">
        <div className="modal-box">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleCreateTask();
            }}
          >
            <button className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2">
              ✕
            </button>
            <h3 className="font-bold text-lg">Create New Task</h3>

            <div className="py-2 flex flex-col gap-2">
              <input
                type="text"
                placeholder="Title"
                className="input input-bordered w-full"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
              <textarea
                placeholder="Description"
                className="textarea textarea-bordered w-full"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />

              {loadingUsers ? (
                <p>Loading users...</p>
              ) : (
                <select
                  className="select select-bordered w-full"
                  value={assignedTo}
                  onChange={(e) => setAssignedTo(e.target.value)}
                  required
                >
                  <option value="">Select assignee</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.username} ({user.email})
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div className="modal-action">
              <button type="submit" className="btn btn-primary">
                Create Task
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
}
