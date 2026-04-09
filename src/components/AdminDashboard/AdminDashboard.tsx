"use client";

import React, { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  description: string;
  status: string;
  assignedToUser: {
    username: string;
    email: string;
  };
  assignedByUser: {
    username: string;
    email: string;
  };
}
export default function AdminDashboard() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        const token = localStorage.getItem("token");

        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/tasks`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );

        const data = await res.json();
        setTasks(data);
      } catch (error) {
        console.error("Failed to fetch tasks:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, []);

  if (loading) return <p className="p-4">Loading...</p>;

  return (
    <div>
      <div className="w-full flex items-center justify-between my-2">
        <span className="text-4xl">Task Management</span>
        <button className="text-2xl px-2 py-1 bg-blue-500 text-white rounded">
          Add Task
        </button>
      </div>
      <div>
        <div className="overflow-x-auto rounded-box border border-base-content/5 bg-base-100">
          <table className="table w-full">
            {/* head */}
            <thead className="bg-gray-400  ">
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
                  <td>{task.assignedToUser.username}</td>
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
                    <button className="text-blue-500 bg-white border px-2 py-1 rounded mr-2">
                      Edit
                    </button>
                    <button className="text-red-500 bg-white border px-2 py-1 rounded">
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
