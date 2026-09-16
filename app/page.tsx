import Link from "next/link";

export default function HomePage() {
  return (
    <main className="mx-auto flex min-h-screen max-w-md flex-col justify-between px-6 py-12 text-center bg-ivory">
      <div>
        <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-2xl bg-rose/20 text-2xl">
          💍
        </div>
        <span className="mb-2 inline-block text-xs font-semibold uppercase tracking-widest text-rose">
          Platform Persiapan Pernikahan
        </span>
        <h1 className="font-display text-4xl font-bold text-plum-dark">
          Nol ke Nikah
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-ink/70">
          Bingung mulai dari mana? Kami pandu kamu dan pasangan, langkah demi langkah dari status <em>&ldquo;belum ada rencana sama sekali&rdquo;</em> sampai hari-H selesai.
        </p>

        {/* Feature highlight badges */}
        <div className="mt-8 space-y-2.5 text-left text-xs">
          <div className="flex items-center gap-3 rounded-2xl border border-rose/25 bg-white/70 p-3 shadow-2xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-purple-100 text-sm">
              🗺️
            </span>
            <div>
              <p className="font-semibold text-plum-dark">Roadmap Dinamis</p>
              <p className="text-[11px] text-ink/60">Tahu apa yang harus dikerjain minggu ini.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose/25 bg-white/70 p-3 shadow-2xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-amber-100 text-sm">
              💰
            </span>
            <div>
              <p className="font-semibold text-plum-dark">Budget & Tracking Vendor</p>
              <p className="text-[11px] text-ink/60">Alokasi biaya terarah, gak takut boncos.</p>
            </div>
          </div>

          <div className="flex items-center gap-3 rounded-2xl border border-rose/25 bg-white/70 p-3 shadow-2xs">
            <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-blue-100 text-sm">
              📑
            </span>
            <div>
              <p className="font-semibold text-plum-dark">Checklist Legalitas KUA & Sipil</p>
              <p className="text-[11px] text-ink/60">Urutan birokrasi RT/RW, Kelurahan, & KUA.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-10 flex flex-col gap-3">
        <Link
          href="/dashboard"
          className="rounded-full bg-plum py-3.5 text-xs font-bold text-ivory shadow-sm transition-all hover:bg-plum-dark"
        >
          Masuk ke Dashboard Rencana →
        </Link>

        <Link
          href="/onboarding"
          className="rounded-full border border-rose/40 bg-white py-3 text-xs font-semibold text-plum transition-all hover:bg-rose/10"
        >
          Mulai Rencana Baru (Onboarding)
        </Link>

        <div className="flex justify-center gap-4 text-xs text-ink/50 pt-2">
          <Link href="/login" className="hover:text-plum font-medium">
            Masuk Akun
          </Link>
          <span>•</span>
          <Link href="/register" className="hover:text-plum font-medium">
            Daftar Baru
          </Link>
        </div>
      </div>
    </main>
  );
}

