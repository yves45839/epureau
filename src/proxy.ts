import { NextResponse, type NextRequest } from "next/server";

/** Locale is part of the URL and request headers, never part of the shared CMS cache. */
export function proxy(request: NextRequest) {
  const path=request.nextUrl.pathname;
  // NextURL normalizes 127.0.0.1 to localhost; keep the actual host for internal rewrites.
  const origin=new URL(request.url);
  origin.host=request.headers.get("host")||origin.host;
  const match=path.match(/^\/(en|fr)(?=\/|$)/);
  const locale=match?.[1] || (request.cookies.get("epureau-language")?.value==="en"?"en":"fr");
  const clean=match?path.slice(match[0].length)||"/":path;
  // A language prefix must never expose a second address for APIs or administration.
  if(/^\/(?:admin|api|_next|images|maquette|fonts)(?:\/|$)/.test(clean)||/\.[^/]+$/.test(clean)) {
    return match?NextResponse.redirect(new URL(clean,origin)):NextResponse.next();
  }
  if(!match&&locale==="en") {
    const url=new URL(origin);url.pathname="/en"+(clean==="/"?"":clean);
    return NextResponse.redirect(url);
  }
  const headers=new Headers(request.headers);
  headers.set("x-epureau-language",locale);
  headers.set("x-epureau-path",clean);
  const url=new URL(origin);url.pathname=clean;
  const response=match?NextResponse.rewrite(url,{request:{headers}}):NextResponse.next({request:{headers}});
  if(match)response.cookies.set("epureau-language",locale,{path:"/",sameSite:"lax",maxAge:31536000,secure:request.nextUrl.protocol==="https:"});
  return response;
}
export const config={matcher:["/((?!api(?:/|$)|admin(?:/|$)|_next(?:/|$)|images(?:/|$)|maquette(?:/|$)|fonts(?:/|$)|.*\\.[^/]+$).*)"]};
