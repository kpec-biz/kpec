import manifest from "./image-manifest.json";

const R2_BASE = "https://pub-d5cd496aa0ad4d72b720f78967753f9f.r2.dev";

type ManifestEntry = { webp: string; width: number; height: number };
const imageManifest = manifest as Record<string, ManifestEntry>;

/**
 * 로컬 이미지 경로를 R2 WebP URL로 변환
 * 매니페스트에 없으면 원본 경로 반환
 */
export function r2(localPath: string): string {
  const entry = imageManifest[localPath];
  if (entry) return entry.webp;
  // .png → .webp fallback
  const webpPath = localPath.replace(/\.(png|jpg|jpeg)$/i, ".webp");
  return `${R2_BASE}${webpPath}`;
}

/**
 * 이미지 dimensions 가져오기
 */
export function r2dims(localPath: string): {
  width: number;
  height: number;
} | null {
  const entry = imageManifest[localPath];
  return entry ? { width: entry.width, height: entry.height } : null;
}
