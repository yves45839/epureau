import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";
import { z } from "zod";

const nativeRequire = createRequire(import.meta.url);
const compile = url => ts.transpileModule(fs.readFileSync(url, "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;

const securite = {};
vm.runInNewContext(compile(new URL("../src/lib/admin-security.ts", import.meta.url)), {
  exports: securite, Buffer, process,
  require(name) { if (name === "node:crypto") return nativeRequire("node:crypto"); if (name === "node:util") return nativeRequire("node:util"); throw new Error(name); },
});

function banc({ comptes = [] } = {}) {
  const magasin = new Map();
  for (const compte of comptes) magasin.set("users|" + compte.email, { key: compte.email, value: compte, revision: 1, updated: "" });
  const redirections = [];
  const routeExports = {};
  vm.runInNewContext(compile(new URL("../src/app/api/admin/signup/route.ts", import.meta.url)), {
    exports: routeExports, URL, Date, Math, JSON, process, console, crypto,
    require(name) {
      if (name === "next/server") return { NextResponse: { redirect: (url, status) => { redirections.push(String(url)); return { url: String(url), status }; } } };
      if (name === "zod") return { z };
      if (name === "@/lib/auth") return { sameOrigin: () => true, requestOrigin: () => "https://www.epureau-ci.com" };
      if (name === "@/lib/admin-security") return securite;
      if (name === "@/lib/admin-store") return {
        storeConfigured: () => true,
        entry: async (kind, key) => magasin.get(kind + "|" + key) ?? null,
        entries: async kind => [...magasin.entries()].filter(([k]) => k.startsWith(kind + "|")).map(([, v]) => v),
        prune: async () => {},
        save: async (kind, key, value, expected) => {
          const existant = magasin.get(kind + "|" + key);
          if (expected === 0 && existant) throw new Error("Conflit");
          const ligne = { key, value, revision: (existant?.revision ?? 0) + 1, updated: new Date().toISOString() };
          magasin.set(kind + "|" + key, ligne);
          return ligne;
        },
      };
      throw new Error("Dépendance inattendue : " + name);
    },
  });
  const envoyer = async champs => {
    const form = new FormData();
    for (const [cle, valeur] of Object.entries(champs)) form.set(cle, valeur);
    const reponse = await routeExports.POST({ formData: async () => form, headers: new Headers(), url: "https://www.epureau-ci.com/api/admin/signup" });
    return String(reponse.url ?? "");
  };
  return { envoyer, compte: email => magasin.get("users|" + email)?.value, journal: () => [...magasin.keys()].filter(k => k.startsWith("audit|")), redirections };
}

const valide = { nom: "Awa Koné", email: "awa.kone@epureau-ci.com", motdepasse: "MotDePasseSolide2026", confirmation: "MotDePasseSolide2026" };

test("une adresse hors du domaine EPUREAU ne crée aucun compte", async () => {
  const b = banc();
  const url = await b.envoyer({ ...valide, email: "awa.kone@gmail.com" });
  assert.match(url, /e=domaine/);
  assert.equal(b.compte("awa.kone@gmail.com"), undefined);
});

test("une adresse @epureau-ci.com crée un compte commercial inactif, en attente d’activation", async () => {
  const b = banc({ comptes: [{ email: "dg@epureau-ci.com", name: "DG", role: "admin", active: true, password: "x" }] });
  const url = await b.envoyer(valide);
  assert.match(url, /\/admin\/login\?ok=attente/);
  const compte = b.compte("awa.kone@epureau-ci.com");
  assert.equal(compte.role, "commercial");
  assert.equal(compte.active, false);
  assert.equal(compte.demande, true);
  assert.notEqual(compte.password, valide.motdepasse);
  assert.match(compte.password, /^[a-f0-9]{32}:[a-f0-9]{128}$/);
});

test("le super administrateur ouvre le site, puis passe en file d’attente comme les autres", async () => {
  const vierge = banc();
  assert.match(await vierge.envoyer({ ...valide, email: "roland@label-ci.com" }), /ok=admin/);
  const proprietaire = vierge.compte("roland@label-ci.com");
  assert.equal(proprietaire.role, "admin");
  assert.equal(proprietaire.active, true);

  const installe = banc({ comptes: [{ email: "dg@epureau-ci.com", name: "DG", role: "admin", active: true, password: "x" }] });
  assert.match(await installe.envoyer({ ...valide, email: "roland@label-ci.com" }), /ok=attente/);
  assert.equal(installe.compte("roland@label-ci.com").active, false);
});

test("mot de passe trop court, confirmation différente et adresse déjà connue sont refusés sans rien révéler", async () => {
  const b = banc();
  assert.match(await b.envoyer({ ...valide, motdepasse: "court", confirmation: "court" }), /e=champs/);
  assert.match(await b.envoyer({ ...valide, confirmation: "AutreMotDePasse2026" }), /e=confirmation/);
  await b.envoyer(valide);
  const deuxieme = await b.envoyer({ ...valide, nom: "Usurpateur", motdepasse: "AutreMotDePasse2026", confirmation: "AutreMotDePasse2026" });
  assert.match(deuxieme, /ok=attente/);
  assert.equal(b.compte("awa.kone@epureau-ci.com").name, "Awa Koné");
});

test("les demandes répétées sur une même adresse sont limitées", async () => {
  const b = banc();
  for (let i = 0; i < 5; i++) assert.match(await b.envoyer(valide), /ok=attente/);
  assert.match(await b.envoyer(valide), /e=rate/);
});

test("les règles de domaine et de super administrateur sont celles du cahier des charges", () => {
  assert.equal(securite.emailAutorise("service.achats@epureau-ci.com"), true);
  assert.equal(securite.emailAutorise("contact@epureau-ci.com.pirate.net"), false);
  assert.equal(securite.emailAutorise("roland@label-ci.com"), true);
  assert.equal(securite.estSuperAdmin("roland@label-ci.com"), true);
  assert.equal(securite.estSuperAdmin("dg@epureau-ci.com"), false);
  assert.equal(securite.ROLE_PAR_DEFAUT, "commercial");
  assert.equal(securite.may("commercial", "audience"), true);
  assert.equal(securite.may("editeur", "audience"), true);
  assert.equal(securite.may("commercial", "users"), false);
});
