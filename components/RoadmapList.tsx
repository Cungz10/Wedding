"use client";

import { useEffect, useState } from "react";

type Task = {
  id: string;
  title: string;
  phase: string;
  isDone: boolean;
  dueDate: string | null;
};

const PHASE_ORDER = ["H-12", "H-6", "H-3", "H-1"];

export function RoadmapList() {
  const [tasks, setTasks] = useState<Task[] | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newPhase, setNewPhase] = useState(PHASE_ORDER[0]);
  const [error, setError] = useState<string | null>(null);

  async function loadTasks() {
    const res = await fetch("/api/roadmap-tasks");
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    } else {
      setError("Gagal memuat roadmap. Pastikan kamu sudah login.");
      setTasks([]);
    }
  }

  useEffect(() => {
    loadTasks();
  }, []);

  async function handleSeed() {
    setSeeding(true);
    const res = await fetch("/api/roadmap-tasks/seed", { method: "POST" });
    setSeeding(false);
    if (res.ok) {
      const data = await res.json();
      setTasks(data.tasks);
    }
  }

  async function toggleTask(task: Task) {
    setTasks((prev) =>
      prev
        ? prev.map((t) => (t.id === task.id ? { ...t, isDone: !t.isDone } : t))
        : prev
    );
    await fetch(`/api/roadmap-tasks/${task.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isDone: !task.isDone }),
    });
  }

  async function addTask(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    const res = await fetch("/api/roadmap-tasks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle, phase: newPhase }),
    });
    if (res.ok) {
      const data = await res.json();
      setTasks((prev) => (prev ? [...prev, data.task] : [data.task]));
      setNewTitle("");
    }
  }

  if (tasks === null) {
    return <p className="mt-6 text-sm text-ink/40">Memuat...</p>;
  }

  if (error) {
    return <p className="mt-6 text-sm text-plum">{error}</p>;
  }

  if (tasks.length === 0) {
    return (
      <div className="mt-8 rounded-3xl border border-rose/30 bg-white/60 p-6 text-center">
        <p className="text-sm text-ink/60">
          Roadmap masih kosong. Mulai dari checklist standar aja biar nggak
          bingung?
        </p>
        <button
          onClick={handleSeed}
          disabled={seeding}
          className="mt-4 rounded-full bg-plum px-6 py-2.5 text-sm font-medium text-ivory hover:bg-plum-dark disabled:opacity-60"
        >
          {seeding ? "Menyiapkan..." : "Pakai Checklist Standar"}
        </button>
      </div>
    );
  }

  const grouped = PHASE_ORDER.map((phase) => ({
    phase,
    items: tasks.filter((t) => t.phase === phase),
  })).filter((g) => g.items.length > 0);

  const otherPhases = tasks.filter((t) => !PHASE_ORDER.includes(t.phase));
  const totalDone = tasks.filter((t) => t.isDone).length;

  return (
    <div className="mt-6">
      <p className="text-xs text-ink/50">
        {totalDone} / {tasks.length} tugas selesai
      </p>
      <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-rose/20">
        <div
          className="h-full bg-plum transition-all"
          style={{ width: `${tasks.length ? (totalDone / tasks.length) * 100 : 0}%` }}
        />
      </div>

      {grouped.map((group) => (
        <section key={group.phase} className="mt-7">
          <h2 className="font-display text-lg font-semibold text-plum-dark">
            {group.phase}
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {group.items.map((task) => (
              <li key={task.id}>
                <label className="flex items-center gap-3 rounded-2xl border border-rose/25 bg-white/50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => toggleTask(task)}
                    className="h-4 w-4 accent-plum"
                  />
                  <span
                    className={`text-sm ${
                      task.isDone ? "text-ink/40 line-through" : "text-ink/80"
                    }`}
                  >
                    {task.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      ))}

      {otherPhases.length > 0 && (
        <section className="mt-7">
          <h2 className="font-display text-lg font-semibold text-plum-dark">
            Lainnya
          </h2>
          <ul className="mt-2 flex flex-col gap-2">
            {otherPhases.map((task) => (
              <li key={task.id}>
                <label className="flex items-center gap-3 rounded-2xl border border-rose/25 bg-white/50 px-4 py-3">
                  <input
                    type="checkbox"
                    checked={task.isDone}
                    onChange={() => toggleTask(task)}
                    className="h-4 w-4 accent-plum"
                  />
                  <span
                    className={`text-sm ${
                      task.isDone ? "text-ink/40 line-through" : "text-ink/80"
                    }`}
                  >
                    {task.title}
                  </span>
                </label>
              </li>
            ))}
          </ul>
        </section>
      )}

      <form onSubmit={addTask} className="mt-8 flex flex-col gap-2">
        <p className="text-xs text-ink/50">Tambah tugas baru</p>
        <div className="flex gap-2">
          <input
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Contoh: Follow up katering"
            className="flex-1 rounded-2xl border border-rose/40 bg-white/50 px-4 py-2.5 text-sm text-ink outline-none focus:border-plum"
          />
          <select
            value={newPhase}
            onChange={(e) => setNewPhase(e.target.value)}
            className="rounded-2xl border border-rose/40 bg-white/50 px-3 text-sm text-ink outline-none focus:border-plum"
          >
            {PHASE_ORDER.map((p) => (
              <option key={p} value={p}>
                {p}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="self-start rounded-full bg-plum px-6 py-2 text-sm font-medium text-ivory hover:bg-plum-dark"
        >
          Tambah
        </button>
      </form>
    </div>
  );
}
