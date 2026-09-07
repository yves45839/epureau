import { NextResponse } from "next/server";
import { COOKIE, jeton, verifierMotDePasse } from "@/lib/auth";

export const runtime = "nodejs";

export async function POST(req: Request) {
  const form = await req.formData();
  const mdp = String(form.get("motdepasse") ?? "");
  const base = new URL(req.url);

  if (!process.env.ADMIN_PASSWORD) {
    return NextResponse.redirect(new URL("/admin/login?e=config", base), 303);
  }
  if (!verifierMotDePasse(mdp)) {
    return NextResponse.redirect(new URL("/admin/login?e=1", base), 303);
  }

  const rep = NextResponse.redirect(new URL("/admin", base), 303);
  rep.cookies.set(COOKIE, jeton()!, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12,
  });
  return rep;
}

export async function DELETE(req: Request) {
  const rep = NextResponse.redirect(new URL("/admin/login", new URL(req.url)), 303);
  rep.cookies.delete(COOKIE);
  return rep;
}
