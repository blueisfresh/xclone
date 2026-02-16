"use client";

import { useRouter } from "next/navigation";
import React, { FormEvent } from "react";

export default function LoginPage() {
  const router = useRouter();

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const formData = new FormData(event.currentTarget);
    const identifier = formData.get("identifier")?.toString() || "";
    const password = formData.get("password")?.toString() || "";

    const response = await fetch("/api/auth/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ identifier, password }),
    });

    if (response.ok) {
      router.push("/dashboard");
    } else {
      console.error("Login failed");
    }
  }
  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        name="identifier"
        placeholder="Email or Username"
        required
      />
      <input type="password" name="password" placeholder="Password" required />
      <button type="submit">Login</button>
    </form>
  );
}
