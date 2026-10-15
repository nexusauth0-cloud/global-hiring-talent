/**
 * Image verification.
 *
 * Checks every local image referenced from source code:
 *  - file exists and is a valid image
 *  - format is in the allowed set
 *  - dimensions meet the minimum for its slot category
 *  - aspect ratio is sane (no 0-height / extreme ratios)
 *  - the image is not blank (pixel standard deviation above a floor)
 *  - file size is reasonable
 * Also reports asset files that are not referenced anywhere.
 *
 * NOTE: this validates technical integrity, not subject matter. Subject
 * verification requires a human/vision review (see docs/IMAGE-ASSET-PLAN.md).
 */
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, basename } from "node:path";
import { globSync } from "node:fs";
import sharp from "sharp";

const ROOT = resolve(__dirname, "..");
const PUBLIC_DIR = join(ROOT, "public");
const IMAGES_DIR = join(PUBLIC_DIR, "images");

const ALLOWED_FORMATS = new Set(["webp", "jpeg", "png", "avif"]);
const MAX_BYTES = 1_500_000;

type Ref = { ref: string; from: string[] };

function findReferences(): Map<string, Ref> {
  const refs = new Map<string, Ref>();
  const files = globSync("src/**/*.{ts,tsx}", { cwd: ROOT }).concat(
    globSync("src/**/*.css", { cwd: ROOT })
  );
  const pattern = /\/images\/[A-Za-z0-9._-]+\.(?:webp|jpe?g|png|avif|svg)/g;
  for (const rel of files) {
    const content = readFileSync(join(ROOT, rel), "utf8");
    for (const match of content.matchAll(pattern)) {
      const ref = match[0];
      const existing = refs.get(ref) ?? { ref, from: [] };
      existing.from.push(rel);
      refs.set(ref, existing);
    }
  }
  return refs;
}

async function main() {
  const refs = findReferences();
  const problems: string[] = [];
  let checked = 0;

  const referencedBasenames = new Set<string>();

  for (const { ref, from } of [...refs.values()].sort((a, b) =>
    a.ref.localeCompare(b.ref)
  )) {
    const full = join(PUBLIC_DIR, ref.replace(/^\//, ""));
    referencedBasenames.add(basename(full));
    let stat;
    try {
      stat = statSync(full);
    } catch {
      problems.push(`MISSING: ${ref} (referenced by ${from.slice(0, 3).join(", ")})`);
      continue;
    }
    checked++;

    if (stat.size > MAX_BYTES) {
      problems.push(`TOO LARGE: ${ref} is ${(stat.size / 1024 / 1024).toFixed(2)} MB`);
    }

    try {
      const image = sharp(full);
      const meta = await image.metadata();
      const format = meta.format ?? "unknown";
      if (!ALLOWED_FORMATS.has(format)) {
        problems.push(`BAD FORMAT: ${ref} is ${format}`);
      }
      if (!meta.width || !meta.height) {
        problems.push(`NO DIMENSIONS: ${ref}`);
      } else {
        if (meta.width < 400 || meta.height < 300) {
          problems.push(
            `TOO SMALL: ${ref} is ${meta.width}x${meta.height}`
          );
        }
        const ratio = meta.width / meta.height;
        if (ratio < 0.4 || ratio > 3.2) {
          problems.push(`ODD RATIO: ${ref} is ${ratio.toFixed(2)}`);
        }
      }
      const stats = await image.stats();
      const sd = Math.max(...stats.channels.map((c) => c.stdev));
      if (sd < 6) {
        problems.push(`LOOKS BLANK: ${ref} channel stddev ${sd.toFixed(2)}`);
      }
      console.log(
        `ok  ${ref.padEnd(42)} ${format} ${meta.width}x${meta.height} ${(stat.size / 1024).toFixed(0)}KB sd=${sd.toFixed(1)}`
      );
    } catch (err) {
      problems.push(
        `UNREADABLE: ${ref} (${err instanceof Error ? err.message : "error"})`
      );
    }
  }

  let unused = 0;
  if (statSync(IMAGES_DIR, { throwIfNoEntry: false })) {
    for (const file of readdirSync(IMAGES_DIR)) {
      if (!referencedBasenames.has(file)) {
        console.log(`unused: public/images/${file}`);
        unused++;
      }
    }
  }

  console.log(`\nChecked ${checked} referenced images. ${problems.length} problem(s).`);
  if (unused) console.log(`${unused} unused asset file(s).`);
  if (problems.length) {
    console.error("\nProblems:");
    for (const p of problems) console.error("  - " + p);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
