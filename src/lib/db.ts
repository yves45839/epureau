import postgres from "postgres";

/**
 * Connexion Postgres paresseuse : le site fonctionne sans base (le formulaire
 * se contente alors d'envoyer les e-mails), ce qui permet de déployer avant que
 * la base Vercel/Neon ne soit provisionnée.
 */
let client: ReturnType<typeof postgres> | null = null;
let schemaPret = false;

export function db() {
  const url = process.env.DATABASE_URL;
  if (!url) return null;
  if (!client) {
    client = postgres(url, { ssl: "require", max: 1, idle_timeout: 20, connect_timeout: 10, prepare: false });
  }
  return client;
}

export async function assurerSchema() {
  const sql = db();
  if (!sql || schemaPret) return sql;
  await sql`
    create table if not exists demandes (
      id           bigserial primary key,
      cree_le      timestamptz not null default now(),
      nom          text not null,
      societe      text not null,
      email        text not null,
      telephone    text,
      objet        text not null,
      besoin       text not null,
      statut       text not null default 'nouvelle',
      source       text,
      user_agent   text
    )
  `;
  await sql`alter table demandes enable row level security`;
  await sql`create index if not exists demandes_cree_le_idx on demandes (cree_le desc)`;
  schemaPret = true;
  return sql;
}

export type Demande = {
  id: number;
  cree_le: string;
  nom: string;
  societe: string;
  email: string;
  telephone: string | null;
  objet: string;
  besoin: string;
  statut: string;
};
