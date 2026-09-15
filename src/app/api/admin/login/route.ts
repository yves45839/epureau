import { NextResponse } from "next/server";
import { COOKIE, authenticate, startSession, endSession, sameOrigin, requestOrigin } from "@/lib/auth";
import { entry, save, remove, prune, storeConfigured } from "@/lib/admin-store";
import { hashToken } from "@/lib/admin-security";
export const runtime = "nodejs";
export async function POST(req: Request) {
  if (!sameOrigin(req)) return new Response("Origine refusée", { status: 403 });
  const base = new URL(requestOrigin(req));
  if (!storeConfigured()) return NextResponse.redirect(new URL("/admin/login?e=config", base), 303);
  try {
    const form = await req.formData();
    if (form.get("_method") === "delete") {
      await endSession();
      const response = NextResponse.redirect(new URL("/admin/login", base),303); response.cookies.delete(COOKIE); return response;
    }
    const email = String(form.get("email") ?? "").trim().toLowerCase().slice(0,160);
    const password = String(form.get("motdepasse") ?? "");
    if (password.length > 200) return NextResponse.redirect(new URL("/admin/login?e=1",base),303);
    const bucket = hashToken(email);
    const attempt = await entry<{ count: number; until: number }>("attempts", bucket);
    const now = Date.now();
    if (attempt && attempt.value.until > now && attempt.value.count >= 8) return NextResponse.redirect(new URL("/admin/login?e=rate",base),303);
    await prune("attempts", new Date(now - 3600000).toISOString());
    const count = attempt && attempt.value.until > now ? attempt.value.count + 1 : 1;
    await save("attempts",bucket,{count,until: attempt && attempt.value.until > now ? attempt.value.until : now + 900000}, attempt?.revision ?? 0);
    const identity = await authenticate(email,password);
    if (!identity) return NextResponse.redirect(new URL("/admin/login?e=1",base),303);
    await remove("attempts",bucket);
    const token = await startSession(identity);
    await save("audit",crypto.randomUUID(),{ actor: identity.email, action:"Connexion", date:new Date().toISOString() });
    const response = NextResponse.redirect(new URL("/admin",base),303);
    response.cookies.set(COOKIE,token,{httpOnly:true,sameSite:"lax",secure:base.protocol === "https:",path:"/",maxAge:43200});
    return response;
  } catch { return NextResponse.redirect(new URL("/admin/login?e=service",base),303); }
}
export async function DELETE(req: Request) {
  if (!sameOrigin(req)) return new Response("Origine refusée",{status:403});
  await endSession(); const response = NextResponse.json({ok:true}); response.cookies.delete(COOKIE); return response;
}
