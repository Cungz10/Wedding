import { LoginForm } from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen flex-col justify-center px-8 py-10">
      <span className="mb-3 h-px w-10 bg-gold" aria-hidden />
      <h1 className="font-display text-3xl font-semibold text-plum-dark">
        Selamat datang kembali
      </h1>
      <p className="mt-2 text-sm text-ink/60">
        Masuk buat lanjutin rencana pernikahanmu.
      </p>
      <div className="mt-8">
        <LoginForm />
      </div>
    </main>
  );
}
