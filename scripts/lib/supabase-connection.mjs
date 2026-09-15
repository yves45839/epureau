// Parse connection input without ever including credentials in an error message.
export function parsePoolerInput(value) {
  let text = value.trim();
  if ((text.startsWith('"') && text.endsWith('"')) || (text.startsWith("'") && text.endsWith("'"))) text = text.slice(1, -1);
  if (!/^postgres(?:ql)?:\/\//.test(text)) {
    throw new Error("Collez la chaine COMPLETE commencant par postgresql://, pas le mot de passe ni l'URL https du projet.");
  }
  let url;
  const marker = "setup-password-placeholder";
  try { url = new URL(text.replace("[YOUR-PASSWORD]", marker)); }
  catch { throw new Error("Adresse de connexion invalide. Recopiez la chaine dans Connect > Transaction pooler."); }
  if (!url.hostname.endsWith(".pooler.supabase.com") || url.port !== "6543" || !/^postgres\.[a-z0-9-]+$/.test(url.username) || url.pathname !== "/postgres" || url.hash) {
    throw new Error("Choisissez Transaction pooler (port 6543). Si le mot de passe contient des caracteres speciaux, laissez [YOUR-PASSWORD] dans la chaine.");
  }
  const needsPassword = !url.password || url.password === marker;
  if (needsPassword) url.password = "";
  else {
    try { url.password = encodeURIComponent(decodeURIComponent(url.password)); }
    catch { throw new Error("Laissez [YOUR-PASSWORD] dans la chaine pour saisir votre mot de passe separement."); }
  }
  const reference = url.username.slice("postgres.".length);
  return { url, needsPassword, reference, projectUrl: new URL("https://" + reference + ".supabase.co") };
}

export function validateSecretKey(key, reference) {
  if (/^sb_secret_[a-zA-Z0-9_-]{20,}$/.test(key)) return;
  let claims;
  try { claims = JSON.parse(Buffer.from(key.split(".")[1], "base64url").toString("utf8")); }
  catch { throw new Error("Copiez une Secret key sb_secret_... dans Settings > API Keys. Une cle publishable ne convient pas."); }
  if (claims.role !== "service_role" || (claims.ref && claims.ref !== reference)) {
    throw new Error("Utilisez une cle secrete de ce projet, pas une cle anon ou publishable.");
  }
}
