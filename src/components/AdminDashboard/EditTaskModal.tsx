import React, { useState, useEffect } from "react";
import { Task, User } from "./AdminDashboard";

interface EditTaskModalProps {
  task: Task; // Task to edit
  users: User[]; // For reassigning
  onClose: () => void;
  onTaskUpdated: (updatedTask: Task) => void;
}

export default function EditTaskModal({
  task,
  users,
  onClose,
  onTaskUpdated,
}: EditTaskModalProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description);
  const [status, setStatus] = useState(task.status);
  const [assignedTo, setAssignedTo] = useState(task.assignedToUser?.id || "");

  const handleUpdateTask = async () => {
    try {
      const token = localStorage.getItem("token");

      console.log(task.id);

      const res = await fetch(
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks/${task.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title,
            description,
            status,
            assignedTo: assignedTo || undefined,
          }),
        },
      );

      if (!res.ok) throw new Error("Failed to update task");

      const updatedTask = await res.json();
      onTaskUpdated(updatedTask);
      onClose();
    } catch (error) {
      console.error(error);
      alert("Failed to update task");
    }
  };

  const handleStatusChange = (value: string) => {
    if (value === "PENDING" || value === "PROCESSING" || value === "DONE") {
      setStatus(value);
    }
  };

  <select
    className="select select-bordered w-full"
    value={status}
    onChange={(e) => handleStatusChange(e.target.value)}
  >
    <option value="PENDING">PENDING</option>
    <option value="PROCESSING">PROCESSING</option>
    <option value="COMPLETED">DONE</option>
  </select>;

  return (
    <dialog open className="modal">
      <div className="modal-box">
        <button
          className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
          onClick={onClose}
        >
          ✕
        </button>
        <h3 className="font-bold text-lg">Edit Task</h3>

        <div className="py-2 flex flex-col gap-2">
          <input
            type="text"
            placeholder="Title"
            className="input input-bordered w-full"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          <textarea
            placeholder="Description"
            className="textarea textarea-bordered w-full"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <select
            className="select select-bordered w-full"
            value={status}
            onChange={(e) =>
              setStatus(e.target.value as "PENDING" | "PROCESSING" | "DONE")
            }
          >
            <option value="PENDING">PENDING</option>
            <option value="PROCESSING">PROCESSING</option>
            <option value="DONE">DONE</option>
          </select>

          <select
            className="select select-bordered w-full"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
          >
            <option value="">Select assignee</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.username} ({user.email})
              </option>
            ))}
          </select>
        </div>

        <div className="modal-action">
          <button className="btn btn-primary" onClick={handleUpdateTask}>
            Update Task
          </button>
        </div>
      </div>
    </dialog>
  );
}
