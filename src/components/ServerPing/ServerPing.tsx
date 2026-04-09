"use client";

import { useEffect } from "react";

export default function ServerPing() {
  useEffect(() => {
    const start = Date.now();
    fetch(`${process.env.NEXT_PUBLIC_BASE_URL_API}/health`)
      .then(() => console.log(`Server ready in ${Date.now() - start}ms`))
      .catch(() => console.warn("Server health check failed"));
  }, []);

  return null;
}
