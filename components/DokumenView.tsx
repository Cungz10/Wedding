"use client";

import { useEffect, useState } from "react";

type DocItem = {
  id: string;
  type: string;
  status: string;
  note: string | null;
  deadlineDays: number;
};

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; badge: string }
> = {
  pending: {
    label: "Belum Siap",
    color: "text-amber-700 bg-amber-50 border-amber-200",
    badge: "⏳",
  },
  ready: {
    label: "Siap di Map",
    color: "text-blue-700 bg-blue-50 border-blue-200",
    badge: "📁",
  },
  verified: {
    label: "Terverifikasi Resmi",
    color: "text-emerald-700 bg-emerald-50 border-emerald-200",
    badge: "✓",
  },
};

export function DokumenView() {
  const [docs, setDocs] = useState<DocItem[]>([]);
  const [religion, setReligion] = useState("Islam (KUA)");
  const [loading, setLoading] = useState(true);
  const [showGuide, setShowGuide] = useState(false);
  const [showAddDoc, setShowAddDoc] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newNote, setNewNote] = useState("");
  const [newDeadline, setNewDeadline] = useState("30");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");

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

        const [pRes, dRes] = await Promise.all([
          safeJson("/api/wedding-plan"),
          safeJson("/api/documents"),
        ]);

        if (pRes?.weddingPlan?.religion) {
          setReligion(pRes.weddingPlan.religion);
        }
        if (dRes?.documents) {
          setDocs(dRes.documents);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  async function updateStatus(id: string, nextStatus: string) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: nextStatus } : d))
    );
    await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status: nextStatus }),
    });
  }

  async function saveDocNote(id: string) {
    setDocs((prev) =>
      prev.map((d) => (d.id === id ? { ...d, note: tempNote } : d))
    );
    setEditingNoteId(null);
    await fetch("/api/documents", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, note: tempNote }),
    });
  }

  async function handleAddDoc(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        type: newTitle.trim(),
        note: newNote.trim() || undefined,
        deadlineDays: Number(newDeadline) || 30,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setDocs((prev) => [...prev, data.document]);
      setNewTitle("");
      setNewNote("");
      setShowAddDoc(false);
    }
  }

  async function handleSeedDocs() {
    const res = await fetch("/api/documents", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "seed_checklist" }),
    });
    if (res.ok) {
      const data = await res.json();
      setDocs(data.documents);
    }
  }

  async function deleteDoc(id: string) {
    setDocs((prev) => prev.filter((d) => d.id !== id));
    await fetch(`/api/documents?id=${id}`, { method: "DELETE" });
  }

  const verifiedCount = docs.filter(
    (d) => d.status === "verified" || d.status === "ready"
  ).length;
  const progressPercent = docs.length > 0 ? Math.round((verifiedCount / docs.length) * 100) : 0;

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <section className="rounded-3xl border border-rose/30 bg-gradient-to-br from-white/90 via-ivory to-rose/10 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose">
              Legalitas & Administrasi
            </span>
            <h2 className="font-display text-xl font-bold text-plum-dark">
              Checklist Berkas Nikah
            </h2>
          </div>
          <span className="rounded-full bg-rose/20 px-3 py-1 text-xs font-semibold text-plum">
            {verifiedCount} / {docs.length} Siap ({progressPercent}%)
          </span>
        </div>

        <p className="mt-1 text-xs text-ink/60">
          Target jalur: <strong className="text-plum">{religion}</strong>. Semua dokumen wajib terkumpul sebelum batas pendaftaran resmi.
        </p>

        {/* Progress bar */}
        <div className="mt-3.5 h-2 w-full overflow-hidden rounded-full bg-rose/20">
          <div
            className="h-full rounded-full bg-plum transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4 flex gap-2">
          <button
            onClick={() => setShowGuide(!showGuide)}
            className="flex-1 rounded-xl border border-plum/30 bg-white/80 py-2 text-xs font-semibold text-plum hover:bg-plum/10 transition-colors"
          >
            {showGuide ? "✕ Sembunyikan Alur Birokrasi" : "🗺️ Lihat Urutan Alur Birokrasi"}
          </button>
          <button
            onClick={() => setShowAddDoc(true)}
            className="rounded-xl bg-plum px-4 py-2 text-xs font-semibold text-ivory hover:bg-plum-dark transition-colors"
          >
            + Dokumen Kustom
          </button>
        </div>
      </section>

      {/* Guide Alur Birokrasi Pernikahan Indonesia */}
      {showGuide && (
        <section className="rounded-3xl border border-plum/30 bg-white/95 p-5 shadow-md space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-plum-dark">
              📖 Urutan Resmi Pengurusan Berkas (Anti-Bingung)
            </h3>
            <button
              onClick={() => setShowGuide(false)}
              className="text-xs text-ink/40 hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div className="space-y-3 text-xs text-ink/80">
            <div className="flex gap-3 rounded-2xl bg-ivory/60 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum text-xs font-bold text-ivory">
                1
              </span>
              <div>
                <strong className="text-plum-dark">Langkah 1: RT / RW Setempat</strong>
                <p className="mt-0.5 text-ink/60">
                  Kedua calon pengantin minta <strong>Surat Pengantar Nikah</strong> dari Ketua RT dan RW masing-masing domisili KTP. Bawa fotokopi KTP & KK.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-ivory/60 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum text-xs font-bold text-ivory">
                2
              </span>
              <div>
                <strong className="text-plum-dark">Langkah 2: Kelurahan / Desa (Formulir N1 - N4)</strong>
                <p className="mt-0.5 text-ink/60">
                  Bawa surat RT/RW ke Kelurahan. Petugas kelurahan akan menerbitkan Form N1 (Pengantar Nikah), N2 (Keterangan Asal-usul), dan N4 (Izin Orang Tua).
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-ivory/60 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum text-xs font-bold text-ivory">
                3
              </span>
              <div>
                <strong className="text-plum-dark">Langkah 3: Puskesmas (MCU & Elsimil)</strong>
                <p className="mt-0.5 text-ink/60">
                  Pemeriksaan kesehatan pranikah (tes HB, golongan darah) dan suntik Tetanus Toksoid (TT) untuk calon wanita, serta sertifikat aplikasi Elsimil BKKBN.
                </p>
              </div>
            </div>

            <div className="flex gap-3 rounded-2xl bg-ivory/60 p-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-plum text-xs font-bold text-ivory">
                4
              </span>
              <div>
                <strong className="text-plum-dark">Langkah 4: KUA (Islam) / Catatan Sipil Disdukcapil</strong>
                <p className="mt-0.5 text-ink/60">
                  Daftar online di SIMKAH (simkah4.kemenag.go.id) paling lambat <strong>10 hari kerja sebelum akad</strong>. Jika akad di luar kantor KUA atau hari libur, bayar PNBP Rp 600.000 via bank persepsi.
                </p>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Add Custom Document Modal */}
      {showAddDoc && (
        <form
          onSubmit={handleAddDoc}
          className="rounded-3xl border border-rose/40 bg-white/95 p-5 shadow-md space-y-3"
        >
          <div className="flex items-center justify-between">
            <h4 className="font-display text-sm font-bold text-plum-dark">
              Tambah Dokumen Baru
            </h4>
            <button
              type="button"
              onClick={() => setShowAddDoc(false)}
              className="text-xs text-ink/40 hover:text-ink"
            >
              ✕
            </button>
          </div>

          <div>
            <label className="text-[11px] text-ink/60">Nama Dokumen</label>
            <input
              type="text"
              required
              placeholder="Contoh: Akta Perjanjian Pranikah Notaris"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-[11px] text-ink/60">Batas Waktu (H- berapa hari)</label>
              <input
                type="number"
                value={newDeadline}
                onChange={(e) => setNewDeadline(e.target.value)}
                placeholder="30"
                className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
              />
            </div>
            <div>
              <label className="text-[11px] text-ink/60">Catatan Tambahan</label>
              <input
                type="text"
                placeholder="Disimpan di map merah"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                className="mt-1 w-full rounded-xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-xl bg-plum py-2.5 text-xs font-semibold text-ivory hover:bg-plum-dark"
          >
            Simpan Dokumen
          </button>
        </form>
      )}

      {/* Checklist items list */}
      <div className="space-y-3">
        {docs.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-rose/30 p-8 text-center">
            <p className="text-xs text-ink/60">
              Checklist dokumen belum dimuat.
            </p>
            <button
              onClick={handleSeedDocs}
              className="mt-3 rounded-full bg-plum px-5 py-2 text-xs font-medium text-ivory hover:bg-plum-dark"
            >
              Muat Dokumen Wajib Indonesia
            </button>
          </div>
        ) : (
          docs.map((item) => {
            const statusMeta = STATUS_CONFIG[item.status] || STATUS_CONFIG.pending;

            return (
              <div
                key={item.id}
                className="rounded-2xl border border-rose/25 bg-white/80 p-4 shadow-sm transition-all hover:border-plum/30"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs">{statusMeta.badge}</span>
                      <h4 className="text-sm font-bold text-ink">
                        {item.type}
                      </h4>
                    </div>

                    {item.deadlineDays && (
                      <span className="mt-1 inline-block rounded-md bg-rose/10 px-2 py-0.5 text-[10px] font-semibold text-plum">
                        Batas Target: Maksimal H-{item.deadlineDays} Hari
                      </span>
                    )}
                  </div>

                  <button
                    onClick={() => deleteDoc(item.id)}
                    title="Hapus dokumen"
                    className="text-xs text-ink/30 hover:text-rose ml-2"
                  >
                    ✕
                  </button>
                </div>

                {/* Notes section */}
                {editingNoteId === item.id ? (
                  <div className="mt-2.5 flex items-center gap-2">
                    <input
                      type="text"
                      value={tempNote}
                      onChange={(e) => setTempNote(e.target.value)}
                      placeholder="Tambah catatan berkas (misal: dipegang Papa)..."
                      className="w-full rounded-xl border border-rose/30 bg-ivory/60 px-2.5 py-1 text-xs text-ink outline-none"
                    />
                    <button
                      onClick={() => saveDocNote(item.id)}
                      className="rounded-lg bg-plum px-2.5 py-1 text-xs text-ivory font-medium"
                    >
                      Simpan
                    </button>
                    <button
                      onClick={() => setEditingNoteId(null)}
                      className="text-xs text-ink/40 hover:text-ink"
                    >
                      Batal
                    </button>
                  </div>
                ) : (
                  <div className="mt-2 flex items-center justify-between text-xs">
                    {item.note ? (
                      <p
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setTempNote(item.note || "");
                        }}
                        className="cursor-pointer text-ink/60 hover:text-plum line-clamp-1"
                      >
                        📌 {item.note}
                      </p>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingNoteId(item.id);
                          setTempNote("");
                        }}
                        className="text-[11px] text-rose hover:text-plum font-medium"
                      >
                        + Tambah lokasi berkas/catatan
                      </button>
                    )}
                  </div>
                )}

                {/* Status selector buttons */}
                <div className="mt-3 flex items-center justify-between border-t border-rose/10 pt-2.5">
                  <span className="text-[11px] text-ink/50">Status berkas:</span>
                  <div className="flex gap-1.5">
                    {Object.entries(STATUS_CONFIG).map(([key, cfg]) => (
                      <button
                        key={key}
                        onClick={() => updateStatus(item.id, key)}
                        className={`rounded-lg px-2 py-1 text-[10px] font-semibold transition-all ${
                          item.status === key
                            ? cfg.color + " ring-1 ring-plum/20 shadow-xs"
                            : "bg-ivory/80 text-ink/50 hover:bg-rose/10"
                        }`}
                      >
                        {cfg.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reset Checklist template button */}
      <div className="border-t border-rose/20 pt-4 text-center">
        <button
          onClick={handleSeedDocs}
          className="text-xs font-medium text-rose hover:text-plum underline"
        >
          Reset ulang ke checklist dokumen standar KUA / Catatan Sipil
        </button>
      </div>
    </div>
  );
}
