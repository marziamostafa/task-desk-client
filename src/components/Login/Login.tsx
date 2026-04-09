"use client";

import Loader from "@/app/loading";
import { UserLoginResponse } from "@/app/types/user";
import { Button } from "@mui/material";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { SubmitHandler, useForm } from "react-hook-form";

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

  const onSubmit: SubmitHandler<Inputs> = async (formData) => {
    setIsLoading(true);
    setError(null);
    // console.log("API URL:", process.env.NEXT_PUBLIC_API_URL);
    try {
      const response = await fetch(
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

      // Access the token
      const token = data.accessToken;
      localStorage.setItem("token", token);

      // Decode JWT to get user info
      const payload = JSON.parse(atob(token.split(".")[1]));
      localStorage.setItem("user", payload.email);
      localStorage.setItem("role", payload.role);
      localStorage.setItem("id", payload._id ?? "");
      localStorage.setItem("name", payload.username ?? "");

      alert("Login successful");

      // const dashboardRoles = ["admin", "super admin"];

      // router.push(
      //   dashboardRoles.includes(payload.role?.toLowerCase())
      //     ? "/dashboard"
      //     : "/",
      // );

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
      // Set admin credentials
      setValue("email", "marzia@gmail.com");
      setValue("password", "1234"); // Replace with actual admin password
    } else {
      // Set user credentials
      setValue("email", "user@gmail.com");
      setValue("password", "12345"); // Replace with actual user password
    }
  };

  return (
    <div className="min-h-screen w-full  flex flex-col justify-center items-center px-4">
      {isLoading && <Loader />}

      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-[#1586FD] mb-6">
          Sign in
        </h1>

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

          <Button
            type="submit"
            fullWidth
            variant="contained"
            sx={{
              backgroundColor: "#1586FD",
              "&:hover": { backgroundColor: "#0f6edc" },
            }}
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </Button>
        </form>

        {/* <p className="text-sm text-center text-gray-600 mt-4">
          Don’t have an account?{" "}
          <a href="/register" className="text-[#1586FD] font-medium underline">
            Register
          </a>
        </p> */}

        {/* Auto-fill buttons */}
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
