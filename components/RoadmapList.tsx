"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  phase: string;
  isDone: boolean;
  dueDate: string | null;
  notes?: string | null;
};

const PHASE_META: Record<string, { label: string; desc: string; badgeColor: string }> = {
  "H-12": {
    label: "12+ Bulan Sebelum (Fondasi)",
    desc: "Amankan konsep, sepakati plafon budget bersama keluarga, dan booking venue.",
    badgeColor: "bg-purple-100 text-purple-800 border-purple-200",
  },
  "H-6": {
    label: "6 - 12 Bulan (Vendor Inti)",
    desc: "Booking catering (test food), MUA, fotografer, WO, dan mulai MCU pranikah.",
    badgeColor: "bg-blue-100 text-blue-800 border-blue-200",
  },
  "H-3": {
    label: "3 - 6 Bulan (Detail & Berkas)",
    desc: "Fitting baju, beli cincin, urus N1-N4 kelurahan, dan bimbingan pranikah.",
    badgeColor: "bg-amber-100 text-amber-800 border-amber-200",
  },
  "H-1": {
    label: "1 - 3 Bulan (Administrasi & TM)",
    desc: "Daftar resmi KUA/Catatan Sipil, cetak undangan, pelunasan, & technical meeting.",
    badgeColor: "bg-rose/20 text-plum border-rose/30",
  },
  "Hari-H": {
    label: "H-1 Minggu & Hari-H",
    desc: "Gladi resik, briefing panitia keluarga, emergency kit, & momen sakral.",
    badgeColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
  },
  "Pasca-H": {
    label: "Pasca Hari-H",
    desc: "Pelunasan sisa vendor, follow-up album dokumentasi, & rekap keuangan.",
    badgeColor: "bg-stone-100 text-stone-800 border-stone-200",
  },
};

const PHASE_ORDER = ["H-12", "H-6", "H-3", "H-1", "Hari-H", "Pasca-H"];

export function RoadmapList() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPhase, setNewPhase] = useState(PHASE_ORDER[0]);
  const [newNotes, setNewNotes] = useState("");
  const [filterPhase, setFilterPhase] = useState<string>("ALL");
  const [filterStatus, setFilterStatus] = useState<"ALL" | "PENDING" | "DONE">("ALL");
  const [editingNoteId, setEditingNoteId] = useState<string | null>(null);
  const [tempNote, setTempNote] = useState("");
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    try {
      const res = await fetch("/api/roadmap-tasks");
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      } else {
        setError("Gagal memuat roadmap. Silakan refresh halaman.");
        setTasks([]);
      }
    } catch {
      setError("Terjadi kesalahan jaringan.");
      setTasks([]);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    try {
      const res = await fetch("/api/roadmap-tasks/seed", { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setTasks(data.tasks);
      }
    } finally {
      setSeeding(false);
    }
  }

  async function toggleTask(task: Task) {
    const nextStatus = !task.isDone;
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === task.id ? { ...t, isDone: nextStatus } : t)) : prev
    );
    await fetch(`/api/roadmap-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: nextStatus }),
    });
  }

  async function deleteTask(id: string) {
    setTasks((prev) => (prev ? prev.filter((t) => t.id !== id) : prev));
    await fetch(`/api/roadmap-tasks/${id}`, { method: "DELETE" });
  }

  async function saveTaskNote(id: string) {
    setTasks((prev) =>
      prev ? prev.map((t) => (t.id === id ? { ...t, notes: tempNote } : t)) : prev
    );
    setEditingNoteId(null);
    await fetch(`/api/roadmap-tasks/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes: tempNote }),
    });
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/roadmap-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: newTitle.trim(),
        phase: newPhase,
        notes: newNotes.trim() || undefined,
      }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => (prev ? [...prev, data.task] : [data.task]));
      setNewTitle("");
      setNewNotes("");
    }
  }

  if (tasks === null) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return <p className="mt-6 text-sm text-plum">{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-rose/30 bg-white/70 p-6 text-center shadow-sm">
        <span className="text-3xl">📋</span>
        <h3 className="mt-2 font-display text-lg font-semibold text-plum-dark">
          Roadmap Belum Ada
        </h3>
        <p className="mt-1 text-xs text-ink/60 max-w-xs mx-auto">
          Mulai langsung dari template persiapan pernikahan standar Indonesia agar kamu dan pasangan gak bingung langkah mana yang harus dikerjain duluan.
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="mt-4 rounded-full bg-plum px-6 py-2.5 text-xs font-semibold text-ivory hover:bg-plum-dark disabled:opacity-60 shadow-sm"
        >
          {seeding ? "Menyiapkan Roadmap..." : "✨ Muat Roadmap Lengkap (Indonesia)"}
        </button>
      </div>
    );
  }

  const completedCount = tasks.filter((t) => t.isDone).length;
  const progressPercent = Math.round((completedCount / tasks.length) * 100);

  // Filter tasks
  const filteredTasks = tasks.filter((t) => {
    if (filterPhase !== "ALL" && t.phase !== filterPhase) return false;
    if (filterStatus === "PENDING" && t.isDone) return false;
    if (filterStatus === "DONE" && !t.isDone) return false;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Overview Progress Card */}
      <section className="rounded-3xl border border-rose/30 bg-gradient-to-br from-white/90 via-ivory to-rose/10 p-5 shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-rose">
              Timeline Dinamis
            </span>
            <h2 className="font-display text-xl font-bold text-plum-dark">
              Roadmap Nol ke Nikah
            </h2>
          </div>
          <span className="rounded-full bg-rose/20 px-3 py-1 text-xs font-semibold text-plum">
            {completedCount} / {tasks.length} Selesai ({progressPercent}%)
          </span>
        </div>

        <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-rose/20">
          <div
            className="h-full rounded-full bg-plum transition-all duration-500"
            style={{ width: `${progressPercent}%` }}
          />
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {/* Status Filter buttons */}
          <button
            onClick={() => setFilterStatus("ALL")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              filterStatus === "ALL"
                ? "bg-plum text-ivory shadow-sm"
                : "bg-white/80 text-ink/70 border border-rose/20"
            }`}
          >
            Semua Status
          </button>
          <button
            onClick={() => setFilterStatus("PENDING")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              filterStatus === "PENDING"
                ? "bg-plum text-ivory shadow-sm"
                : "bg-white/80 text-ink/70 border border-rose/20"
            }`}
          >
            Belum Selesai ({tasks.length - completedCount})
          </button>
          <button
            onClick={() => setFilterStatus("DONE")}
            className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
              filterStatus === "DONE"
                ? "bg-plum text-ivory shadow-sm"
                : "bg-white/80 text-ink/70 border border-rose/20"
            }`}
          >
            Sudah Selesai ({completedCount})
          </button>
        </div>
      </section>

      {/* Phase Pills filter */}
      <div className="no-scrollbar -mx-2 flex gap-1.5 overflow-x-auto px-2 py-1">
        <button
          onClick={() => setFilterPhase("ALL")}
          className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
            filterPhase === "ALL"
              ? "bg-plum-dark text-ivory"
              : "bg-white/70 text-ink/70 border border-rose/25 hover:bg-white"
          }`}
        >
          Semua Fase
        </button>
        {PHASE_ORDER.map((phase) => (
          <button
            key={phase}
            onClick={() => setFilterPhase(phase)}
            className={`whitespace-nowrap rounded-full px-3.5 py-1 text-xs font-medium transition-colors ${
              filterPhase === phase
                ? "bg-plum-dark text-ivory"
                : "bg-white/70 text-ink/70 border border-rose/25 hover:bg-white"
            }`}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* Task list by phase */}
      <div className="space-y-6">
        {PHASE_ORDER.map((phase) => {
          const phaseTasks = filteredTasks.filter((t) => t.phase === phase);
          if (phaseTasks.length === 0 && filterPhase !== "ALL") return null;
          if (phaseTasks.length === 0) return null;

          const meta = PHASE_META[phase] || {
            label: phase,
            desc: "",
            badgeColor: "bg-gray-100 text-gray-800",
          };

          return (
            <section key={phase} className="rounded-3xl border border-rose/30 bg-white/80 p-5 shadow-sm">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span
                      className={`rounded-md border px-2 py-0.5 text-[11px] font-bold ${meta.badgeColor}`}
                    >
                      {phase}
                    </span>
                    <h3 className="font-display text-base font-bold text-plum-dark">
                      {meta.label}
                    </h3>
                  </div>
                  {meta.desc && (
                    <p className="mt-1 text-xs text-ink/60">{meta.desc}</p>
                  )}
                </div>
                <span className="text-[11px] text-ink/40">
                  {phaseTasks.filter((t) => t.isDone).length}/{phaseTasks.length}
                </span>
              </div>

              <div className="mt-4 space-y-2.5">
                {phaseTasks.map((task) => (
                  <div
                    key={task.id}
                    className={`group rounded-2xl border p-3.5 transition-all ${
                      task.isDone
                        ? "border-rose/10 bg-ivory/30 opacity-70"
                        : "border-rose/25 bg-white hover:border-plum/40 hover:shadow-sm"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={task.isDone}
                        onChange={() => toggleTask(task)}
                        className="mt-1 h-4 w-4 rounded border-rose/50 text-plum focus:ring-plum cursor-pointer"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between">
                          <p
                            className={`text-sm font-medium ${
                              task.isDone
                                ? "text-ink/40 line-through"
                                : "text-ink group-hover:text-plum"
                            }`}
                          >
                            {task.title}
                          </p>
                          <button
                            onClick={() => deleteTask(task.id)}
                            title="Hapus tugas"
                            className="opacity-0 group-hover:opacity-100 text-[11px] text-rose hover:text-plum transition-opacity ml-2"
                          >
                            ✕
                          </button>
                        </div>

                        {/* Notes section */}
                        {editingNoteId === task.id ? (
                          <div className="mt-2 flex items-center gap-2">
                            <input
                              type="text"
                              value={tempNote}
                              onChange={(e) => setTempNote(e.target.value)}
                              placeholder="Tambah catatan/vendor/kontak..."
                              className="w-full rounded-xl border border-rose/30 bg-ivory/60 px-2.5 py-1 text-xs text-ink outline-none"
                            />
                            <button
                              onClick={() => saveTaskNote(task.id)}
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
                          <div className="mt-1.5 flex items-center justify-between">
                            {task.notes ? (
                              <p
                                onClick={() => {
                                  setEditingNoteId(task.id);
                                  setTempNote(task.notes || "");
                                }}
                                className="cursor-pointer text-xs text-ink/60 hover:text-plum line-clamp-1"
                              >
                                📝 {task.notes}
                              </p>
                            ) : (
                              <button
                                onClick={() => {
                                  setEditingNoteId(task.id);
                                  setTempNote("");
                                }}
                                className="text-[11px] text-rose hover:text-plum font-medium"
                              >
                                + Tambah catatan
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          );
        })}
      </div>

      {/* Add Custom Task Form */}
      <section className="rounded-3xl border border-rose/30 bg-white/80 p-5 shadow-sm">
        <h3 className="font-display text-base font-bold text-plum-dark">
          + Tambah Checklist Kustom
        </h3>
        <p className="mt-0.5 text-xs text-ink/60">
          Ada tugas adat khusus keluarga atau janji temu yang mau dicatat?
        </p>

        <form onSubmit={addTask} className="mt-3 space-y-2.5">
          <input
            type="text"
            required
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: Beli bahan seragam keluarga besar"
            className="w-full rounded-2xl border border-rose/30 bg-white px-3.5 py-2.5 text-xs text-ink outline-none focus:border-plum"
          />

          <div className="flex gap-2">
            <select
              value={newPhase}
              onChange={(e) => setNewPhase(e.target.value)}
              className="rounded-2xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
            >
              {PHASE_ORDER.map((p) => (
                <option key={p} value={p}>
                  Fase: {p} ({PHASE_META[p]?.label.split("(")[0]})
                </option>
              ))}
            </select>
            <input
              type="text"
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
              placeholder="Catatan opsional (misal: budget, toko, kontak)"
              className="flex-1 rounded-2xl border border-rose/30 bg-white px-3 py-2 text-xs text-ink outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full rounded-2xl bg-plum py-2.5 text-xs font-semibold text-ivory hover:bg-plum-dark transition-colors"
          >
            Simpan Tugas ke Roadmap
          </button>
        </form>
      </section>
    </div>
  );
}
