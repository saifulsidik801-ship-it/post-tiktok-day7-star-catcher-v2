// post-tiktok-day-one-day-seven-20261123-0327 — entry program.
// The entry is the video itself (see VIDEO.json); this program only hands
// VIDEO.json to the grader by copying it into the output directory.
import { copyFileSync, existsSync, mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = dirname(fileURLToPath(import.meta.url));
const source = join(repoRoot, "VIDEO.json");
const outDir = process.env.MAKEFUN_OUTPUT_DIR ?? "/output";
const target = join(outDir, "VIDEO.json");

function readVideoUrl(): string {
  const raw = readFileSync(source, "utf8");
  const data = JSON.parse(raw) as { url?: unknown };
  if (typeof data.url !== "string" || data.url.length === 0) {
    throw new Error("VIDEO.json has no url string");
  }
  return data.url;
}

function main(): void {
  const url = readVideoUrl();
  mkdirSync(outDir, { recursive: true });
  copyFileSync(source, target);
  if (!existsSync(target)) {
    throw new Error("VIDEO.json was not copied to the output directory");
  }
  console.log(`VIDEO.json copied to ${target} (${url})`);
}

main();
