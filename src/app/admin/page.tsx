import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { assurerSchema, type Demande } from "@/lib/db";
import { estConnecte } from "@/lib/auth";

export const metadata: Metadata = { title: "Tableau de bord", robots: { index: false } };
export const dynamic = "force-dynamic";

async function changerStatut(formData: FormData) {
  "use server";
  if (!(await estConnecte())) return;
  const id = Number(formData.get("id"));
  const statut = String(formData.get("statut"));
  const sql = await assurerSchema();
  if (!sql || !Number.isFinite(id)) return;
  await sql`update demandes set statut = ${statut} where id = ${id}`;
  revalidatePath("/admin");
}

const STATUTS: Record<string, { libelle: string; classe: string }> = {
  nouvelle: { libelle: "Nouvelle", classe: "bg-[#1AB5E8]/15 text-[#106f8f]" },
  en_cours: { libelle: "En cours", classe: "bg-[#F0B429]/20 text-[#8a6100]" },
  traitee: { libelle: "Traitée", classe: "bg-[#2BB673]/15 text-[#1a7048]" },
};

export default async function TableauDeBord() {
  if (!(await estConnecte())) redirect("/admin/login");

  const sql = await assurerSchema();
  const demandes: Demande[] = sql
    ? ((await sql`select * from demandes order by cree_le desc limit 300`) as unknown as Demande[])
    : [];

  const parStatut = (s: string) => demandes.filter((d) => d.statut === s).length;

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-[family-name:var(--font-display)] text-2xl font-bold text-[#1B2E78]">
            Demandes de cotation
          </h1>
          <p className="mt-1 text-sm text-[#5A6479]">
            {demandes.length} demande{demandes.length > 1 ? "s" : ""} · {parStatut("nouvelle")} nouvelle
            {parStatut("nouvelle") > 1 ? "s" : ""} · {parStatut("traitee")} traitée
            {parStatut("traitee") > 1 ? "s" : ""}
          </p>
        </div>
        <form action="/api/admin/login" method="post">
          <input type="hidden" name="_method" value="delete" />
          <a
            href="/admin/login"
            className="rounded-full border border-[#E3EAF3] px-4 py-2 text-sm text-[#1B2E78]"
          >
            Quitter
          </a>
        </form>
      </div>

      {!sql && (
        <p className="mt-8 rounded-xl border border-[#E3EAF3] bg-[#F4F7FB] p-5 text-sm text-[#5A6479]">
          La base de données n&apos;est pas encore connectée : ajoutez la variable
          <code className="mx-1 rounded bg-white px-1.5 py-0.5">DATABASE_URL</code> dans Vercel pour
          conserver l&apos;historique des demandes. Les e-mails, eux, partent déjà.
        </p>
      )}

      {sql && demandes.length === 0 && (
        <p className="mt-8 rounded-xl border border-[#E3EAF3] bg-[#F4F7FB] p-5 text-sm text-[#5A6479]">
          Aucune demande enregistrée pour le moment.
        </p>
      )}

      <div className="mt-8 grid gap-4">
        {demandes.map((d) => {
          const st = STATUTS[d.statut] ?? STATUTS.nouvelle;
          return (
            <article key={d.id} className="rounded-2xl border border-[#E3EAF3] bg-white p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-[family-name:var(--font-display)] text-lg font-semibold text-[#1B2E78]">
                    {d.societe}
                  </h2>
                  <p className="text-sm text-[#5A6479]">
                    {d.nom} · <a className="underline" href={`mailto:${d.email}`}>{d.email}</a>
                    {d.telephone ? ` · ${d.telephone}` : ""}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${st.classe}`}>
                    {st.libelle}
                  </span>
                  <time className="text-xs text-[#9AA6BC]">
                    {new Date(d.cree_le).toLocaleString("fr-FR", { dateStyle: "short", timeStyle: "short" })}
                  </time>
                </div>
              </div>

              <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-[#9AA6BC]">
                {d.objet}
              </p>
              <p className="mt-2 whitespace-pre-wrap text-sm text-[#0F1A3D]">{d.besoin}</p>

              <div className="mt-4 flex flex-wrap gap-2">
                {Object.entries(STATUTS).map(([cle, v]) => (
                  <form action={changerStatut} key={cle}>
                    <input type="hidden" name="id" value={d.id} />
                    <input type="hidden" name="statut" value={cle} />
                    <button
                      type="submit"
                      disabled={d.statut === cle}
                      className="rounded-full border border-[#E3EAF3] px-3 py-1.5 text-xs text-[#1B2E78] disabled:opacity-40"
                    >
                      Marquer « {v.libelle.toLowerCase()} »
                    </button>
                  </form>
                ))}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
