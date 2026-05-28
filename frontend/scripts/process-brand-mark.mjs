/**
 * One-off processor: removes baked-in JPEG background via corner flood-fill.
 * Run: node scripts/process-brand-mark.mjs
 */
import sharp from "sharp";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const publicDir = path.join(__dirname, "..", "public");
const input = path.join(publicDir, "log.jpeg");
const outputPng = path.join(publicDir, "log.png");
const outputWebp = path.join(publicDir, "log.webp");

const COLOR_TOLERANCE = 42;

function colorDistance(r1, g1, b1, r2, g2, b2) {
  return Math.sqrt((r1 - r2) ** 2 + (g1 - g2) ** 2 + (b1 - b2) ** 2);
}

function sampleBackground(data, width, height) {
  const samples = [];
  const points = [
    [0, 0],
    [width - 1, 0],
    [0, height - 1],
    [width - 1, height - 1],
    [Math.floor(width / 2), 0],
    [0, Math.floor(height / 2)],
  ];
  for (const [x, y] of points) {
    const i = (y * width + x) * 4;
    samples.push([data[i], data[i + 1], data[i + 2]]);
  }
  const r = Math.round(samples.reduce((s, p) => s + p[0], 0) / samples.length);
  const g = Math.round(samples.reduce((s, p) => s + p[1], 0) / samples.length);
  const b = Math.round(samples.reduce((s, p) => s + p[2], 0) / samples.length);
  return [r, g, b];
}

function floodFillTransparent(data, width, height, bg) {
  const visited = new Uint8Array(width * height);
  const queue = [];

  const tryPush = (x, y) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const i = idx * 4;
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    if (colorDistance(r, g, b, bg[0], bg[1], bg[2]) <= COLOR_TOLERANCE) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < width; x += 1) {
    tryPush(x, 0);
    tryPush(x, height - 1);
  }
  for (let y = 0; y < height; y += 1) {
    tryPush(0, y);
    tryPush(width - 1, y);
  }

  while (queue.length > 0) {
    const idx = queue.pop();
    const x = idx % width;
    const y = Math.floor(idx / width);
    const i = idx * 4;
    data[i + 3] = 0;

    tryPush(x - 1, y);
    tryPush(x + 1, y);
    tryPush(x, y - 1);
    tryPush(x, y + 1);
  }
}

const { data, info } = await sharp(input).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
const pixels = new Uint8Array(data);
const bg = sampleBackground(pixels, info.width, info.height);
console.log("Background sample RGB:", bg.join(","));

floodFillTransparent(pixels, info.width, info.height, bg);

const transparentCount = [...pixels].filter((_, i) => i % 4 === 3 && pixels[i] === 0).length;
console.log("Transparent pixels:", transparentCount, "/", info.width * info.height);

await sharp(pixels, { raw: { width: info.width, height: info.height, channels: 4 } })
  .png({ compressionLevel: 9, adaptiveFiltering: true })
  .toFile(outputPng);

await sharp(outputPng).webp({ quality: 92, alphaQuality: 100 }).toFile(outputWebp);

console.log("Wrote", outputPng);
console.log("Wrote", outputWebp);
