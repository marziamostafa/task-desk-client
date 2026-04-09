"use client";

import React, { useEffect, useState } from "react";

interface Task {
  id: string;
  title: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  assignedBy: string;
  assignedTo: string;
  assignedToName?: string; // ← add this
  description: string;
}
export interface AuditLog {
  id: string;
  actorId: string;
  actorName: string;
  action: string;
  entity: string;
  entityId: string;
  before: Task | null;
  after: Task | null;
  createdAt: string;
}

interface Change {
  key: string;
  from: string;
  to: string;
}

function getChanges(
  before: Task | null,
  after: Task | null,
): Change[] | "created" | "no-data" {
  if (!before && !after) return "no-data";
  if (!before) return "created";

  const changes: Change[] = [];
  if (before.title !== after?.title)
    changes.push({ key: "Title", from: before.title, to: after?.title ?? "" });
  if (before.status !== after?.status)
    changes.push({
      key: "Status",
      from: before.status,
      to: after?.status ?? "",
    });
  if (before.assignedTo !== after?.assignedTo)
    changes.push({
      key: "Assigned to",
      from: before.assignedToName ?? before.assignedTo, // ← use name, fall back to ID
      to: after?.assignedToName ?? after?.assignedTo ?? "",
    });
  if (before.description !== after?.description)
    changes.push({ key: "Description", from: "changed", to: "" });

  return changes;
}

function getInitials(name: string) {
  return name.slice(0, 2).toUpperCase();
}

function ActionBadge({ action }: { action: string }) {
  const isCreated = action === "TASK_CREATED";
  const isDeleted = action === "TASK_DELETED";

  const styles = isCreated
    ? "bg-green-100 text-green-800"
    : isDeleted
      ? "bg-red-100 text-red-800"
      : "bg-blue-100 text-blue-800";

  const label = action
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/^\w/, (c) => c.toUpperCase());

  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded ${styles}`}>
      {label}
    </span>
  );
}

export default function AuditLogs() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchAuditLogs() {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/audit-logs`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );
        if (!response.ok)
          throw new Error(`HTTP error! status: ${response.status}`);
        const data: AuditLog[] = await response.json();
        setLogs(data);
      } catch (error) {
        console.error("Error fetching audit logs:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchAuditLogs();
  }, []);

  if (loading)
    return (
      <div className="flex items-center justify-center py-16 text-sm text-gray-400">
        Loading audit logs...
      </div>
    );

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-lg font-medium">Audit logs</h2>
        <span className="text-xs text-gray-500 bg-gray-100 border border-gray-200 rounded-md px-2.5 py-1">
          {logs.length} entries
        </span>
      </div>

      {logs.map((log) => {
        const changes = getChanges(log.before, log.after);

        return (
          <div
            key={log.id}
            className="bg-white border border-gray-100 rounded-xl px-4 py-3.5 grid gap-3 hover:border-gray-200 hover:bg-gray-50 transition-colors"
            style={{ gridTemplateColumns: "auto 1fr auto" }}
          >
            {/* Avatar */}
            <div className="w-9 h-9 rounded-full bg-purple-100 text-purple-800 flex items-center justify-center text-xs font-medium mt-0.5 flex-shrink-0">
              {getInitials(log.actorName)}
            </div>

            {/* Body */}
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap mb-1.5">
                <span className="text-sm font-medium">{log.actorName}</span>
                <ActionBadge action={log.action} />
                <span className="text-xs text-gray-400">{log.entity}</span>
              </div>

              {changes === "created" && log.after && (
                <span className="text-xs bg-green-50 text-green-800 px-2 py-0.5 rounded">
                  {log.after.title}
                </span>
              )}

              {Array.isArray(changes) && changes.length > 0 && (
                <div className="flex flex-col gap-1">
                  {changes.map((c) => (
                    <div
                      key={c.key}
                      className="flex items-center gap-1.5 text-xs"
                    >
                      <span className="text-gray-400 w-14 shrink-0">
                        {c.key}
                      </span>
                      {c.from && (
                        <span className="bg-gray-100 text-gray-500 rounded px-1.5 py-0.5">
                          {c.from}
                        </span>
                      )}
                      {c.to && (
                        <>
                          <span className="text-gray-300">→</span>
                          <span className="bg-green-50 text-green-800 rounded px-1.5 py-0.5">
                            {c.to}
                          </span>
                        </>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {Array.isArray(changes) && changes.length === 0 && (
                <span className="text-xs text-gray-400">
                  No meaningful changes
                </span>
              )}

              <p className="text-xs text-gray-300 font-mono mt-1.5 truncate">
                {log.entityId}
              </p>
            </div>

            {/* Timestamp */}
            <div className="text-xs text-gray-400 text-right leading-relaxed whitespace-nowrap">
              {new Date(log.createdAt).toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
              })}
              <br />
              {new Date(log.createdAt).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
