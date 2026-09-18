import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import ts from "typescript";

const charger = chemin => {
  const source = fs.readFileSync(new URL(chemin, import.meta.url), "utf8");
  const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(compiled, { exports, require() { throw new Error("aucune dépendance attendue"); } });
  return exports;
};

const produitsModule = charger("../src/content/products.ts");
const site = charger("../src/content/site.ts");

test("seules les marques prévues sont acceptées pour une fiche produit", () => {
  assert.deepEqual([...produitsModule.marquesProduits], ["NALCO", "ECOLAB", "Commodités & Réactifs"]);
  assert.equal(produitsModule.marqueValide("NALCO"), true);
  assert.equal(produitsModule.marqueValide("ECOLAB"), true);
  assert.equal(produitsModule.marqueValide("Commodités & Réactifs"), true);
  assert.equal(produitsModule.marqueValide("nalco"), false);
  assert.equal(produitsModule.marqueValide("<script>"), false);
  assert.equal(produitsModule.marqueValide(""), false);
});

test("chaque marque renvoie vers sa section de la page Négoce", () => {
  assert.equal(produitsModule.ancreMarque["NALCO"], "nalco");
  assert.equal(produitsModule.ancreMarque["ECOLAB"], "ecolab");
  assert.equal(produitsModule.ancreMarque["Commodités & Réactifs"], "commodites");
});

test("les fiches de départ sont complètes, sans prix ni référence inventée", () => {
  const champs = ["slug", "nom", "marque", "gamme", "usage", "secteurs", "forme", "points", "image", "texte"];
  assert.ok(site.produits.length >= 6);
  for (const produit of site.produits) {
    for (const champ of champs) assert.ok(champ in produit, champ + " manquant sur " + produit.slug);
    assert.equal(produitsModule.marqueValide(produit.marque), true, "marque invalide sur " + produit.slug);
    assert.match(produit.slug, /^[a-z0-9-]+$/);
    // Aucun tarif affiché : exigence EF-10 du cahier des charges.
    assert.doesNotMatch([produit.texte, produit.usage, produit.forme].join(" "), /\d+\s*(FCFA|XOF|€|\$)/i);
  }
  const marques = new Set(site.produits.map(p => p.marque));
  assert.equal(marques.size, 3, "les trois marques doivent avoir au moins une fiche");
  const slugs = site.produits.map(p => p.slug);
  assert.equal(new Set(slugs).size, slugs.length, "les identifiants doivent être uniques");
});
