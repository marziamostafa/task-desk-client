"use client";

import { useEffect } from "react";

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
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/health?t=${Date.now()}`, // ← cache bust
          { cache: "no-store" }, // ← no cache
        );
        if (res.ok || res.status === 304) {
          // 304 means CDN cached — don't trust it, keep pinging
          // Only resolve when we get a fresh 200
          if (res.status === 200) {
            console.log(`Server confirmed ready after ${attempts} pings`);
            serverReadyResolve();
            clearInterval(interval);
          }
        }
      } catch {
        attempts++;
        console.log(`Server sleeping, attempt ${attempts}/${maxAttempts}`);
        if (attempts >= maxAttempts) clearInterval(interval);
      }
    };

    ping();
    const interval = setInterval(ping, 3000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
