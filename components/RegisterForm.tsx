"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function RegisterForm() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password }),
    });

    if (!res.ok) {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal mendaftar, coba lagi ya.");
      setSubmitting(false);
      return;
    }

    const signInRes = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (signInRes?.ok) {
      router.push("/onboarding");
    } else {
      router.push("/login");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div>
        <label className="text-xs text-ink/50">Nama</label>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="mt-1 w-full border-b border-rose/50 bg-transparent pb-2 text-ink outline-none focus:border-plum"
        />
      </div>
      <div>
        <label className="text-xs text-ink/50">Email</label>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="mt-1 w-full border-b border-rose/50 bg-transparent pb-2 text-ink outline-none focus:border-plum"
        />
      </div>
      <div>
        <label className="text-xs text-ink/50">Password</label>
        <input
          required
          type="password"
          minLength={8}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="mt-1 w-full border-b border-rose/50 bg-transparent pb-2 text-ink outline-none focus:border-plum"
        />
      </div>

      {error && <p className="text-xs text-plum">{error}</p>}

      <button
        type="submit"
        disabled={submitting}
        className="mt-2 rounded-full bg-plum px-8 py-3 text-sm font-medium text-ivory transition-colors hover:bg-plum-dark disabled:opacity-60"
      >
        {submitting ? "Mendaftar..." : "Daftar"}
      </button>

      <p className="text-center text-xs text-ink/50">
        Udah punya akun?{" "}
        <Link href="/login" className="font-medium text-plum">
          Masuk
        </Link>
      </p>
    </form>
  );
}
