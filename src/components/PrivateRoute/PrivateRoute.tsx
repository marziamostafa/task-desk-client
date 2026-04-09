/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import React from "react";

export default function PrivateRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.replace("/"); // redirect to home if not logged in
    } else {
      setIsAuthenticated(true); // allow rendering
    }
  }, [router]);

  // While checking auth, don't render children
  if (isAuthenticated === null) return null;

  return <>{children}</>;
}
