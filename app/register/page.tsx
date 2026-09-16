import { RegisterForm } from "@/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-8 py-10">
      <span className="mb-3 h-px w-10 bg-gold" aria-hidden />
      <h1 className="font-display text-3xl font-semibold text-plum-dark">
        Mulai rencanakan bareng
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Buat akun buat mulai nyusun rencana pernikahanmu.
      </p>
      <div className="mt-8">
        <RegisterForm />
      </div>
    </main>
  );
}
