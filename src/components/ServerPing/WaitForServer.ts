"use client";

import { useEffect, useState } from "react";

let serverReadyResolve: () => void;
const serverReadyPromise = new Promise<void>((res) => {
  serverReadyResolve = res;
});

export function waitForServer() {
  return serverReadyPromise;
}

export default function ServerPing() {
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 15;

    const ping = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/health`,
        );
        if (res.ok) {
          console.log(`Server ready after ${attempts} pings`);
          serverReadyResolve();
          clearInterval(interval);
        }
      } catch {
        attempts++;
        if (attempts >= maxAttempts) clearInterval(interval);
      }
    };

    ping();
    const interval = setInterval(ping, 3000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
