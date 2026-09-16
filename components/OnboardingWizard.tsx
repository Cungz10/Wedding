"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  partnerName: string;
  weddingDate: string;
  venueCity: string;
  concept: string;
  budgetTotal: string;
};

const CONCEPTS = ["Intimate", "Adat", "Modern"];

const steps = [
  { key: "partnerName", title: "Siapa nama pasanganmu?" },
  { key: "weddingDate", title: "Kapan rencana hari bahagianya?" },
  { key: "venueCity", title: "Di kota mana acaranya?" },
  { key: "concept", title: "Konsep pernikahan seperti apa?" },
  { key: "budgetTotal", title: "Berapa perkiraan budget total?" },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    partnerName: "",
    weddingDate: "",
    venueCity: "",
    concept: "",
    budgetTotal: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleNext() {
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/wedding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        router.push("/dashboard");
        return;
      }
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Gagal menyimpan, coba lagi ya.");
    } catch {
      setError("Gagal menyimpan, coba lagi ya.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-screen flex-col px-6 py-10">
      {/* Progress dots */}
      <div className="mb-10 flex items-center justify-center gap-2">
        {steps.map((s, i) => (
          <span
            key={s.key}
            className={`h-1.5 rounded-full transition-all ${
              i === stepIndex ? "w-6 bg-plum" : "w-1.5 bg-rose/40"
            }`}
          />
        ))}
      </div>

      <h1 className="font-display text-2xl font-semibold text-plum-dark">
        {step.title}
      </h1>

      <div className="mt-8 flex-1">
        {step.key === "partnerName" && (
          <input
            autoFocus
            value={form.partnerName}
            onChange={(e) => update("partnerName", e.target.value)}
            placeholder="Nama pasangan"
            className="w-full border-b border-rose/50 bg-transparent pb-2 font-display text-xl text-ink outline-none focus:border-plum"
          />
        )}
        {step.key === "weddingDate" && (
          <input
            type="date"
            value={form.weddingDate}
            onChange={(e) => update("weddingDate", e.target.value)}
            className="w-full border-b border-rose/50 bg-transparent pb-2 text-lg text-ink outline-none focus:border-plum"
          />
        )}
        {step.key === "venueCity" && (
          <input
            value={form.venueCity}
            onChange={(e) => update("venueCity", e.target.value)}
            placeholder="Contoh: Karawang"
            className="w-full border-b border-rose/50 bg-transparent pb-2 text-lg text-ink outline-none focus:border-plum"
          />
        )}
        {step.key === "concept" && (
          <div className="flex flex-col gap-3">
            {CONCEPTS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update("concept", c)}
                className={`rounded-2xl border px-5 py-3 text-left text-sm transition-colors ${
                  form.concept === c
                    ? "border-plum bg-plum text-ivory"
                    : "border-rose/40 text-ink/80"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
        {step.key === "budgetTotal" && (
          <div className="flex items-center border-b border-rose/50 pb-2">
            <span className="mr-2 text-lg text-ink/50">Rp</span>
            <input
              inputMode="numeric"
              value={form.budgetTotal}
              onChange={(e) => update("budgetTotal", e.target.value.replace(/\D/g, ""))}
              placeholder="0"
              className="w-full bg-transparent text-lg text-ink outline-none"
            />
          </div>
        )}
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {error && <p className="text-center text-xs text-plum">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="text-sm text-ink/50 disabled:opacity-0"
          >
            Kembali
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="rounded-full bg-plum px-8 py-3 text-sm font-medium text-ivory transition-colors hover:bg-plum-dark disabled:opacity-60"
          >
            {isLast ? (submitting ? "Menyimpan..." : "Selesai") : "Lanjut"}
          </button>
        </div>
      </div>
    </div>
  );
}
