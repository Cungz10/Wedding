import Link from "next/link";

export default function HomePage() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-8 text-center">
      <span className="mb-3 h-px w-10 bg-gold" aria-hidden />
      <h1 className="font-display text-4xl font-semibold text-plum-dark">
        Nol ke Nikah
      </h1>
      <p className="mt-3 max-w-xs text-sm leading-relaxed text-ink/70">
        Bingung mulai dari mana buat nikah? Kita temenin, satu langkah
        demi satu langkah.
      </p>
      <Link
        href="/onboarding"
        className="mt-8 rounded-full bg-plum px-8 py-3 text-sm font-medium text-ivory transition-colors hover:bg-plum-dark"
      >
        Mulai Rencanakan
      </Link>
    </main>
  );
}
