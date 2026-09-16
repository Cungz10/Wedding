"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type FormState = {
  partnerName: string;
  weddingDate: string;
  venueCity: string;
  concept: string;
  budgetTotal: string;
  guestCount: string;
  religion: string;
};

const CONCEPTS = [
  { id: "Modern Adat Sunda", label: "Adat Sunda (Modern / Tradisional)" },
  { id: "Adat Jawa", label: "Adat Jawa (Klasik / Modern)" },
  { id: "Adat Minang", label: "Adat Minang (Suntiang / Modern)" },
  { id: "Nasional / Modern Elegan", label: "Nasional / Modern Elegan (Tanpa Adat)" },
  { id: "Intimate Garden / Rustic", label: "Intimate Wedding (50-150 tamu)" },
];

const RELIGIONS = [
  { id: "Islam (KUA)", label: "Islam — KUA & SIMKAH" },
  { id: "Kristen (Catatan Sipil)", label: "Kristen — Pemberkatan & Disdukcapil" },
  { id: "Katolik", label: "Katolik — Kursus KPP & Sakramen" },
  { id: "Hindu / Buddha / Lainnya", label: "Hindu / Buddha / Sipil" },
];

const GUEST_TIERS = [
  { id: "150", label: "Intimate (~150 tamu / 75 undangan)" },
  { id: "350", label: "Menengah (~350 tamu / 175 undangan)" },
  { id: "600", label: "Besar (~600 tamu / 300 undangan)" },
  { id: "1000", label: "Akbar (1000+ tamu)" },
];

const steps = [
  { key: "partnerName", title: "Siapa nama kamu dan pasanganmu?", subtitle: "Kalian berdua adalah kapten dari project pernikahan ini." },
  { key: "religion", title: "Jalur legalitas & akad pernikahan?", subtitle: "Sistem akan menyesuaikan dokumen KUA / Disdukcapil otomatis." },
  { key: "weddingDate", title: "Kapan rencana hari bahagianya?", subtitle: "Bisa pilih tanggal pasti atau perkiraan bulan." },
  { key: "venueCity", title: "Di kota mana acara akan diadakan?", subtitle: "Untuk estimasi venue, vendor lokal, dan KUA kecamatan." },
  { key: "concept", title: "Konsep & tema pernikahan?", subtitle: "Membantu menyesuaikan prioritas busana & dekorasi." },
  { key: "guestCount", title: "Perkiraan jumlah tamu?", subtitle: "Menentukan kapasitas gedung dan porsi catering utama." },
  { key: "budgetTotal", title: "Berapa plafon budget total?", subtitle: "Kami bantu bagi persentase pos biaya agar gak boncos." },
] as const;

export function OnboardingWizard() {
  const router = useRouter();
  const [stepIndex, setStepIndex] = useState(0);
  const [form, setForm] = useState<FormState>({
    partnerName: "",
    weddingDate: "",
    venueCity: "",
    concept: CONCEPTS[0].id,
    budgetTotal: "150000000",
    guestCount: "350",
    religion: RELIGIONS[0].id,
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const step = steps[stepIndex];
  const isLast = stepIndex === steps.length - 1;

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleNext() {
    if (step.key === "partnerName" && !form.partnerName.trim()) {
      setError("Masukkan nama pasanganmu terlebih dahulu.");
      return;
    }

    setError(null);
    if (!isLast) {
      setStepIndex((i) => i + 1);
      return;
    }

    setSubmitting(true);
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
    <div className="flex min-h-screen flex-col px-6 py-10 justify-between">
      <div>
        {/* Progress tracker */}
        <div className="mb-8 flex items-center justify-between">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-rose">
            Langkah {stepIndex + 1} dari {steps.length}
          </span>
          <div className="flex items-center gap-1.5">
            {steps.map((s, i) => (
              <span
                key={s.key}
                className={`h-1.5 rounded-full transition-all ${
                  i === stepIndex ? "w-6 bg-plum" : i < stepIndex ? "w-2 bg-plum/40" : "w-1.5 bg-rose/30"
                }`}
              />
            ))}
          </div>
        </div>

        <h1 className="font-display text-2xl font-bold text-plum-dark sm:text-3xl">
          {step.title}
        </h1>
        <p className="mt-2 text-xs text-ink/60">{step.subtitle}</p>

        <div className="mt-8">
          {step.key === "partnerName" && (
            <div>
              <input
                autoFocus
                value={form.partnerName}
                onChange={(e) => update("partnerName", e.target.value)}
                placeholder="Contoh: Sarah Azzahra"
                className="w-full border-b-2 border-rose/40 bg-transparent pb-3 font-display text-xl text-ink outline-none focus:border-plum"
              />
              <p className="mt-3 text-[11px] text-ink/50">
                💡 Nama ini akan dipajang bersama di dashboard & undangan kolaborasi.
              </p>
            </div>
          )}

          {step.key === "religion" && (
            <div className="flex flex-col gap-2.5">
              {RELIGIONS.map((r) => (
                <button
                  key={r.id}
                  type="button"
                  onClick={() => update("religion", r.id)}
                  className={`rounded-2xl border p-4 text-left text-xs font-medium transition-all ${
                    form.religion === r.id
                      ? "border-plum bg-plum text-ivory shadow-sm"
                      : "border-rose/30 bg-white/70 text-ink hover:border-plum/40"
                  }`}
                >
                  {r.label}
                </button>
              ))}
            </div>
          )}

          {step.key === "weddingDate" && (
            <div className="space-y-4">
              <input
                type="date"
                value={form.weddingDate}
                onChange={(e) => update("weddingDate", e.target.value)}
                className="w-full rounded-2xl border border-rose/40 bg-white px-4 py-3 text-base text-ink outline-none focus:border-plum"
              />
              <p className="text-[11px] text-ink/50">
                Belum punya tanggal pasti? Pilih perkiraan bulan atau 6 bulan dari sekarang. Nanti bisa diganti kapan saja.
              </p>
            </div>
          )}

          {step.key === "venueCity" && (
            <div>
              <input
                autoFocus
                value={form.venueCity}
                onChange={(e) => update("venueCity", e.target.value)}
                placeholder="Contoh: Bandung / Jakarta Selatan"
                className="w-full border-b-2 border-rose/40 bg-transparent pb-3 font-display text-xl text-ink outline-none focus:border-plum"
              />
              <div className="mt-4 flex flex-wrap gap-2">
                {["Jakarta", "Bandung", "Surabaya", "Yogyakarta", "Semarang", "Bali"].map((city) => (
                  <button
                    key={city}
                    type="button"
                    onClick={() => update("venueCity", city)}
                    className="rounded-full border border-rose/30 bg-white/80 px-3 py-1 text-xs text-ink/70 hover:bg-rose/10"
                  >
                    {city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {step.key === "concept" && (
            <div className="flex flex-col gap-2.5">
              {CONCEPTS.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  onClick={() => update("concept", c.id)}
                  className={`rounded-2xl border p-4 text-left text-xs font-medium transition-all ${
                    form.concept === c.id
                      ? "border-plum bg-plum text-ivory shadow-sm"
                      : "border-rose/30 bg-white/70 text-ink hover:border-plum/40"
                  }`}
                >
                  {c.label}
                </button>
              ))}
            </div>
          )}

          {step.key === "guestCount" && (
            <div className="flex flex-col gap-2.5">
              {GUEST_TIERS.map((g) => (
                <button
                  key={g.id}
                  type="button"
                  onClick={() => update("guestCount", g.id)}
                  className={`rounded-2xl border p-4 text-left text-xs font-medium transition-all ${
                    form.guestCount === g.id
                      ? "border-plum bg-plum text-ivory shadow-sm"
                      : "border-rose/30 bg-white/70 text-ink hover:border-plum/40"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>
          )}

          {step.key === "budgetTotal" && (
            <div>
              <div className="flex items-center border-b-2 border-rose/40 pb-2">
                <span className="mr-2 text-xl font-bold text-plum">Rp</span>
                <input
                  inputMode="numeric"
                  value={
                    form.budgetTotal
                      ? Number(form.budgetTotal.replace(/\D/g, "")).toLocaleString("id-ID")
                      : ""
                  }
                  onChange={(e) =>
                    update("budgetTotal", e.target.value.replace(/\D/g, ""))
                  }
                  placeholder="150.000.000"
                  className="w-full bg-transparent font-display text-2xl font-bold text-ink outline-none"
                />
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                {["75000000", "120000000", "160000000", "250000000", "500000000"].map((amt) => (
                  <button
                    key={amt}
                    type="button"
                    onClick={() => update("budgetTotal", amt)}
                    className="rounded-full border border-rose/30 bg-white/80 px-3 py-1 text-xs text-ink/70 hover:bg-rose/10"
                  >
                    Rp {(Number(amt) / 1000000).toFixed(0)} Juta
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        {error && <p className="text-center text-xs font-medium text-rose">{error}</p>}
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
            disabled={stepIndex === 0}
            className="text-xs font-medium text-ink/50 disabled:opacity-0"
          >
            ← Kembali
          </button>
          <button
            type="button"
            onClick={handleNext}
            disabled={submitting}
            className="rounded-full bg-plum px-8 py-3 text-xs font-semibold text-ivory shadow-sm transition-colors hover:bg-plum-dark disabled:opacity-60"
          >
            {isLast
              ? submitting
                ? "Menyiapkan Dashboard..."
                : "Mulai Rencana Pernikahan →"
              : "Lanjut →"}
          </button>
        </div>
      </div>
    </div>
  );
}
