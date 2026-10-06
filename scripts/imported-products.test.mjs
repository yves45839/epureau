import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

const manifest=JSON.parse(fs.readFileSync(new URL("../src/content/imported-products.json",import.meta.url),"utf8"));
const translations=JSON.parse(fs.readFileSync(new URL("../src/content/imported-products-en.json",import.meta.url),"utf8"));

test("workbook import retains all 243 source rows without duplicate product slugs",()=>{
  assert.equal(manifest.products.length,213);
  assert.equal(new Set(manifest.products.map(p=>p.slug)).size,213);
  assert.equal(manifest.products.reduce((sum,p)=>sum+p.sources.length,0),243);
  const sulphuric=manifest.products.filter(p=>p.data.nom==="ACIDE SULFURIQUE");
  assert.equal(sulphuric.length,1);
  assert.equal(sulphuric[0].sources.length,2);
  for(const p of manifest.products){
    assert.match(p.slug,/^[a-z0-9-]+$/);
    assert.ok(p.data.nom&&p.data.categorie&&p.data.marque,p.slug);
    assert.equal(p.data.reference,p.sources[0].name);
    assert.equal(p.data.forme,p.sources[0].packaging);
    assert.equal(p.data.fiche,""); // Do not promise documents not supplied or verified.
    assert.ok(translations[p.slug]?.categorie,p.slug);
    assert.ok(translations[p.slug]?.texte,p.slug);
    if(p.data.compatibilite)assert.ok(translations[p.slug].compatibilite,p.slug);
  }
});

test("published packshots exist locally and have traceable sources",()=>{
  const illustrated=manifest.products.filter(p=>p.data.image);
  assert.equal(illustrated.length,55);
  for(const p of illustrated){
    assert.ok(p.imageSource,p.slug);
    assert.match(p.data.image,/^\/images\/products\/imported\/[a-z0-9-]+\.webp$/);
    const image=fs.readFileSync(new URL("../public"+p.data.image,import.meta.url));
    assert.equal(image.toString("ascii",0,4),"RIFF");
    assert.equal(image.toString("ascii",8,12),"WEBP");
  }
  assert.equal(manifest.products.find(p=>p.slug==="lovibond-vario-chlorine-total-dpd-t").data.image,"");
  assert.ok(manifest.products.find(p=>p.slug==="lovibond-chlorine-free-dpd-f").data.image);
});
