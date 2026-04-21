import { NextRequest, NextResponse } from "next/server";
import { PPP } from "@/lib/ppp";

export function middleware(req: NextRequest) {
  const res = NextResponse.next();
  if (req.cookies.get("country")) return res;

  const cf = req.headers.get("cf-ipcountry")?.toLowerCase() ?? "";
  const al = req.headers.get("accept-language") ?? "";
  let country = "us";
  if (cf && PPP[cf]) country = cf;
  else if (al.includes("ja")) country = "jp";
  else if (al.includes("de")) country = "de";
  else if (al.includes("fr")) country = "fr";
  else if (al.includes("zh")) country = "hk";
  else if (al.includes("en-GB")) country = "uk";
  else if (al.includes("en-AU")) country = "au";

  res.cookies.set("country", country, { maxAge: 60 * 60 * 24 * 30, path: "/" });
  return res;
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
