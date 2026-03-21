/**
 * admin 서브도메인에서는 /admin prefix 없이 라우팅
 * 메인 도메인에서는 /admin prefix 사용
 */
export function isAdminSubdomain(): boolean {
  if (typeof window === "undefined") return false;
  const host = window.location.hostname;
  return host.startsWith("admin.");
}

/**
 * admin 경로를 현재 환경에 맞게 변환
 * /admin/inquiries → 서브도메인이면 /inquiries, 아니면 /admin/inquiries
 */
export function adminHref(path: string): string {
  if (isAdminSubdomain()) {
    // /admin → /
    // /admin/inquiries → /inquiries
    return path.replace(/^\/admin/, "") || "/";
  }
  return path;
}

/**
 * 현재 pathname이 admin 경로에 매칭되는지 확인
 * 서브도메인: /inquiries === /admin/inquiries
 * 메인도메인: /admin/inquiries === /admin/inquiries
 */
export function isAdminActive(pathname: string, href: string): boolean {
  const normalizedHref = href.replace(/^\/admin/, "");
  const normalizedPath = pathname.replace(/^\/admin/, "");

  if (normalizedHref === "" || normalizedHref === "/") {
    return normalizedPath === "" || normalizedPath === "/";
  }
  return normalizedPath.startsWith(normalizedHref);
}
