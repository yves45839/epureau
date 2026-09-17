import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import path from "node:path";
import { db } from "./db";

export type Entry<T = Record<string, unknown>> = { key: string; value: T; revision: number; updated: string };
type Stored = Entry & { kind: string };
export const localStore = () => process.env.ADMIN_LOCAL_STORE === "1" && !process.env.VERCEL && !process.env.NETLIFY;
export const storeConfigured = () => localStore() || Boolean(process.env.DATABASE_URL);
let ready: Promise<void> | undefined;
let queue: Promise<unknown> = Promise.resolve();
const localPath = () => path.join(process.cwd(), ".local", process.env.ADMIN_LOCAL_DATASET === "builder-test" ? "builder-test.json" : "admin.json");

async function localRows(): Promise<Stored[]> {
  try { return JSON.parse(await readFile(localPath(), "utf8")); }
  catch (error) { if ((error as NodeJS.ErrnoException).code === "ENOENT") return []; throw error; }
}
async function exclusive<T>(fn: () => Promise<T>): Promise<T> {
  const next = queue.then(fn, fn); queue = next.catch(() => {}); return next;
}
async function writeRows(rows: Stored[]) {
  await mkdir(path.dirname(localPath()), { recursive: true });
  const temporary = localPath() + "." + randomUUID() + ".tmp";
  await writeFile(temporary, JSON.stringify(rows), { mode: 0o600 });
  await rename(temporary, localPath());
}
async function connection() {
  const sql = db();
  if (!sql) throw new Error("La base de données n’est pas configurée.");
  if (!ready) ready = (async () => {
    await sql`create table if not exists admin_records (kind text not null, key text not null, value jsonb not null, revision integer not null default 1, updated timestamptz not null default now(), primary key(kind,key))`;
    // Deny public REST access when the database is hosted by Supabase.
    await sql`alter table admin_records enable row level security`;
  })().catch(error => { ready = undefined; throw error; });
  await ready; return sql;
}
export async function entries<T = Record<string, unknown>>(kind: string): Promise<Entry<T>[]> {
  if (!storeConfigured()) return [];
  if (localStore()) return (await localRows()).filter(row => row.kind === kind) as Entry<T>[];
  const sql = await connection();
  return await sql`select key,value,revision,updated::text as updated from admin_records where kind=${kind} order by updated desc` as unknown as Entry<T>[];
}
export async function entry<T = Record<string, unknown>>(kind: string, key: string): Promise<Entry<T> | null> {
  if (!storeConfigured()) return null;
  if (localStore()) return (await localRows()).find(row => row.kind === kind && row.key === key) as Entry<T> ?? null;
  const sql = await connection();
  const rows = await sql`select key,value,revision,updated from admin_records where kind=${kind} and key=${key}`;
  return rows[0] as unknown as Entry<T> ?? null;
}
export class Conflict extends Error { constructor() { super("Ce contenu a été modifié ailleurs. Rechargez-le avant d’enregistrer."); } }
export async function save<T extends object>(kind: string, key: string, value: T, expected?: number): Promise<Entry<T>> {
  if (localStore()) return exclusive(async () => {
    const rows = await localRows(); const old = rows.find(row => row.kind === kind && row.key === key);
    if (expected !== undefined && (old?.revision ?? 0) !== expected) throw new Conflict();
    const next = { kind, key, value, revision: (old?.revision ?? 0) + 1, updated: new Date().toISOString() };
    await writeRows([...rows.filter(row => !(row.kind === kind && row.key === key)), next as Stored]);
    return next;
  });
  const sql = await connection();
  const rows = expected === 0
    ? await sql`insert into admin_records(kind,key,value) values(${kind},${key},${sql.json(value as never)}) on conflict do nothing returning key,value,revision,updated::text as updated`
    : expected !== undefined
    ? await sql`update admin_records set value=${sql.json(value as never)}, revision=revision+1, updated=now() where kind=${kind} and key=${key} and revision=${expected} returning key,value,revision,updated::text as updated`
    : await sql`insert into admin_records(kind,key,value) values(${kind},${key},${sql.json(value as never)}) on conflict(kind,key) do update set value=excluded.value, revision=admin_records.revision+1, updated=now() returning key,value,revision,updated::text as updated`;
  if (!rows.length) throw new Conflict();
  return rows[0] as unknown as Entry<T>;
}
export async function remove(kind: string, key: string) {
  if (localStore()) return exclusive(async () => writeRows((await localRows()).filter(row => !(row.kind === kind && row.key === key))));
  const sql = await connection(); await sql`delete from admin_records where kind=${kind} and key=${key}`;
}
export async function prune(kind: string, before: string) {
  if (!storeConfigured()) return;
  if (localStore()) return exclusive(async () => writeRows((await localRows()).filter(row => row.kind !== kind || row.updated >= before)));
  const sql = await connection(); await sql`delete from admin_records where kind=${kind} and updated < ${before}`;
}
