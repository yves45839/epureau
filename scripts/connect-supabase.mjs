import { readFile, writeFile } from "node:fs/promises";
import { randomBytes } from "node:crypto";
import { parseEnv } from "node:util";
import { createInterface } from "node:readline/promises";
import { Writable } from "node:stream";
import { spawn } from "node:child_process";
import { fileURLToPath } from "node:url";
import postgres from "postgres";
import { parsePoolerInput, validateSecretKey } from "./lib/supabase-connection.mjs";

process.chdir(fileURLToPath(new URL("..", import.meta.url)));
if (!process.stdin.isTTY) {
  console.error("Lancez cette commande dans votre terminal interactif pour saisir les secrets sans les afficher.");
  process.exit(1);
}
let muted = false;
const output = new Writable({
  write(chunk, encoding, done) {
    if (!muted) process.stdout.write(chunk, encoding);
    done();
  }
});
const rl = createInterface({ input: process.stdin, output, terminal: true });
async function ask(label, secret = false) {
  if (!secret) return (await rl.question(label + " : ")).trim();
  process.stdout.write(label + " (saisie masquee) : ");
  muted = true;
  try { return (await rl.question("")).trim(); }
  finally { muted = false; process.stdout.write("\n"); }
}
let sql;
let configured;
try {
  console.log("Connexion du site a votre projet Supabase existant. Aucun abonnement n'est cree.");
  console.log("Dans Supabase : Connect > Transaction pooler > copier la chaine postgresql://...");
  console.log("Collez la chaine complete, puis Entree. Rien ne s'affiche pendant la saisie.");
  let connection;
  while (!connection) {
    const input = await ask("Chaine PostgreSQL complete", true);
    try { connection = parsePoolerInput(input); }
    catch (error) { console.error(error.message); }
  }
  const database = connection.url;
  if (connection.needsPassword) {
    let password = "";
    while (!password) {
      password = await ask("Mot de passe de la base PostgreSQL", true);
      if (!password) console.log("Le mot de passe ne peut pas etre vide.");
    }
    database.password = encodeURIComponent(password);
  }
  const project = connection.projectUrl;
  const reference = connection.reference;
  console.log("Adresse du projet detectee automatiquement.");
  let key = "";
  while (!key) {
    const candidate = await ask("Secret key sb_secret_... (Settings > API Keys)", true);
    try { validateSecretKey(candidate, reference); key = candidate; }
    catch (error) { console.error(error.message); }
  }
  rl.close();
  console.log("Verification de la connexion PostgreSQL...");
  sql = postgres(database.href, { ssl: "require", max: 1, connect_timeout: 10, prepare: false });
  try { await sql.unsafe("select 1"); }
  catch { throw new Error("Connexion PostgreSQL refusee. Verifiez la chaine, le mot de passe et que le projet est actif."); }
  await sql.end({ timeout: 2 }); sql = undefined;
  let mediaReady = false;
  try {
    const result = await fetch(project.origin + "/storage/v1/bucket/site-media", {
      headers: { apikey: key, ...(key.startsWith("sb_secret_") ? {} : { Authorization: "Bearer " + key }) },
      signal: AbortSignal.timeout(15000)
    });
    if ([401, 403].includes(result.status)) throw new Error("KEY_REFUSED");
    mediaReady = result.ok;
  } catch (error) {
    if (error.message === "KEY_REFUSED") throw new Error("La cle service_role a ete refusee. Aucun fichier de configuration n'a ete modifie.");
    console.log("Stockage des medias non verifie : controlez-le dans Supabase.");
  }
  let existing = "";
  try { existing = await readFile(".env.local", "utf8"); }
  catch (error) { if (error.code !== "ENOENT") throw error; }
  const previous = parseEnv(existing);
  const values = {
    ADMIN_LOCAL_STORE: "0",
    DATABASE_URL: database.href,
    SUPABASE_URL: project.origin,
    SUPABASE_SECRET_KEY: key.startsWith("sb_secret_") ? key : "",
    SUPABASE_SERVICE_ROLE_KEY: key.startsWith("sb_secret_") ? "" : key,
    ...(!previous.ADMIN_EMAIL ? { ADMIN_EMAIL: "admin@epureau-ci.com" } : {}),
    ...(!previous.ADMIN_PASSWORD ? { ADMIN_PASSWORD: randomBytes(24).toString("base64url") } : {})
  };
  const retained = existing.split(/\r?\n/).filter(line => {
    const match = line.match(/^\s*(?:export\s+)?([A-Z_]+)\s*=/);
    return !match || !(match[1] in values);
  }).join("\n").trimEnd();
  const content = retained + "\n" + Object.entries(values).map(([key, value]) => key + "=" + JSON.stringify(value)).join("\n") + "\n";
  await writeFile(".env.local", content, { mode: 0o600 });
  configured = { ...previous, ...values };
  console.log("Connexion reussie. Acces enregistres dans .env.local, exclu de Git.");
  console.log("Les donnees de demonstration locales ne sont pas transferees.");
  if (!mediaReady) console.log("Pour les images/PDF : executez supabase/setup.sql dans l'editeur SQL Supabase.");
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
} finally {
  rl.close();
  if (sql) await sql.end({ timeout: 2 }).catch(() => {});
}
if (configured) {
  console.log("Ouverture du site connecte a Supabase : http://127.0.0.1:3001/admin");
  console.log("Ce lancement reste sur votre ordinateur. Les notifications e-mail sont desactivees pendant cet essai.");
  const child = spawn(process.execPath, ["node_modules/next/dist/bin/next", "dev", "--hostname", "127.0.0.1", "--port", "3001"], {
    stdio: "inherit", windowsHide: true,
    env: { ...process.env, ...configured, RESEND_API_KEY: "", NEXT_TELEMETRY_DISABLED: "1" }
  });
  child.on("error", () => { console.error("Impossible de lancer le serveur."); process.exitCode = 1; });
  child.on("exit", code => { process.exitCode = code ?? 1; });
}
