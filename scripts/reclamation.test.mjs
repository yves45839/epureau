import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
import ts from 'typescript';
import { z } from 'zod';
import { randomUUID } from 'node:crypto';

const input = { nom: 'Client Test', societe: 'Société Test', email: 'test@example.com', categorie: 'Produits chimiques', description: 'Le produit livré ne correspond pas à la commande.', commande: 'TEST-123' };
function fixture({ database = false, mail = false, mailError = false } = {}) {
  const saved = [], sent = [];
  const source = readFileSync(new URL('../src/app/api/reclamation/route.ts', import.meta.url), 'utf8');
  const js = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
  const exports = {};
  vm.runInNewContext(js, { exports, Response, console: { error() {} }, require(name) {
    if (name === 'node:crypto') return { randomUUID };
    if (name === 'zod') return { z };
    if (name === '@/lib/admin-requests') return { recordRequest: async data => { if (database) saved.push(Object.values(data)); return database; } };
    if (name === '@/lib/mail') return { envoyerDemande: async (...data) => { sent.push(data); if (mailError) throw new Error('indisponible'); return { envoye: mail }; } };
    throw new Error(`Unexpected dependency: ${name}`);
  } });
  const post = data => exports.POST(new Request('http://localhost/api/reclamation', { method: 'POST', body: JSON.stringify(data) }));
  return { post, saved, sent };
}

test('refuse les données invalides sans stockage ni envoi', async () => {
  const f = fixture();
  assert.equal((await f.post({ ...input, email: 'invalide' })).status, 422);
  assert.equal(f.saved.length, 0); assert.equal(f.sent.length, 0);
});
test('ne confirme pas la réception sans stockage et sans transmission', async () => {
  assert.equal((await fixture().post(input)).status, 503);
  assert.equal((await fixture({ mailError: true }).post(input)).status, 503);
});
test('conserve la réclamation et sa référence même si le service e-mail échoue', async () => {
  const f = fixture({ database: true, mailError: true });
  const result = await f.post(input);
  assert.equal(result.status, 200);
  const { reference } = await result.json();
  assert.match(reference, /^REC-[A-F0-9-]{36}$/);
  assert.ok(f.saved[0].some(value => String(value).includes(reference)));
  assert.equal(f.sent[0][1], 'Réclamation client');
});
test('accepte une transmission e-mail réussie et ignore le piège à robots', async () => {
  const f = fixture({ mail: true });
  assert.equal((await f.post(input)).status, 200);
  assert.equal(f.sent.length, 1);
  await f.post({ ...input, site: 'robot' });
  assert.equal(f.sent.length, 1);
});
