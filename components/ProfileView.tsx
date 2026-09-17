"use client";

import { useEffect, useState } from "react";
import { signOut } from "next-auth/react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Input, Select } from "@/components/ui/Input";
import { Mail } from "lucide-react";

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
  "Modern Adat Sunda",
  "Adat Jawa",
  "Adat Minang",
  "Nasional / Modern Elegan",
  "Intimate Garden / Rustic",
];

const RELIGIONS = [
  "Islam (KUA)",
  "Kristen (Catatan Sipil)",
  "Katolik",
  "Hindu / Buddha / Lainnya",
];

type Collaborator = {
  id: string;
  invitedEmail: string;
  role: string;
  status: string;
};

export function ProfileView() {
  const [ownerName, setOwnerName] = useState<string | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [collaborators, setCollaborators] = useState<Collaborator[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: "success" | "error" } | null>(null);
  const [form, setForm] = useState<FormState>({
    partnerName: "",
    weddingDate: "",
    venueCity: "",
    concept: CONCEPTS[0],
    budgetTotal: "",
    guestCount: "",
    religion: RELIGIONS[0],
  });

  useEffect(() => {
    async function load() {
      try {
        const [resPlan, resCollab] = await Promise.all([
          fetch("/api/wedding-plan").then((r) => r.json().catch(() => null)),
          fetch("/api/collaborators").then((r) => r.json().catch(() => null)),
        ]);

        if (resPlan?.ownerName) setOwnerName(resPlan.ownerName);
        if (resPlan?.userEmail) setUserEmail(resPlan.userEmail);
        
        if (resPlan?.weddingPlan) {
          const wp = resPlan.weddingPlan;
          setForm({
            partnerName: wp.partnerName || "",
            weddingDate: wp.weddingDate ? new Date(wp.weddingDate).toISOString().split("T")[0] : "",
            venueCity: wp.venueCity || "",
            concept: wp.concept || CONCEPTS[0],
            budgetTotal: wp.budgetTotal ? String(wp.budgetTotal) : "",
            guestCount: wp.guestCount ? String(wp.guestCount) : "",
            religion: wp.religion || RELIGIONS[0],
          });
        }

        if (resCollab?.collaborators) {
          setCollaborators(resCollab.collaborators);
        }
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  function update<K extends keyof FormState>(key: K, value: FormState[K]) {
    setForm((prev) => ({ ...prev, [key]: value }));
  }

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      const res = await fetch("/api/wedding-plan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (res.ok) {
        setMessage({ text: "Berhasil menyimpan perubahan profil!", type: "success" });
      } else {
        const data = await res.json().catch(() => null);
        setMessage({ text: data?.error || "Gagal menyimpan", type: "error" });
      }
    } catch {
      setMessage({ text: "Terjadi kesalahan jaringan", type: "error" });
    } finally {
      setSaving(false);
    }
  }

  async function handleDeleteCollaborator(id: string) {
    if (!confirm("Cabut akses kolaborator ini?")) return;
    setCollaborators((prev) => prev.filter((c) => c.id !== id));
    await fetch(`/api/collaborators?id=${id}`, { method: "DELETE" });
  }

  if (loading) {
    return (
      <div className="flex min-h-[40vh] items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-rose border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card variant="highlight" className="p-5 text-center relative overflow-hidden">
        <div className="absolute top-4 right-4">
           <Button
            variant="outline"
            size="sm"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="border-rose/40 bg-white/50 text-[10px]"
          >
            Log Out
          </Button>
        </div>
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border-4 border-white bg-plum text-2xl font-bold text-ivory shadow-sm">
          {ownerName ? ownerName[0].toUpperCase() : "?"}
        </div>
        <h2 className="mt-3 font-display text-xl font-bold text-plum-dark">
          {ownerName ?? "Pengguna"}
        </h2>
        {userEmail && (
          <p className="mt-1 text-xs text-ink/80 font-medium flex items-center justify-center gap-1.5">
            <Mail className="h-3.5 w-3.5" /> {userEmail}
          </p>
        )}
      </Card>

      {/* Team Management */}
      <Card variant="solid" className="p-5">
        <h3 className="font-display text-lg font-bold text-plum-dark mb-4">
          Manajemen Tim & Kolaborator
        </h3>
        {collaborators.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-rose/30 bg-ivory/40 p-4 text-center text-xs text-ink/60">
            Belum ada tim. Undang pasangan atau WO lewat halaman Dashboard.
          </div>
        ) : (
          <div className="space-y-2.5">
            {collaborators.map((c) => (
              <div key={c.id} className="flex items-center justify-between rounded-xl border border-rose/20 bg-ivory/50 p-3 shadow-2xs">
                <div>
                  <p className="text-xs font-semibold text-ink">{c.invitedEmail}</p>
                  <div className="mt-1 flex items-center gap-2">
                    <span className="text-[10px] text-plum font-medium">Peran: {c.role}</span>
                    <Badge variant={c.status === "accepted" ? "success" : "warning"}>
                      {c.status === "accepted" ? "Bergabung" : "Pending"}
                    </Badge>
                  </div>
                </div>
                <button
                  onClick={() => handleDeleteCollaborator(c.id)}
                  title="Cabut Akses"
                  className="text-xs text-rose hover:text-plum font-bold px-2 py-1 transition-colors"
                >
                  ✕
                </button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card variant="solid" className="p-5">
        <h3 className="font-display text-lg font-bold text-plum-dark mb-4">
          Detail Rencana Pernikahan
        </h3>
        
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Nama Pasangan"
            value={form.partnerName}
            onChange={(e) => update("partnerName", e.target.value)}
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              type="date"
              label="Tanggal Acara"
              value={form.weddingDate}
              onChange={(e) => update("weddingDate", e.target.value)}
            />
            <Input
              type="text"
              label="Kota Venue"
              value={form.venueCity}
              onChange={(e) => update("venueCity", e.target.value)}
              placeholder="Contoh: Bandung"
            />
          </div>

          <Select
            label="Konsep / Adat"
            value={form.concept}
            onChange={(e) => update("concept", e.target.value)}
            options={CONCEPTS.map(c => ({ label: c, value: c }))}
          />

          <Select
            label="Jalur Agama / Sipil"
            value={form.religion}
            onChange={(e) => update("religion", e.target.value)}
            options={RELIGIONS.map(r => ({ label: r, value: r }))}
          />

          <div className="grid grid-cols-2 gap-3">
             <Input
                type="number"
                label="Total Budget (Rp)"
                value={form.budgetTotal}
                onChange={(e) => update("budgetTotal", e.target.value)}
              />
             <Input
                type="number"
                label="Jumlah Tamu"
                value={form.guestCount}
                onChange={(e) => update("guestCount", e.target.value)}
              />
          </div>

          {message && (
            <div className={`rounded-xl p-3 text-xs font-medium ${
              message.type === "success" ? "bg-emerald-50 text-emerald-700" : "bg-rose-50 text-rose-700"
            }`}>
              {message.text}
            </div>
          )}

          <Button
            type="submit"
            size="lg"
            className="w-full mt-2"
            disabled={saving}
          >
            {saving ? "Menyimpan..." : "Simpan Perubahan"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
