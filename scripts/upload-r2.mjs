import sharp from "sharp";
import { execSync } from "child_process";
import { globSync } from "glob";

const pngs = globSync("public/images/**/*.png");
console.log("Processing", pngs.length, "files");

for (const png of pngs) {
  const key = png.replace(/\\/g, "/").replace("public/", "").replace(/\.png$/i, ".webp");
  const tmpFile = "/tmp/upload.webp";

  await sharp(png).webp({ quality: 85 }).toFile(tmpFile);

  try {
    execSync(`npx wrangler r2 object put "kpecr2/${key}" --file ${tmpFile} --content-type image/webp`, {
      stdio: "pipe",
    });
    console.log("OK:", key);
  } catch (e) {
    console.error("FAIL:", key);
  }
}
console.log("Done!");
