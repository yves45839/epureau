import { existsSync,writeFileSync,readFileSync } from "node:fs";
import { randomBytes } from "node:crypto";
import { parseEnv } from "node:util";
import { spawn } from "node:child_process";
if(!existsSync(".env.local"))writeFileSync(".env.local",["ADMIN_LOCAL_STORE=1","ADMIN_EMAIL=admin@epureau-ci.com","ADMIN_PASSWORD="+randomBytes(24).toString("base64url"),""].join("\n"),{mode:0o600,flag:"wx"});
console.log("Administration locale : http://127.0.0.1:3000/admin");
console.log("Identifiants enregistrés dans .env.local (fichier privé, non versionné).");
const child=spawn(process.execPath,["node_modules/next/dist/bin/next",process.argv.includes("--production")?"start":"dev","--hostname","127.0.0.1"],{stdio:"inherit",env:{...process.env,...parseEnv(readFileSync(".env.local","utf8")),ADMIN_LOCAL_STORE:"1",RESEND_API_KEY:"",DATABASE_URL:"",NEXT_TELEMETRY_DISABLED:"1"}});
child.on("exit",code=>process.exit(code??0));
