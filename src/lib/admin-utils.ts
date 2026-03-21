// 빌드 타임에 결정 — SSR/클라이언트 동일값 → hydration mismatch 없음
// admin 프로젝트: "" (슬러그 없음) / 메인 프로젝트: "/admin"
const PREFIX = process.env.NEXT_PUBLIC_ADMIN_PREFIX ?? "/admin";

/** admin 경로 href 생성 */
export function adminPath(path: string): string {
  // path: "inquiries" | "/inquiries" | "/admin/inquiries"
  const clean = path.replace(/^\/admin/, "").replace(/^\//, "");
  if (!clean) return PREFIX || "/";
  return `${PREFIX}/${clean}`;
}
