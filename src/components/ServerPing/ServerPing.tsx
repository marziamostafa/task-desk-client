"use client";

import { useEffect } from "react";

export default function ServerPing() {
  useEffect(() => {
    let attempts = 0;
    const maxAttempts = 10;

    const ping = async () => {
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL_API}/health`,
        );
        if (res.ok) {
          console.log(`Server ready after ${attempts} attempts`);
          clearInterval(interval);
        }
      } catch {
        attempts++;
        console.log(`Server not ready yet, attempt ${attempts}/${maxAttempts}`);
        if (attempts >= maxAttempts) {
          console.warn("Server did not respond after max attempts");
          clearInterval(interval);
        }
      }
    };

    // Ping immediately, then every 3 seconds until ready
    ping();
    const interval = setInterval(ping, 3000);
    return () => clearInterval(interval);
  }, []);

  return null;
}
