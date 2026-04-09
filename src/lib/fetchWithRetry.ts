// src/lib/fetchWithRetry.ts

export async function fetchWithRetry(
  url: string,
  options: RequestInit = {},
  retries = 3,
  delay = 2000,
): Promise<Response> {
  for (let i = 0; i < retries; i++) {
    try {
      const res = await fetch(url, options);
      if (res.status === 502 && i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
        continue;
      }
      return res;
    } catch (err) {
      if (i < retries - 1) {
        await new Promise((r) => setTimeout(r, delay));
      } else {
        throw err;
      }
    }
  }
  throw new Error("Max retries reached");
}
