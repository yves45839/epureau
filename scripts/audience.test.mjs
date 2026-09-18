import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { createRequire } from "node:module";
import ts from "typescript";

const nativeRequire = createRequire(import.meta.url);
const source = fs.readFileSync(new URL("../src/lib/audience.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const exports = {};
vm.runInNewContext(compiled, {
  exports, Math, Date, Set, Map, JSON, URL, console,
  require(name) {
    if (name === "server-only") return {};
    if (name === "node:crypto") return nativeRequire("node:crypto");
    if (name === "./db") return { db: () => null };
    if (name === "./admin-store") return { entry: async () => null, entries: async () => [], save: async () => {}, remove: async () => {}, localStore: () => false, storeConfigured: () => false };
    throw new Error("Dépendance inattendue : " + name);
  },
});

test("l’empreinte visiteur ne laisse pas retrouver l’adresse IP et change chaque jour", () => {
  const hier = exports.empreinte("sel-de-la-veille", "196.1.2.3", "Mozilla/5.0 Chrome");
  const aujourdhui = exports.empreinte("sel-du-jour", "196.1.2.3", "Mozilla/5.0 Chrome");
  assert.notEqual(hier, aujourdhui);
  assert.equal(aujourdhui.length, 32);
  assert.equal(aujourdhui.includes("196.1.2.3"), false);
  assert.equal(exports.empreinte("sel-du-jour", "196.1.2.3", "Mozilla/5.0 Chrome"), aujourdhui);
});

test("les robots et les agents vides sont écartés du comptage", () => {
  assert.equal(exports.estRobot("Mozilla/5.0 (compatible; Googlebot/2.1)"), true);
  assert.equal(exports.estRobot(""), true);
  assert.equal(exports.estRobot("Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/140"), false);
});

test("la provenance est classée sans dépendre d’un service tiers", () => {
  assert.equal(exports.sourceDepuis("", "epureau-ci.com"), "Accès direct");
  assert.equal(exports.sourceDepuis("https://www.epureau-ci.com/a-propos", "www.epureau-ci.com"), "Accès direct");
  assert.equal(exports.sourceDepuis("https://www.google.ci/search?q=station", "epureau-ci.com"), "Recherche");
  assert.equal(exports.sourceDepuis("https://www.linkedin.com/feed", "epureau-ci.com"), "Réseaux sociaux");
  assert.equal(exports.sourceDepuis("https://annuaire-industrie.ci/fiche", "epureau-ci.com"), "Site référent");
  assert.equal(exports.domaineReferent("https://annuaire-industrie.ci/fiche", "epureau-ci.com"), "annuaire-industrie.ci");
});

test("appareil, navigateur, système et pays sont dérivés de l’en-tête, pas d’un profil", () => {
  const iphone = "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X) AppleWebKit Safari";
  assert.equal(exports.appareilDepuis(iphone), "Mobile");
  assert.equal(exports.systemeDepuis(iphone), "iOS");
  assert.equal(exports.navigateurDepuis(iphone), "Safari");
  assert.equal(exports.appareilDepuis("Mozilla/5.0 (Windows NT 10.0) Chrome/140"), "Ordinateur");
  assert.equal(exports.navigateurDepuis("Mozilla/5.0 (Windows NT 10.0) Chrome/140 Edg/140"), "Edge");
  assert.equal(exports.nomPays("ci"), "Côte d'Ivoire");
  assert.equal(exports.nomPays(""), "Inconnu");
});

function visite(minutes, extra = {}) {
  return {
    occurred_at: new Date(Date.now() - minutes * 60000).toISOString(),
    visitor: "v1", session: "s1", kind: "page", path: "/", title: "", source: "Accès direct",
    referrer: "", pays: "Côte d'Ivoire", ville: "Abidjan", region: "", appareil: "Ordinateur",
    navigateur: "Chrome", systeme: "Windows", langue: "fr", ...extra,
  };
}

test("le rapport agrège visiteurs, sessions, rebond, durée et conversions", () => {
  const rapport = exports.resume([
    visite(50, { path: "/", session: "s1", visitor: "v1" }),
    visite(46, { path: "/ingenierie/notre-expertise", session: "s1", visitor: "v1" }),
    visite(40, { path: "/contact", session: "s1", visitor: "v1" }),
    visite(20, { path: "/", session: "s2", visitor: "v2", pays: "France", source: "Recherche", appareil: "Mobile" }),
    visite(10, { kind: "conversion", title: "Demande de cotation", session: "s1", visitor: "v1" }),
    visite(60 * 24 * 90, { path: "/hors-periode", session: "s9", visitor: "v9" }),
  ], 30);

  assert.equal(rapport.totaux.pages, 4);
  assert.equal(rapport.totaux.visiteurs, 2);
  assert.equal(rapport.totaux.sessions, 2);
  assert.equal(rapport.totaux.conversions, 1);
  assert.equal(rapport.totaux.rebond, 50);      // s2 n'a qu'une page
  assert.equal(rapport.totaux.duree, 600);      // s1 : 10 minutes
  assert.equal(rapport.totaux.parPage, 2);
  assert.equal(rapport.pages[0].libelle, "/");
  assert.equal(rapport.pages[0].valeur, 2);
  assert.equal(rapport.entrees[0].libelle, "/");
  assert.equal(rapport.sorties.some(p => p.libelle === "/contact"), true);
  assert.equal(rapport.pays.find(p => p.libelle === "France").valeur, 1);
  assert.equal(rapport.conversions[0].libelle, "Demande de cotation");
  assert.equal(rapport.courbe.length, 30);
  assert.equal(rapport.pages.some(p => p.libelle === "/hors-periode"), false);
});
