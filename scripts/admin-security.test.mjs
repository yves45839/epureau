import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import {createRequire} from "node:module";
import ts from "typescript";
const nativeRequire=createRequire(import.meta.url);
const source=fs.readFileSync(new URL("../src/lib/admin-security.ts",import.meta.url),"utf8");
const compiled=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText;
const exports={};vm.runInNewContext(compiled,{exports,require:nativeRequire,Buffer});
test("mots de passe salés et vérification sans accepter un hash invalide",async()=>{
 const one=await exports.hashPassword("MotDePasseDeTest-1234");
 const two=await exports.hashPassword("MotDePasseDeTest-1234");
 assert.notEqual(one,two);assert.equal(await exports.checkPassword("MotDePasseDeTest-1234",one),true);
 assert.equal(await exports.checkPassword("mauvais",one),false);assert.equal(await exports.checkPassword("mauvais","invalide"),false);
});
test("les rôles limitent les actions côté serveur",()=>{
 assert.equal(exports.may("editeur","pages"),true);assert.equal(exports.may("editeur","requests"),false);
 assert.equal(exports.may("commercial","requests"),true);assert.equal(exports.may("commercial","users"),false);
 assert.equal(exports.may("commercial","pages"),false);assert.equal(exports.may("admin","settings"),true);
});
test("l’export CSV neutralise les formules et échappe les guillemets",()=>{
 assert.equal(exports.csvCell("=HYPERLINK(1)"),"\"'=HYPERLINK(1)\"");
 assert.equal(exports.csvCell('un "mot"'),'"un ""mot"""');
 assert.equal(exports.csvCell("Texte"),'"Texte"');
});
test("les liens de contenu refusent les protocoles exécutables",()=>{
 assert.equal(exports.safePublicUrl("javascript:alert(1)"),false);
 assert.equal(exports.safePublicUrl("//evil.example/a.png"),false);
 assert.equal(exports.safePublicUrl("/images/logo.png"),true);
 assert.equal(exports.safePublicUrl("https://example.com/a.png"),true);
});
