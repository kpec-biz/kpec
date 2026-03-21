import { NextRequest, NextResponse } from "next/server";

/**
 * 서브도메인 기반 관리자 라우팅
 *
 * admin.example.com/          → /admin (내부 rewrite)
 * admin.example.com/inquiries → /admin/inquiries (내부 rewrite)
 * example.com/admin           → admin.example.com (redirect)
 *
 * 로컬 개발: localhost:3000/admin 은 그대로 동작 (서브도메인 없으므로 bypass)
 */

// 메인 도메인 (환경변수 또는 기본값)
const ROOT_DOMAIN = process.env.NEXT_PUBLIC_ROOT_DOMAIN || "";

function getSubdomain(host: string): string | null {
  // localhost, IP 주소는 서브도메인 없음
  if (
    !host ||
    host.startsWith("localhost") ||
    /^\d+\.\d+\.\d+\.\d+/.test(host)
  ) {
    return null;
  }

  // ROOT_DOMAIN이 설정되지 않으면 서브도메인 감지 안 함
  if (!ROOT_DOMAIN) return null;

  const hostname = host.split(":")[0]; // 포트 제거

  // hostname이 ROOT_DOMAIN으로 끝나고, 앞에 서브도메인이 있는 경우
  if (hostname.endsWith(`.${ROOT_DOMAIN}`) && hostname !== ROOT_DOMAIN) {
    return hostname.replace(`.${ROOT_DOMAIN}`, "");
  }

  return null;
}

export function middleware(req: NextRequest) {
  const host = req.headers.get("host") || "";
  const subdomain = getSubdomain(host);
  const { pathname } = req.nextUrl;

  // === admin 서브도메인 접근 ===
  if (subdomain === "admin") {
    if (!pathname.startsWith("/admin")) {
      const url = req.nextUrl.clone();
      url.pathname = `/admin${pathname}`;
      const res = NextResponse.rewrite(url);
      res.headers.set("x-is-admin", "1");
      return res;
    }
    const res = NextResponse.next();
    res.headers.set("x-is-admin", "1");
    return res;
  }

  // 메인 도메인에서 /admin 직접 접근 (로컬 개발)
  if (pathname.startsWith("/admin")) {
    const res = NextResponse.next();
    res.headers.set("x-is-admin", "1");
    return res;
  }

  // === 메인 도메인에서 /admin 접근 시 서브도메인으로 redirect ===
  if (ROOT_DOMAIN && subdomain === null && pathname.startsWith("/admin")) {
    if (host.startsWith("localhost") || /^\d+\.\d+\.\d+\.\d+/.test(host)) {
      // 로컬 개발은 위에서 이미 처리
      return NextResponse.next();
    }
    const protocol = req.nextUrl.protocol;
    const adminPath = pathname.replace(/^\/admin/, "") || "/";
    const redirectUrl = `${protocol}//admin.${ROOT_DOMAIN}${adminPath}${req.nextUrl.search}`;
    return NextResponse.redirect(redirectUrl, 308);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    // 정적 파일, _next, api 제외
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|mp4|webm|ico|txt|xml|json)$).*)",
  ],
};
