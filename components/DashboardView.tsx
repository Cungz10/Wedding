"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type WeddingPlan = {
  id: string;
  partnerName: string | null;
  weddingDate: string | null;
  venueCity: string | null;
  concept: string | null;
  budgetTotal: number | null;
  guestCount?: number | null;
  religion?: string | null;
};

type Task = {
  id: string;
  title: string;
  phase: string;
  isDone: boolean;
  dueDate: string | null;
  notes?: string | null;
};

type BudgetItem = {
  id: string;
  category: string;
  label: string;
  estimatedCost: number;
  actualCost: number | null;
  isPaid: boolean;
};

type Vendor = {
  id: string;
  name: string;
  category: string;
  contact: string | null;
  status: string;
  dpAmount: number;
  quotedPrice: number | null;
  notes: string | null;
};

type DocItem = {
  id: string;
  type: string;
  status: string;
  note: string | null;
  deadlineDays: number;
};

export function DashboardView() {
  const [plan, setPlan] = useState<WeddingPlan | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [budgetItems, setBudgetItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isDemo, setIsDemo] = useState(false);
  const [inviteEmail, setInviteEmail] = useState("");
  const [inviteRole, setInviteRole] = useState("Pasangan");
  const [inviting, setInviting] = useState(false);
  const [inviteSuccess, setInviteSuccess] = useState(false);
  const [showInviteModal, setShowInviteModal] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const safeJson = async (url: string) => {
          try {
            const res = await fetch(url);
            if (!res.ok) return null;
            return await res.json();
          } catch {
            return null;
          }
        };

        const [pRes, tRes, bRes, vRes, dRes] = await Promise.all([
          safeJson("/api/wedding-plan"),
          safeJson("/api/roadmap-tasks"),
          safeJson("/api/budget-items"),
          safeJson("/api/vendors"),
          safeJson("/api/documents"),
        ]);

        if (pRes?.weddingPlan) {
          setPlan(pRes.weddingPlan);
          setIsDemo(!!pRes.isDemo);
        }
        if (tRes?.tasks) setTasks(tRes.tasks);
        if (bRes?.items) setBudgetItems(bRes.items);
        if (vRes?.vendors) setVendors(vRes.vendors);
        if (dRes?.documents) setDocs(dRes.documents);
      } catch (err) {
        console.error("Failed to load dashboard data", err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  async function toggleTask(task: Task) {
    const nextStatus = !task.isDone;
    setTasks((prev) =>
      prev.map((t) => (t.id === task.id ? { ...t, isDone: nextStatus } : t))
    );
    await fetch(`/api/roadmap-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: nextStatus }),
    });
  }

  async function handleInvitePartner(e: React.FormEvent) {
    e.preventDefault();
    if (!inviteEmail) return;
    setInviting(true);
    try {
      const res = await fetch("/api/collaborators", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      if (res.ok) {
        setInviteSuccess(true);
        setInviteEmail("");
        setTimeout(() => {
          setInviteSuccess(false);
          setShowInviteModal(false);
        }, 2000);
      }
    } finally {
      setInviting(false);
    }
  }

  // Calculate stats
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.isDone).length;
  const progressPercent =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Urgent tasks this week (first 3 uncompleted tasks, prioritizing earlier phases)
  const urgentTasks = tasks.filter((t) => !t.isDone).slice(0, 3);

  // Financial calculations
  const totalBudget = plan?.budgetTotal || 160000000;
  const totalEstimated = budgetItems.reduce((sum, b) => sum + (b.estimatedCost || 0), 0);
  const totalActual = budgetItems.reduce(
    (sum, b) => sum + (b.actualCost != null ? b.actualCost : b.estimatedCost || 0),
    0
  );
  const totalPaid = budgetItems
    .filter((b) => b.isPaid)
    .reduce((sum, b) => sum + (b.actualCost || b.estimatedCost || 0), 0);

  const remainingBudget = totalBudget - totalActual;
  const budgetUsagePercent = Math.min(
    100,
    Math.round((totalActual / (totalBudget || 1)) * 100)
  );

  let financialHealth = "Aman & Terkendali";
  let healthColor = "text-emerald-700 bg-emerald-50 border-emerald-200";
  if (totalActual > totalBudget) {
    financialHealth = "Over Budget";
    healthColor = "text-rose-700 bg-rose-50 border-rose-200";
  } else if (totalActual > totalBudget * 0.9) {
    financialHealth = "Mendekati Plafon (Hati-hati)";
    healthColor = "text-amber-700 bg-amber-50 border-amber-200";
  }

  // Days countdown calculation
  let daysToGo: number | null = null;
  if (plan?.weddingDate) {
    const targetDate = new Date(plan.weddingDate).getTime();
    const diff = targetDate - Date.now();
    daysToGo = Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  }

  // Vendors needing follow-up (riset / nego)
  const pendingVendors = vendors.filter(
    (v) => v.status === "riset" || v.status === "nego"
  );
  const bookedVendors = vendors.filter(
    (v) => v.status === "booked" || v.status === "dp" || v.status === "lunas"
  );

  // Documents status
  const verifiedDocs = docs.filter((d) => d.status === "verified" || d.status === "ready").length;
  const totalDocs = docs.length;

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-rose border-t-transparent" />
          <p className="text-xs text-ink/60">Menyiapkan rencana pernikahanmu...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Demo helper alert banner */}
      {isDemo && (
        <div className="flex items-center justify-between rounded-2xl border border-rose/40 bg-white/80 p-3.5 shadow-sm">
          <div className="flex items-center gap-2.5">
            <span className="flex h-2 w-2 rounded-full bg-rose animate-pulse" />
            <div>
              <p className="text-xs font-medium text-plum-dark">
                Mode Demo Interaktif Aktif
              </p>
              <p className="text-[11px] text-ink/60">
                Kamu sedang menjelajahi simulasi rencana pernikahan lengkap.
              </p>
            </div>
          </div>
          <Link
            href="/onboarding"
            className="rounded-full bg-rose/20 px-3 py-1 text-[11px] font-medium text-plum transition-colors hover:bg-rose/30"
          >
            Reset / Baru
          </Link>
        </div>
      )}

      {/* Main Couple Greeting Card */}
      <section className="relative overflow-hidden rounded-3xl border border-rose/30 bg-gradient-to-br from-white/90 via-ivory to-rose/10 p-6 shadow-sm">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-rose">
              Project Pernikahan
            </p>
            <h1 className="mt-1 font-display text-2xl font-bold text-plum-dark sm:text-3xl">
              {plan?.partnerName ? `Rendra & ${plan.partnerName}` : "Calon Pengantin"}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-ink/70">
              {plan?.venueCity && (
                <span className="rounded-full bg-rose/15 px-2.5 py-0.5 font-medium text-plum">
                  📍 {plan.venueCity}
                </span>
              )}
              {plan?.concept && (
                <span className="rounded-full bg-gold/20 px-2.5 py-0.5 font-medium text-ink/80">
                  ✨ {plan.concept}
                </span>
              )}
              {plan?.guestCount && (
                <span className="rounded-full bg-white/70 px-2.5 py-0.5 border border-rose/20">
                  👥 ~{plan.guestCount} Undangan
                </span>
              )}
            </div>
          </div>

          {daysToGo !== null && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-rose/30 bg-white/80 px-3.5 py-2.5 text-center shadow-sm">
              <span className="text-[10px] font-medium uppercase text-rose">
                Countdown
              </span>
              <span className="font-display text-2xl font-bold text-plum">
                {daysToGo}
              </span>
              <span className="text-[10px] text-ink/50">Hari Menuju H</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        <div className="mt-6 border-t border-rose/20 pt-4">
          <div className="flex items-center justify-between text-xs">
            <span className="font-medium text-ink/70">Kesiapan Keseluruhan</span>
            <span className="font-semibold text-plum">
              {completedTasks} dari {totalTasks} Langkah ({progressPercent}%)
            </span>
          </div>
          <div className="mt-2 h-2.5 w-full overflow-hidden rounded-full bg-rose/20">
            <div
              className="h-full rounded-full bg-plum transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </section>

      {/* VALUE PROP: Kasih tau lo harus ngapain minggu ini */}
      <section className="rounded-3xl border border-rose/30 bg-white/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-rose text-ivory text-xs font-bold">
              ⚡
            </span>
            <h2 className="font-display text-lg font-semibold text-plum-dark">
              Prioritas Minggu Ini
            </h2>
          </div>
          <Link
            href="/roadmap"
            className="text-xs font-medium text-rose hover:text-plum transition-colors"
          >
            Lihat Semua ({tasks.length}) →
          </Link>
        </div>
        <p className="mt-1 text-xs text-ink/60">
          Langkah paling krusial yang perlu kamu beresin bareng pasangan sekarang.
        </p>

        <div className="mt-4 space-y-2.5">
          {urgentTasks.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-rose/30 p-4 text-center text-xs text-ink/60">
              🎉 Semua langkah minggu ini selesai! Hebat banget!
            </div>
          ) : (
            urgentTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => toggleTask(task)}
                className="group flex cursor-pointer items-start gap-3 rounded-2xl border border-rose/20 bg-ivory/50 p-3.5 transition-all hover:bg-white hover:shadow-sm"
              >
                <input
                  type="checkbox"
                  checked={task.isDone}
                  onChange={() => toggleTask(task)}
                  className="mt-0.5 h-4 w-4 rounded border-rose/50 text-plum focus:ring-plum"
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="rounded-md bg-rose/20 px-1.5 py-0.5 text-[10px] font-semibold text-plum">
                      {task.phase}
                    </span>
                    <p className="text-sm font-medium text-ink group-hover:text-plum transition-colors line-clamp-1">
                      {task.title}
                    </p>
                  </div>
                  {task.notes && (
                    <p className="mt-1 text-xs text-ink/50 line-clamp-1">
                      💡 {task.notes}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Ringkasan Financial Health & Budget */}
      <section className="rounded-3xl border border-rose/30 bg-white/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] uppercase tracking-wider text-rose font-medium">
              Health Finansial
            </span>
            <h2 className="font-display text-lg font-semibold text-plum-dark">
              Budget & Pengeluaran
            </h2>
          </div>
          <span
            className={`rounded-full border px-3 py-1 text-xs font-semibold ${healthColor}`}
          >
            {financialHealth}
          </span>
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <div className="rounded-2xl border border-rose/15 bg-ivory/40 p-3.5">
            <p className="text-[11px] text-ink/60">Plafon Rencana</p>
            <p className="mt-1 font-display text-lg font-bold text-plum-dark">
              Rp {totalBudget.toLocaleString("id-ID")}
            </p>
            <p className="mt-0.5 text-[10px] text-ink/40">Target awal</p>
          </div>
          <div className="rounded-2xl border border-rose/15 bg-ivory/40 p-3.5">
            <p className="text-[11px] text-ink/60">Estimasi / Riil Terpakai</p>
            <p className="mt-1 font-display text-lg font-bold text-ink">
              Rp {totalActual.toLocaleString("id-ID")}
            </p>
            <p className="mt-0.5 text-[10px] text-ink/40">
              {budgetUsagePercent}% dari plafon
            </p>
          </div>
        </div>

        {/* Budget Progress Bar */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-ink/70">
            <span>Sisa Plafon Anggaran</span>
            <span className={`font-semibold ${remainingBudget < 0 ? "text-rose" : "text-emerald-700"}`}>
              Rp {remainingBudget.toLocaleString("id-ID")}
            </span>
          </div>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-rose/15">
            <div
              className={`h-full rounded-full transition-all duration-500 ${
                totalActual > totalBudget ? "bg-rose" : "bg-gold"
              }`}
              style={{ width: `${Math.min(100, budgetUsagePercent)}%` }}
            />
          </div>
          <div className="mt-3 flex items-center justify-between text-[11px] text-ink/60">
            <span>Dana Sudah Dibayar (DP/Lunas):</span>
            <span className="font-medium text-plum">
              Rp {totalPaid.toLocaleString("id-ID")}
            </span>
          </div>
        </div>

        <div className="mt-4 border-t border-rose/15 pt-3">
          <Link
            href="/budget"
            className="flex items-center justify-center rounded-2xl bg-plum/10 py-2 text-xs font-medium text-plum transition-colors hover:bg-plum hover:text-ivory"
          >
            Buka Rincian Pos Budget & Vendor →
          </Link>
        </div>
      </section>

      {/* Grid: Vendor Follow-up & Dokumen Legal */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Vendor Status */}
        <section className="flex flex-col justify-between rounded-3xl border border-rose/30 bg-white/80 p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-rose">
                Vendor
              </span>
              <span className="text-xs text-ink/40">{vendors.length} Total</span>
            </div>
            <h3 className="mt-1 font-display text-base font-semibold text-plum-dark">
              Manajemen Vendor
            </h3>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Booked / DP:</span>
                <span className="font-semibold text-emerald-700">
                  {bookedVendors.length}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Nego / Riset:</span>
                <span className="font-semibold text-amber-700">
                  {pendingVendors.length}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/budget"
            className="mt-4 block rounded-xl border border-rose/30 bg-white py-1.5 text-center text-[11px] font-medium text-plum hover:bg-rose/10"
          >
            Kelola Vendor →
          </Link>
        </section>

        {/* Dokumen Status */}
        <section className="flex flex-col justify-between rounded-3xl border border-rose/30 bg-white/80 p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-[10px] uppercase font-semibold text-rose">
                KUA / Sipil
              </span>
              <span className="text-xs text-ink/40">{totalDocs} Syarat</span>
            </div>
            <h3 className="mt-1 font-display text-base font-semibold text-plum-dark">
              Legalitas & Berkas
            </h3>
            <div className="mt-3 space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Siap / Valid:</span>
                <span className="font-semibold text-emerald-700">
                  {verifiedDocs}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-ink/60">Belum Selesai:</span>
                <span className="font-semibold text-rose">
                  {totalDocs - verifiedDocs}
                </span>
              </div>
            </div>
          </div>

          <Link
            href="/dokumen"
            className="mt-4 block rounded-xl border border-rose/30 bg-white py-1.5 text-center text-[11px] font-medium text-plum hover:bg-rose/10"
          >
            Cek Checklist →
          </Link>
        </section>
      </div>

      {/* Kolaborasi Pasangan & WO Card */}
      <section className="rounded-3xl border border-rose/30 bg-white/80 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2 overflow-hidden">
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-plum text-xs font-semibold text-ivory">
                R
              </div>
              <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-white bg-rose text-xs font-semibold text-ivory">
                S
              </div>
            </div>
            <div>
              <p className="text-xs font-semibold text-plum-dark">
                Kolaborasi Pasangan
              </p>
              <p className="text-[11px] text-ink/60">
                1 Ruang Kerja Bersama (Calon Pria & Wanita)
              </p>
            </div>
          </div>

          <button
            onClick={() => setShowInviteModal(true)}
            className="rounded-full border border-plum px-3 py-1.5 text-xs font-medium text-plum transition-colors hover:bg-plum hover:text-ivory"
          >
            + Ajak Pasangan / WO
          </button>
        </div>

        {showInviteModal && (
          <form
            onSubmit={handleInvitePartner}
            className="mt-4 rounded-2xl border border-rose/30 bg-ivory/60 p-4"
          >
            <p className="text-xs font-semibold text-plum-dark">
              Undang Pasangan atau Tim Keluarga / WO
            </p>
            <p className="mt-0.5 text-[11px] text-ink/60">
              Kirim akses agar bisa cek budget dan centang roadmap bareng-bareng.
            </p>

            <div className="mt-3 flex flex-col gap-2">
              <input
                type="email"
                required
                placeholder="email.pasangan@gmail.com"
                value={inviteEmail}
                onChange={(e) => setInviteEmail(e.target.value)}
                className="w-full rounded-xl border border-rose/40 bg-white px-3 py-2 text-xs text-ink outline-none focus:border-plum"
              />
              <div className="flex gap-2">
                <select
                  value={inviteRole}
                  onChange={(e) => setInviteRole(e.target.value)}
                  className="rounded-xl border border-rose/40 bg-white px-2 py-2 text-xs text-ink outline-none"
                >
                  <option value="Pasangan">Peran: Pasangan</option>
                  <option value="Wedding Organizer">Peran: Wedding Organizer</option>
                  <option value="Keluarga">Peran: Keluarga / Wali</option>
                </select>
                <button
                  type="submit"
                  disabled={inviting}
                  className="flex-1 rounded-xl bg-plum px-4 py-2 text-xs font-medium text-ivory transition-colors hover:bg-plum-dark disabled:opacity-50"
                >
                  {inviting ? "Mengirim..." : "Kirim Undangan"}
                </button>
              </div>
            </div>
            {inviteSuccess && (
              <p className="mt-2 text-xs font-medium text-emerald-600">
                ✓ Undangan kolaborator terkirim!
              </p>
            )}
          </form>
        )}
      </section>
    </div>
  );
}
