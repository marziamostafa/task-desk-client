"use client";

import Loader from "@/app/loading";
import { UserLoginResponse } from "@/app/types/user";

import { fetchWithRetry } from "@/lib/fetchWithRetry"; // ← 2. import
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";
import { waitForServer } from "../ServerPing/WaitForServer";

interface Inputs {
  email: string;
  password: string;
}

export default function Login() {
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
  } = useForm<Inputs>();

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [serverReady, setServerReady] = useState(false); // ← 3. add state

  // ← 4. wait for server on mount
  useEffect(() => {
    waitForServer().then(() => setServerReady(true));
  }, []);

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setIsLoading(true);
    setError(null);
    try {
      // ← 5. wait for server before firing request
      await waitForServer();

      const response = await fetchWithRetry(
        // ← 6. fetchWithRetry instead of fetch
        `${process.env.NEXT_PUBLIC_BASE_URL_API}/users/login`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        throw new Error("Invalid credentials or server error");
      }

      const data: UserLoginResponse = await response.json();
      const token = data.accessToken;
      localStorage.setItem("token", token);

      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("user", payload.email);
      localStorage.setItem("role", payload.role);
      localStorage.setItem("id", payload._id ?? "");
      localStorage.setItem("name", payload.username ?? "");

      alert("Login successful");

      const email = localStorage.getItem("user");
      router.push(
        email === "marzia@gmail.com" ? "/admin-dashboard" : "/user-dashboard",
      );
    } catch (err: unknown) {
      console.error("Login failed:", err);
      setError("Login failed. Please check your credentials.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAutoFill = (role: "admin" | "user") => {
    if (role === "admin") {
      setValue("email", "marzia@gmail.com");
      setValue("password", "1234");
    } else {
      setValue("email", "user@gmail.com");
      setValue("password", "12345");
    }
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center px-4">
      {isLoading && <Loader />}

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-[#1586FD] mb-6">
          Sign in
        </h1>

        {/* ← 7. server warm-up banner */}
        {!serverReady && (
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 text-sm px-4 py-2 rounded-lg text-center mb-4">
            Server is starting up, please wait...
          </div>
        )}

        {error && <p className="text-red-500 text-center mb-4">{error}</p>}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              type="email"
              placeholder="you@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1586FD]"
              {...register("email", { required: "Email is required" })}
            />
            {errors.email && (
              <p className="text-sm text-red-500 mt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:border-[#1586FD]"
              {...register("password", { required: "Password is required" })}
            />
            {errors.password && (
              <p className="text-sm text-red-500 mt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* ← 8. disable button until server ready */}
          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#1586FD",
              "&:hover": { backgroundColor: "#0f6edc" },
            }}
            disabled={isLoading || !serverReady}
          >
            {!serverReady
              ? "Waiting for server..."
              : isLoading
                ? "Logging in..."
                : "Login"}
          </Button>
        </form>

        <div className="mt-5">
          <p className="text-center text-sm">Quick login (demo credentials):</p>
          <div className="flex justify-between mt-4 gap-4">
            <button
              type="button"
              className="w-1/2 py-2 bg-green-500 text-white rounded hover:bg-green-600"
              onClick={() => handleAutoFill("admin")}
            >
              Admin
            </button>
            <button
              type="button"
              className="w-1/2 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              onClick={() => handleAutoFill("user")}
            >
              User
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
