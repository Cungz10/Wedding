export default function DashboardPage() {
  return (
    <main className="px-6 pt-10">
      <p className="text-xs uppercase tracking-wide text-rose">Beranda</p>
      <h1 className="mt-1 font-display text-2xl font-semibold text-plum-dark">
        Halo, calon pengantin 👋
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Ini ringkasan persiapan pernikahanmu sejauh ini.
      </p>

      <section className="mt-8 rounded-3xl border border-rose/30 bg-white/60 p-5">
        <p className="text-xs text-ink/50">Health Finansial</p>
        <p className="mt-1 font-display text-3xl text-plum">—</p>
        <p className="mt-1 text-xs text-ink/40">
          Dihitung otomatis dari catatan budget
        </p>
      </section>
    </main>
  );
}
