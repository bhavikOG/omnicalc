import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

/**
 * Generates valid, standards-compliant PNG icons of exact dimensions (180x180, 192x192, 512x512)
 * using Node's built-in zlib so iOS Safari, Android maskable icons, and Chromium PWA checks pass
 * without requiring native binary dependencies.
 */
function crc32(buf: Buffer): number {
  let c = 0xffffffff;
  for (let i = 0; i < buf.length; i++) {
    c ^= buf[i];
    for (let k = 0; k < 8; k++) {
      c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    }
  }
  return (c ^ 0xffffffff) >>> 0;
}

function makeChunk(type: string, data: Buffer): Buffer {
  const len = Buffer.alloc(4);
  len.writeUInt32BE(data.length, 0);
  const typeBuf = Buffer.from(type, 'ascii');
  const crcInput = Buffer.concat([typeBuf, data]);
  const crcBuf = Buffer.alloc(4);
  crcBuf.writeUInt32BE(crc32(crcInput), 0);
  return Buffer.concat([len, typeBuf, data, crcBuf]);
}

function createOmniCalcPng(size: number, isMaskable: boolean): Buffer {
  const signature = Buffer.from([137, 80, 78, 71, 13, 10, 26, 10]);

  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(size, 0);
  ihdr.writeUInt32BE(size, 4);
  ihdr[8] = 8; // bit depth
  ihdr[9] = 6; // RGBA
  ihdr[10] = 0;
  ihdr[11] = 0;
  ihdr[12] = 0;

  // Render an indigo gradient background with a crisp white calculator emblem inside the safe zone
  const rawData = Buffer.alloc(size * (size * 4 + 1));
  const margin = isMaskable ? Math.floor(size * 0.22) : Math.floor(size * 0.16);
  const innerMin = margin;
  const innerMax = size - margin;
  const borderThickness = Math.max(4, Math.floor(size * 0.04));

  for (let y = 0; y < size; y++) {
    const rowStart = y * (size * 4 + 1);
    rawData[rowStart] = 0; // filter type 0

    for (let x = 0; x < size; x++) {
      const px = rowStart + 1 + x * 4;
      const t = (x + y) / (2 * size);
      // Indigo-600 (#4f46e5) to Slate-900 (#1e1b4b)
      let r = Math.round(79 * (1 - t) + 30 * t);
      let g = Math.round(70 * (1 - t) + 27 * t);
      let b = Math.round(229 * (1 - t) + 75 * t);

      const inBox = x >= innerMin && x <= innerMax && y >= innerMin && y <= innerMax;
      if (inBox) {
        const onOuterFrame =
          x - innerMin < borderThickness ||
          innerMax - x < borderThickness ||
          y - innerMin < borderThickness ||
          innerMax - y < borderThickness;
        const onCrossbar =
          Math.abs(x - Math.floor(size / 2)) < Math.max(2, Math.floor(borderThickness * 0.45)) ||
          Math.abs(y - Math.floor(size / 2)) < Math.max(2, Math.floor(borderThickness * 0.45));

        if (onOuterFrame) {
          r = 255;
          g = 255;
          b = 255;
        } else if (onCrossbar) {
          r = 165;
          g = 180;
          b = 252;
        }
      }

      rawData[px] = r;
      rawData[px + 1] = g;
      rawData[px + 2] = b;
      rawData[px + 3] = 255;
    }
  }

  const compressed = zlib.deflateSync(rawData);
  return Buffer.concat([
    signature,
    makeChunk('IHDR', ihdr),
    makeChunk('IDAT', compressed),
    makeChunk('IEND', Buffer.alloc(0)),
  ]);
}

const publicDir = path.resolve(process.cwd(), 'public');
fs.mkdirSync(publicDir, { recursive: true });

fs.writeFileSync(path.join(publicDir, 'apple-touch-icon.png'), createOmniCalcPng(180, false));
fs.writeFileSync(path.join(publicDir, 'pwa-192x192.png'), createOmniCalcPng(192, false));
fs.writeFileSync(path.join(publicDir, 'pwa-512x512.png'), createOmniCalcPng(512, false));
fs.writeFileSync(path.join(publicDir, 'pwa-maskable-512x512.png'), createOmniCalcPng(512, true));

console.log('[OmniCalc PWA] Generated apple-touch-icon.png, pwa-192x192.png, pwa-512x512.png, and pwa-maskable-512x512.png');
