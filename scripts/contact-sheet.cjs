/* eslint-disable @typescript-eslint/no-require-imports */
const sharp = require("sharp");
const fs = require("fs");
const path = require("path");

const dir = path.join(__dirname, "..", "public", "images");
const files = fs
  .readdirSync(dir)
  .filter((f) => f.endsWith(".webp"))
  .sort();

const COLS = 3;
const CELL_W = 620;
const CELL_H = 400;
const LABEL_H = 34;
const rows = Math.ceil(files.length / COLS);

async function main() {
  const composites = [];
  for (let i = 0; i < files.length; i++) {
    const f = files[i];
    const buf = await sharp(path.join(dir, f))
      .resize(CELL_W - 20, CELL_H - LABEL_H - 10, { fit: "cover" })
      .jpeg()
      .toBuffer();
    const col = i % COLS;
    const row = Math.floor(i / COLS);
    const x = col * CELL_W;
    const y = row * CELL_H;
    composites.push({ input: buf, left: x + 10, top: y + LABEL_H });
    const svg = Buffer.from(
      `<svg width="${CELL_W}" height="${LABEL_H}"><rect width="100%" height="100%" fill="#0b2b4a"/><text x="10" y="23" font-family="Arial" font-size="20" fill="#fff">${i + 1}. ${f}</text></svg>`
    );
    composites.push({ input: svg, left: x, top: y });
  }

  await sharp({
    create: {
      width: COLS * CELL_W,
      height: rows * CELL_H,
      channels: 3,
      background: "#e2e8ee",
    },
  })
    .composite(composites)
    .jpeg({ quality: 70 })
    .toFile("/tmp/opencode/contact-sheet.jpg");

  console.log("wrote /tmp/opencode/contact-sheet.jpg", files.length, "tiles");
  files.forEach((f, i) => console.log(`${i + 1}. ${f}`));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
