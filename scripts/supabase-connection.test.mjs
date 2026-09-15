import assert from "node:assert/strict";
import test from "node:test";
import { parsePoolerInput, validateSecretKey } from "./lib/supabase-connection.mjs";
const address = "postgresql://postgres.projectref:[YOUR-PASSWORD]@aws-0-eu-west-1.pooler.supabase.com:6543/postgres";
test("demande le mot de passe pour le modele fourni par Supabase", () => {
  const result = parsePoolerInput(address);
  assert.equal(result.needsPassword, true);
  assert.equal(result.url.password, "");
  const password = "a b$#%:@";
  result.url.password = encodeURIComponent(password);
  assert.equal(decodeURIComponent(result.url.password), password);
});
test("accepte une chaine complete et conserve le mot de passe encode", () => {
  const result = parsePoolerInput('"' + address.replace("[YOUR-PASSWORD]", "test%24pass%40word") + '"');
  assert.equal(result.needsPassword, false);
  assert.equal(decodeURIComponent(result.url.password), "test$pass@word");
  assert.equal(result.url.href.includes("$"), false);
});
test("refuse une saisie vide, un mot de passe seul et une URL HTTPS sans les afficher", () => {
  for (const input of ["", "test-super-secret", "https://projectref.supabase.co"]) {
    assert.throws(() => parsePoolerInput(input), error => {
      assert.ok(error.message.includes("COMPLETE"));
      if (input) assert.ok(!error.message.includes(input));
      return true;
    });
  }
});
test("refuse le mauvais port et un hote autre que Supabase", () => {
  assert.throws(() => parsePoolerInput(address.replace(":6543", ":5432")));
  assert.throws(() => parsePoolerInput(address.replace("pooler.supabase.com", "example.com")));
});

test("deduit l'URL du projet depuis la chaine sans exposer le mot de passe", () => {
  const result = parsePoolerInput(address.replace("[YOUR-PASSWORD]", "private-test"));
  assert.equal(result.reference, "projectref");
  assert.equal(result.projectUrl.href, "https://projectref.supabase.co/");
  assert.equal(result.projectUrl.username, "");
  assert.equal(result.projectUrl.password, "");
});
test("accepte les cles secretes et refuse les cles publiques ou d'un autre projet", () => {
  assert.doesNotThrow(() => validateSecretKey("sb_secret_" + "a".repeat(30), "projectref"));
  for (const key of ["", "sb_publishable_" + "a".repeat(30)]) {
    assert.throws(() => validateSecretKey(key, "projectref"));
  }
  const legacy = (role, ref) => "header." + Buffer.from(JSON.stringify({role, ref})).toString("base64url") + ".signature";
  assert.doesNotThrow(() => validateSecretKey(legacy("service_role", "projectref"), "projectref"));
  assert.throws(() => validateSecretKey(legacy("anon", "projectref"), "projectref"));
  assert.throws(() => validateSecretKey(legacy("service_role", "other"), "projectref"));
});
