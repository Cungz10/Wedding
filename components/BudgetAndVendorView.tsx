"use client";

import { useEffect, useState } from "react";
import { Wallet, Handshake, Phone, Pencil, FileEdit, Scale } from "lucide-react";

type BudgetItem = {
  id: string;
  category: string;
  label: string;
  estimatedCost: number;
  actualCost: number | null;
  isPaid: boolean;
  updatedBy?: string | null;
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

const CATEGORIES = [
  "Venue & Catering",
  "Dekorasi",
  "MUA & Busana",
  "Dokumentasi",
  "Wedding Organizer",
  "Cincin & Mahar",
  "Undangan & Souvenir",
  "Entertainment & MC",
  "Dana Darurat",
  "Lainnya",
];

const VENDOR_STATUSES: Record<string, { label: string; color: string }> = {
  riset: { label: "Riset", color: "bg-stone-100 text-stone-700 border-stone-200" },
  nego: { label: "Nego Harga", color: "bg-amber-100 text-amber-800 border-amber-200" },
  booked: { label: "Booked", color: "bg-blue-100 text-blue-800 border-blue-200" },
  dp: { label: "DP Terbayar", color: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  lunas: { label: "Lunas", color: "bg-purple-100 text-purple-800 border-purple-200" },
  batal: { label: "Batal", color: "bg-rose-100 text-rose-800 border-rose-200" },
};

export function BudgetAndVendorView() {
  const [activeTab, setActiveTab] = useState<"budget" | "vendor">("budget");
  const [items, setItems] = useState<BudgetItem[]>([]);
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [budgetTotal, setBudgetTotal] = useState<number>(160000000);
  const [loading, setLoading] = useState(true);

  // Form states - Budget
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [newBudgetCategory, setNewBudgetCategory] = useState(CATEGORIES[0]);
  const [newBudgetLabel, setNewBudgetLabel] = useState("");
  const [newBudgetEstimated, setNewBudgetEstimated] = useState("");
  const [newBudgetActual, setNewBudgetActual] = useState("");

  // Form states - Vendor
  const [showAddVendor, setShowAddVendor] = useState(false);
  const [newVendorName, setNewVendorName] = useState("");
  const [newVendorCategory, setNewVendorCategory] = useState(CATEGORIES[0]);
  const [newVendorContact, setNewVendorContact] = useState("");
  const [newVendorStatus, setNewVendorStatus] = useState("riset");
  const [newVendorPrice, setNewVendorPrice] = useState("");
  const [newVendorDp, setNewVendorDp] = useState("");
  const [newVendorNotes, setNewVendorNotes] = useState("");

  // Vendor category filter & comparison
  const [vendorCategoryFilter, setVendorCategoryFilter] = useState("ALL");
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [showCompareModal, setShowCompareModal] = useState(false);

  useEffect(() => {
    async function load() {
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

        const [planRes, bgtRes, vndRes] = await Promise.all([
          safeJson("/api/wedding-plan"),
          safeJson("/api/budget-items"),
          safeJson("/api/vendors"),
        ]);

        if (planRes?.weddingPlan?.budgetTotal) {
          setBudgetTotal(planRes.weddingPlan.budgetTotal);
        }
        if (bgtRes?.items) setItems(bgtRes.items);
        if (vndRes?.vendors) setVendors(vndRes.vendors);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  // Budget calculations
  const totalEstimated = items.reduce((s, i) => s + (i.estimatedCost || 0), 0);
  const totalActual = items.reduce(
    (s, i) => s + (i.actualCost != null ? i.actualCost : i.estimatedCost || 0),
    0
  );
  const totalPaid = items
    .filter((i) => i.isPaid)
    .reduce((s, i) => s + (i.actualCost != null ? i.actualCost : i.estimatedCost || 0), 0);
  const remaining = budgetTotal - totalActual;
  const isOverBudget = totalActual > budgetTotal;

  async function handleAddBudget(e: React.FormEvent) {
    e.preventDefault();
    if (!newBudgetLabel.trim() || !newBudgetEstimated) return;

    const res = await fetch("/api/budget-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category: newBudgetCategory,
        label: newBudgetLabel.trim(),
        estimatedCost: Number(newBudgetEstimated),
        actualCost: newBudgetActual ? Number(newBudgetActual) : null,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setItems((prev) => [...prev, data.item]);
      setNewBudgetLabel("");
      setNewBudgetEstimated("");
      setNewBudgetActual("");
      setShowAddBudget(false);
    }
  }

  async function togglePaid(item: BudgetItem) {
    const nextPaid = !item.isPaid;
    setItems((prev) =>
      prev.map((i) => (i.id === item.id ? { ...i, isPaid: nextPaid } : i))
    );
    await fetch("/api/budget-items", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: item.id, isPaid: nextPaid }),
    });
  }

  async function deleteBudgetItem(id: string) {
    setItems((prev) => prev.filter((i) => i.id !== id));
    await fetch(`/api/budget-items?id=${id}`, { method: "DELETE" });
  }

  async function handleApplyTemplate() {
    if (!confirm("Terapkan alokasi persentase rekomendasi pernikahan Indonesia?")) return;
    const res = await fetch("/api/budget-items", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        action: "apply_template",
        budgetTotal: budgetTotal || 150000000,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setItems(data.items);
    }
  }

  async function handleAddVendor(e: React.FormEvent) {
    e.preventDefault();
    if (!newVendorName.trim()) return;

    const res = await fetch("/api/vendors", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: newVendorName.trim(),
        category: newVendorCategory,
        contact: newVendorContact.trim() || undefined,
        status: newVendorStatus,
        quotedPrice: newVendorPrice ? Number(newVendorPrice) : null,
        dpAmount: newVendorDp ? Number(newVendorDp) : 0,
        notes: newVendorNotes.trim() || undefined,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setVendors((prev) => [...prev, data.vendor]);
      setNewVendorName("");
      setNewVendorContact("");
      setNewVendorPrice("");
      setNewVendorDp("");
      setNewVendorNotes("");
      setShowAddVendor(false);
    }
  }

  async function updateVendorStatus(id: string, nextStatus: string) {
    setVendors((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: nextStatus } : v))
    );
    await fetch("/api/vendors", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
  }

  async function deleteVendor(id: string) {
    setVendors((prev) => prev.filter((v) => v.id !== id));
    await fetch(`/api/vendors?id=${id}`, { method: "DELETE" });
  }

  function toggleCompare(id: string) {
    setCompareIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  const comparedVendors = vendors.filter((v) => compareIds.includes(v.id));

  const filteredVendors =
    vendorCategoryFilter === "ALL"
      ? vendors
      : vendors.filter((v) => v.category.toLowerCase().includes(vendorCategoryFilter.toLowerCase()));

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Tabs Navigation */}
      <div className="flex rounded-2xl bg-white/80 p-1.5 border border-rose/30 shadow-sm">
        <button
          onClick={() => setActiveTab("budget")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === "budget"
              ? "bg-plum text-ivory shadow-sm"
              : "text-ink/70 hover:text-plum"
          }`}
        >
          <Wallet className="h-4 w-4 mr-1.5 inline" /> Pos & Tracking Budget
        </button>
        <button
          onClick={() => setActiveTab("vendor")}
          className={`flex-1 rounded-xl py-2 text-xs font-semibold transition-all ${
            activeTab === "vendor"
              ? "bg-plum text-ivory shadow-sm"
              : "text-ink/70 hover:text-plum"
          }`}
        >
          <Handshake className="h-4 w-4 mr-1.5 inline" /> Riset & Vendor ({vendors.length})
        </button>
      </div>

      {activeTab === "budget" ? (
        /* BUDGET SECTION */
        <div className="space-y-6">
          {/* Budget Overview Card */}
          <section className="rounded-3xl border border-rose/30 bg-gradient-to-br from-white/90 via-ivory to-rose/10 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose">
                  Plafon Keseluruhan
                </span>
                <p className="font-display text-2xl font-bold text-plum-dark">
                  Rp {budgetTotal.toLocaleString("id-ID")}
                </p>
              </div>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isOverBudget
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-emerald-50 text-emerald-700 border-emerald-200"
                }`}
              >
                {isOverBudget ? "⚠️ Over Budget" : "✓ Terkendali"}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-3 gap-2.5 text-center">
              <div className="rounded-2xl border border-rose/20 bg-white/70 p-2.5">
                <p className="text-[10px] text-ink/50">Total Rencana</p>
                <p className="mt-0.5 text-xs font-bold text-ink">
                  Rp {(totalEstimated / 1000000).toFixed(1)}jt
                </p>
              </div>
              <div className="rounded-2xl border border-rose/20 bg-white/70 p-2.5">
                <p className="text-[10px] text-ink/50">Riil / Terpakai</p>
                <p className="mt-0.5 text-xs font-bold text-plum">
                  Rp {(totalActual / 1000000).toFixed(1)}jt
                </p>
              </div>
              <div className="rounded-2xl border border-rose/20 bg-white/70 p-2.5">
                <p className="text-[10px] text-ink/50">Sisa Anggaran</p>
                <p
                  className={`mt-0.5 text-xs font-bold ${
                    remaining < 0 ? "text-rose" : "text-emerald-700"
                  }`}
                >
                  Rp {(remaining / 1000000).toFixed(1)}jt
                </p>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-4">
              <div className="flex justify-between text-[11px] text-ink/60">
                <span>Persentase Pemakaian Budget</span>
                <span>{Math.round((totalActual / (budgetTotal || 1)) * 100)}%</span>
              </div>
              <div className="mt-1.5 h-2 w-full overflow-hidden rounded-full bg-rose/20">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${
                    isOverBudget ? "bg-rose" : "bg-gold"
                  }`}
                  style={{
                    width: `${Math.min(100, Math.round((totalActual / (budgetTotal || 1)) * 100))}%`,
                  }}
                />
              </div>
              <div className="mt-2 text-right">
                <span className="text-[11px] text-emerald-700 font-medium">
                  ✓ Sudah dibayar (DP/Lunas): Rp {totalPaid.toLocaleString("id-ID")}
                </span>
              </div>
            </div>
          </section>

          {/* Action Bar */}
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-plum-dark">
              Daftar Pos Anggaran ({items.length})
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleApplyTemplate}
                title="Terapkan pembagian persentase standar pernikahan Indonesia"
                className="rounded-full border border-rose/40 bg-white/80 px-3 py-1.5 text-[11px] font-medium text-plum hover:bg-rose/10"
              >
                Template Standar
              </button>
              <button
                onClick={() => setShowAddBudget(true)}
                className="rounded-full bg-plum px-3.5 py-1.5 text-[11px] font-semibold text-ivory hover:bg-plum-dark"
              >
                + Tambah Pos
              </button>
            </div>
          </div>

          {/* Add Budget Modal / Form */}
          {showAddBudget && (
            <form
              onSubmit={handleAddBudget}
              className="rounded-3xl border border-rose/40 bg-white/95 p-5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-plum-dark">
                  Tambah Pos Budget Baru
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="text-xs text-ink/40 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-[11px] text-ink/60">Kategori</label>
                <select
                  value={newBudgetCategory}
                  onChange={(e) => setNewBudgetCategory(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose/30 bg-ivory/50 px-3 py-2 text-xs text-ink outline-none"
                >
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-[11px] text-ink/60">Nama Pos / Item</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sewa Gedung & Parkir"
                  value={newBudgetLabel}
                  onChange={(e) => setNewBudgetLabel(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-ink/60">Estimasi Rencana (Rp)</label>
                  <input
                    type="number"
                    required
                    placeholder="25000000"
                    value={newBudgetEstimated}
                    onChange={(e) => setNewBudgetEstimated(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink/60">Riil / Tagihan (Opsional)</label>
                  <input
                    type="number"
                    placeholder="26000000"
                    value={newBudgetActual}
                    onChange={(e) => setNewBudgetActual(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-plum py-2.5 text-xs font-semibold text-ivory hover:bg-plum-dark"
              >
                Simpan Pos Budget
              </button>
            </form>
          )}

          {/* Budget Items List */}
          <div className="space-y-3">
            {items.map((item) => {
              const currentCost = item.actualCost != null ? item.actualCost : item.estimatedCost;
              const isItemOver = item.actualCost != null && item.actualCost > item.estimatedCost;

              return (
                <div
                  key={item.id}
                  className="rounded-2xl border border-rose/25 bg-white/80 p-4 shadow-sm transition-all hover:border-plum/30"
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="rounded-md bg-rose/15 px-2 py-0.5 text-[10px] font-semibold text-plum">
                        {item.category}
                      </span>
                      <h4 className="mt-1 text-sm font-semibold text-ink">
                        {item.label}
                      </h4>
                    </div>
                    <button
                      onClick={() => deleteBudgetItem(item.id)}
                      title="Hapus pos"
                      className="text-xs text-ink/30 hover:text-rose"
                    >
                      ✕
                    </button>
                  </div>

                  <div className="mt-3 flex items-center justify-between border-t border-rose/10 pt-2.5 text-xs">
                    <div>
                      <p className="text-[10px] text-ink/50">
                        Rencana: Rp {item.estimatedCost.toLocaleString("id-ID")}
                      </p>
                      <p
                        className={`text-sm font-bold ${
                          isItemOver ? "text-rose" : "text-plum-dark"
                        }`}
                      >
                        Riil: Rp {currentCost.toLocaleString("id-ID")}
                        {isItemOver && (
                          <span className="ml-1 text-[10px] font-normal text-rose">
                            (+Rp {(item.actualCost! - item.estimatedCost).toLocaleString("id-ID")})
                          </span>
                        )}
                      </p>
                    </div>

                    <button
                      onClick={() => togglePaid(item)}
                      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                        item.isPaid
                          ? "bg-emerald-100 text-emerald-800 border border-emerald-300"
                          : "bg-ivory text-ink/60 border border-rose/30 hover:bg-rose/10"
                      }`}
                    >
                      {item.isPaid ? "✓ Terbayar / DP" : "○ Belum Bayar"}
                    </button>
                  </div>
                  
                  {item.updatedBy && (
                    <div className="mt-1 flex justify-end">
                      <span className="text-[9px] font-medium text-ink/40 bg-ivory px-1.5 py-0.5 rounded border border-rose/10 flex items-center gap-1">
                        <Pencil className="h-3 w-3" /> Diubah oleh {item.updatedBy}
                      </span>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        /* VENDOR MANAGEMENT SECTION */
        <div className="space-y-6">
          {/* Vendor Overview & Category Filter */}
          <section className="rounded-3xl border border-rose/30 bg-gradient-to-br from-white/90 via-ivory to-rose/10 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-rose">
                  Hub Vendor Pernikahan
                </span>
                <h2 className="font-display text-xl font-bold text-plum-dark">
                  Daftar & Perbandingan Vendor
                </h2>
              </div>
              <button
                onClick={() => setShowAddVendor(true)}
                className="rounded-full bg-plum px-3.5 py-1.5 text-xs font-semibold text-ivory hover:bg-plum-dark"
              >
                + Vendor Baru
              </button>
            </div>

            <p className="mt-1 text-xs text-ink/60">
              Catat kandidat vendor, kontak WhatsApp, penawaran harga, dan bandingkan sebelum DP.
            </p>

            {compareIds.length > 0 && (
              <div className="mt-4 flex items-center justify-between rounded-2xl border border-plum/30 bg-plum/10 p-3">
                <span className="text-xs font-medium text-plum">
                  {compareIds.length} vendor dipilih untuk perbandingan
                </span>
                <div className="flex gap-2">
                  <button
                    onClick={() => setCompareIds([])}
                    className="text-xs text-ink/50 hover:text-ink"
                  >
                    Batal
                  </button>
                  <button
                    onClick={() => setShowCompareModal(true)}
                    className="rounded-full bg-plum px-3 py-1 text-xs font-semibold text-ivory hover:bg-plum-dark"
                  >
                    Bandingkan Sekarang →
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Add Vendor Form */}
          {showAddVendor && (
            <form
              onSubmit={handleAddVendor}
              className="rounded-3xl border border-rose/40 bg-white/95 p-5 shadow-md space-y-3"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-display text-sm font-bold text-plum-dark">
                  Tambah Kandidat Vendor
                </h4>
                <button
                  type="button"
                  onClick={() => setShowAddVendor(false)}
                  className="text-xs text-ink/40 hover:text-ink"
                >
                  ✕
                </button>
              </div>

              <div>
                <label className="text-[11px] text-ink/60">Nama Vendor</label>
                <input
                  type="text"
                  required
                  placeholder="Contoh: Sanggar Kirana MUA"
                  value={newVendorName}
                  onChange={(e) => setNewVendorName(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-ink/60">Kategori</label>
                  <select
                    value={newVendorCategory}
                    onChange={(e) => setNewVendorCategory(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  >
                    {CATEGORIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-ink/60">Status Kerjasama</label>
                  <select
                    value={newVendorStatus}
                    onChange={(e) => setNewVendorStatus(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  >
                    {Object.entries(VENDOR_STATUSES).map(([key, v]) => (
                      <option key={key} value={key}>
                        {v.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-[11px] text-ink/60">Penawaran Harga (Rp)</label>
                  <input
                    type="number"
                    placeholder="15000000"
                    value={newVendorPrice}
                    onChange={(e) => setNewVendorPrice(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  />
                </div>
                <div>
                  <label className="text-[11px] text-ink/60">DP Terbayar (Rp)</label>
                  <input
                    type="number"
                    placeholder="5000000"
                    value={newVendorDp}
                    onChange={(e) => setNewVendorDp(e.target.value)}
                    className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="text-[11px] text-ink/60">Kontak (WhatsApp / IG)</label>
                <input
                  type="text"
                  placeholder="0812-xxxx-xxxx atau @instagram"
                  value={newVendorContact}
                  onChange={(e) => setNewVendorContact(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                />
              </div>

              <div>
                <label className="text-[11px] text-ink/60">Catatan & Inklusi Paket</label>
                <textarea
                  rows={2}
                  placeholder="Misal: Termasuk kebaya akad + resepsi, touch up 2x, melati asli"
                  value={newVendorNotes}
                  onChange={(e) => setNewVendorNotes(e.target.value)}
                  className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
                />
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-plum py-2.5 text-xs font-semibold text-ivory hover:bg-plum-dark"
              >
                Simpan Vendor
              </button>
            </form>
          )}

          {/* Category Filter Chips */}
          <div className="no-scrollbar -mx-2 flex gap-1.5 overflow-x-auto px-2 py-1">
            <button
              onClick={() => setVendorCategoryFilter("ALL")}
              className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                vendorCategoryFilter === "ALL"
                  ? "bg-plum text-ivory"
                  : "bg-white/80 text-ink/70 border border-rose/25"
              }`}
            >
              Semua ({vendors.length})
            </button>
            {CATEGORIES.map((cat) => {
              const count = vendors.filter((v) =>
                v.category.toLowerCase().includes(cat.toLowerCase())
              ).length;
              if (count === 0) return null;
              return (
                <button
                  key={cat}
                  onClick={() => setVendorCategoryFilter(cat)}
                  className={`whitespace-nowrap rounded-full px-3 py-1 text-xs font-medium transition-colors ${
                    vendorCategoryFilter === cat
                      ? "bg-plum text-ivory"
                      : "bg-white/80 text-ink/70 border border-rose/25"
                  }`}
                >
                  {cat} ({count})
                </button>
              );
            })}
          </div>

          {/* Vendors Card List */}
          <div className="space-y-3">
            {filteredVendors.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-rose/30 p-8 text-center text-xs text-ink/60">
                Belum ada vendor di kategori ini. Klik &ldquo;+ Vendor Baru&rdquo; untuk mencatat risetmu.
              </div>
            ) : (
              filteredVendors.map((vendor) => {
                const statusMeta =
                  VENDOR_STATUSES[vendor.status] || VENDOR_STATUSES.riset;
                const isSelected = compareIds.includes(vendor.id);

                return (
                  <div
                    key={vendor.id}
                    className={`rounded-2xl border p-4 shadow-sm transition-all ${
                      isSelected
                        ? "border-plum bg-white ring-2 ring-plum/20"
                        : "border-rose/25 bg-white/80 hover:border-plum/30"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-rose/15 px-2 py-0.5 text-[10px] font-semibold text-plum">
                            {vendor.category}
                          </span>
                          <span
                            className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${statusMeta.color}`}
                          >
                            {statusMeta.label}
                          </span>
                        </div>
                        <h4 className="mt-1 text-base font-bold text-plum-dark">
                          {vendor.name}
                        </h4>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => toggleCompare(vendor.id)}
                          title="Pilih untuk bandingkan"
                          className={`rounded-lg px-2 py-1 text-[11px] font-medium transition-colors ${
                            isSelected
                              ? "bg-plum text-ivory"
                              : "border border-rose/30 text-ink/60 hover:bg-rose/10"
                          }`}
                        >
                          {isSelected ? "✓ Terpilih" : "Bandingkan"}
                        </button>
                        <button
                          onClick={() => deleteVendor(vendor.id)}
                          title="Hapus vendor"
                          className="text-xs text-ink/30 hover:text-rose ml-1"
                        >
                          ✕
                        </button>
                      </div>
                    </div>

                    <div className="mt-2.5 grid grid-cols-2 gap-2 text-xs">
                      <div>
                        <span className="text-[10px] text-ink/50">Harga Penawaran:</span>
                        <p className="font-semibold text-ink">
                          {vendor.quotedPrice
                            ? `Rp ${vendor.quotedPrice.toLocaleString("id-ID")}`
                            : "Belum ada kuotasi"}
                        </p>
                      </div>
                      <div>
                        <span className="text-[10px] text-ink/50">DP Dibayar:</span>
                        <p className="font-semibold text-emerald-700">
                          {vendor.dpAmount > 0
                            ? `Rp ${vendor.dpAmount.toLocaleString("id-ID")}`
                            : "Rp 0"}
                        </p>
                      </div>
                    </div>

                    {vendor.contact && (
                      <div className="mt-2 text-xs text-ink/70 flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5" /> Kontak:{" "}
                        <span className="font-medium text-plum">{vendor.contact}</span>
                      </div>
                    )}

                    {vendor.notes && (
                      <p className="mt-2 rounded-xl bg-ivory/60 p-2.5 text-xs text-ink/70 flex items-start gap-1.5">
                        <FileEdit className="h-4 w-4 mt-px shrink-0" /> {vendor.notes}
                      </p>
                    )}

                    {/* Quick status selector */}
                    <div className="mt-3 flex items-center justify-between border-t border-rose/15 pt-2 text-xs">
                      <span className="text-[11px] text-ink/50">Ubah status:</span>
                      <select
                        value={vendor.status}
                        onChange={(e) => updateVendorStatus(vendor.id, e.target.value)}
                        className="rounded-lg border border-rose/30 bg-white px-2 py-0.5 text-xs text-ink outline-none"
                      >
                        {Object.entries(VENDOR_STATUSES).map(([key, v]) => (
                          <option key={key} value={key}>
                            {v.label}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Comparison Modal */}
          {showCompareModal && comparedVendors.length > 0 && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
              <div className="w-full max-w-lg max-h-[85vh] overflow-y-auto rounded-3xl bg-ivory p-6 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-lg font-bold text-plum-dark flex items-center gap-2">
                    <Scale className="h-5 w-5" /> Perbandingan Vendor
                  </h3>
                  <button
                    onClick={() => setShowCompareModal(false)}
                    className="text-sm text-ink/50 hover:text-ink"
                  >
                    ✕ Tutup
                  </button>
                </div>
                <p className="mt-1 text-xs text-ink/60">
                  Lihat kelebihan dan rincian harga untuk menentukan pilihan terbaik.
                </p>

                <div className="mt-5 grid grid-cols-2 gap-3">
                  {comparedVendors.map((v) => (
                    <div
                      key={v.id}
                      className="rounded-2xl border border-rose/30 bg-white p-4 space-y-2.5"
                    >
                      <div>
                        <span className="rounded-md bg-rose/15 px-2 py-0.5 text-[10px] font-semibold text-plum">
                          {v.category}
                        </span>
                        <h4 className="mt-1 text-sm font-bold text-plum-dark">
                          {v.name}
                        </h4>
                      </div>

                      <div className="border-t border-rose/10 pt-2 text-xs">
                        <span className="text-[10px] text-ink/50">Harga Penawaran</span>
                        <p className="font-bold text-plum">
                          {v.quotedPrice
                            ? `Rp ${v.quotedPrice.toLocaleString("id-ID")}`
                            : "—"}
                        </p>
                      </div>

                      <div className="text-xs">
                        <span className="text-[10px] text-ink/50">DP Minimal / Masuk</span>
                        <p className="font-semibold text-emerald-700">
                          Rp {v.dpAmount.toLocaleString("id-ID")}
                        </p>
                      </div>

                      <div className="text-xs">
                        <span className="text-[10px] text-ink/50">Kontak</span>
                        <p className="text-ink">{v.contact || "—"}</p>
                      </div>

                      <div className="rounded-xl bg-ivory/80 p-2 text-xs text-ink/70">
                        <span className="text-[10px] font-semibold text-ink/50">
                          Catatan / Fasilitas:
                        </span>
                        <p className="mt-0.5">{v.notes || "Belum ada catatan"}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
