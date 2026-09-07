import type { Metadata } from "next";

export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false } };

export default async function Connexion({
  searchParams,
}: {
  searchParams: Promise<{ e?: string }>;
}) {
  const { e } = await searchParams;
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-md flex-col justify-center px-6 py-16">
      <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#1B2E78]">
        Tableau de bord des demandes
      </h1>
      <p className="mt-2 text-sm text-[#5A6479]">
        Accès réservé à l&apos;équipe EPUREAU Côte d&apos;Ivoire.
      </p>
      <form action="/api/admin/login" method="post" className="mt-6 grid gap-3">
        <input
          type="password"
          name="motdepasse"
          required
          autoFocus
          placeholder="Mot de passe"
          className="w-full rounded-[10px] border border-[#E3EAF3] bg-[#F4F7FB] px-4 py-3 text-sm outline-none focus:border-[#1AB5E8]"
        />
        <button
          type="submit"
          className="rounded-full bg-[#1AB5E8] px-6 py-3 font-[family-name:var(--font-display)] text-sm font-semibold text-[#06122B]"
        >
          Se connecter
        </button>
      </form>
      {e === "1" && <p className="mt-4 text-sm text-[#B4232A]">Mot de passe incorrect.</p>}
      {e === "config" && (
        <p className="mt-4 text-sm text-[#B4232A]">
          La variable ADMIN_PASSWORD n&apos;est pas encore définie sur l&apos;hébergement.
        </p>
      )}
    </div>
  );
}
