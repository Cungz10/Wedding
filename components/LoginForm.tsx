"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function LoginForm() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const res = await signIn("credentials", {
      email,
      password,
      redirect: false,
    });

    setSubmitting(false);

    if (res?.ok) {
      router.push("/dashboard");
    } else {
      setError("Email atau password salah.");
    }
  }

  function handleDemoLogin() {
    setEmail("pengantin@example.com");
    setPassword("password123");
    signIn("credentials", {
      email: "pengantin@example.com",
      password: "password123",
      redirect: false,
    }).then((res) => {
      if (res?.ok) {
        router.push("/dashboard");
      }
    });
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
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
        {submitting ? "Masuk..." : "Masuk"}
      </button>

      <button
        type="button"
        onClick={handleDemoLogin}
        className="rounded-full border border-rose/40 bg-white/60 py-2.5 text-xs font-semibold text-plum transition-colors hover:bg-rose/20"
      >
        ✨ 1-Klik Masuk Akun Demo (Calon Pengantin)
      </button>

      <p className="text-center text-xs text-ink/50">
        Belum punya akun?{" "}
        <Link href="/register" className="font-medium text-plum">
          Daftar
        </Link>
      </p>
    </form>
  );
}
