import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {createHash} from "node:crypto";

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
    assert.equal(p.data.reference,p.data.nom);
    // Public typography can differ from the archived workbook without changing quantities.
    const packKey=value=>value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g,"").replace(/\b0+(\d)/g,"$1").replace(/\s/g,"").replace(/×/g,"*");
    assert.equal(packKey(p.data.forme),packKey(p.sources[0].packaging),p.slug);
    assert.equal(p.data.fiche,""); // Do not promise documents not supplied or verified.
    assert.ok(translations[p.slug]?.categorie,p.slug);
    assert.ok(translations[p.slug]?.texte,p.slug);
    if(p.data.compatibilite)assert.ok(translations[p.slug].compatibilite,p.slug);
  }
});

test("copy corrections preserve source rows and product URLs",()=>{
  const provenance=manifest.products.map(({slug,sources})=>({slug,sources}));
  assert.equal(createHash("sha256").update(JSON.stringify(provenance)).digest("hex"),"74bf6fd13be3c53cea73675b4cf417b53e6d3627c65d7ab20482bb7c0b3a5e4d");
});

test("public product copy no longer contains the imported spelling mistakes",()=>{
  const errors=/détergeant|vaisseille|rincage|textilles?|détarchant|universsell?e?|sallissures|tpempérature|chiwing-gum|blinchimant|oxygiéné|assoupissant|chllorhexdine|chlorydrique|chlorhidrique|soduim|moullant|grassese|éfficace|cristalisant|décarpant|usagepour|gycol|eurolailt/i;
  for(const product of manifest.products) {
    for(const field of ["nom","reference","categorie","gamme","texte","usage","forme","points"])
      assert.doesNotMatch(product.data[field],errors,`${product.slug}.${field}`);
    for(const text of [product.data.forme,translations[product.slug].forme].filter(Boolean))
      assert.doesNotMatch(text, /\d(?:kg|ml|l)\b/i, product.slug);
  }
  assert.equal(manifest.products.find(p=>p.slug==="ecolab-ecobrite-oxy").data.usage,"Blanchissant liquide oxygéné et désinfectant");
  assert.equal(manifest.products.find(p=>p.slug==="commodites-reactifs-acide-chlorhidrique-38").data.nom,"ACIDE CHLORHYDRIQUE 38 %");
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
