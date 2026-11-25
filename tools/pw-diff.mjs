import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const OUT_DIR = path.join(ROOT, 'eval-out', 'pw-audit');

const metrics = JSON.parse(fs.readFileSync(path.join(OUT_DIR, 'metrics.json'), 'utf8'));
const summary = [];

for (const item of metrics) {
  const rPath = path.join(OUT_DIR, `${item.name}-remote.png`);
  const lPath = path.join(OUT_DIR, `${item.name}-local.png`);
  const dPath = path.join(OUT_DIR, `${item.name}-diff.png`);

  const imgR = PNG.sync.read(fs.readFileSync(rPath));
  const imgL = PNG.sync.read(fs.readFileSync(lPath));
  const width = Math.max(imgR.width, imgL.width);
  const height = Math.max(imgR.height, imgL.height);

  const normR = new PNG({ width, height });
  const normL = new PNG({ width, height });
  normR.data.fill(255);
  normL.data.fill(255);

  for (let y = 0; y < imgR.height; y++) {
    imgR.data.copy(normR.data, y * width * 4, y * imgR.width * 4, (y + 1) * imgR.width * 4);
  }
  for (let y = 0; y < imgL.height; y++) {
    imgL.data.copy(normL.data, y * width * 4, y * imgL.width * 4, (y + 1) * imgL.width * 4);
  }

  const diff = new PNG({ width, height });
  const diffPixels = pixelmatch(normR.data, normL.data, diff.data, width, height, {
    threshold: 0.12,
    diffColor: [255, 0, 128],
    alpha: 0.75,
  });
  fs.writeFileSync(dPath, PNG.sync.write(diff));

  const bands = [];
  for (let y0 = 0; y0 < height; y0 += 900) {
    const bh = Math.min(900, height - y0);
    const sR = normR.data.subarray(y0 * width * 4, (y0 + bh) * width * 4);
    const sL = normL.data.subarray(y0 * width * 4, (y0 + bh) * width * 4);
    const bd = pixelmatch(sR, sL, null, width, bh, { threshold: 0.12 });
    bands.push({ y: `${y0}-${y0 + bh}`, pct: Number(((bd / (width * bh)) * 100).toFixed(2)) });
  }

  const headingDiffs = [];
  const maxH = Math.max(item.remote.headings.length, item.local.headings.length);
  for (let i = 0; i < maxH; i++) {
    const rh = item.remote.headings[i];
    const lh = item.local.headings[i];
    if (!rh || !lh) {
      headingDiffs.push({ i, remote: rh?.text ?? null, local: lh?.text ?? null });
      continue;
    }
    const diffs = {};
    for (const k of ['text', 'fontSize', 'fontWeight', 'lineHeight', 'letterSpacing', 'h', 'y']) {
      if (rh[k] !== lh[k]) {
        if ((k === 'y' || k === 'h') && Math.abs(Number(rh[k]) - Number(lh[k])) <= 6) continue;
        diffs[k] = { r: rh[k], l: lh[k] };
      }
    }
    if (Object.keys(diffs).length > 0) headingDiffs.push({ i, tag: rh.tag, text: rh.text, diffs });
  }

  const mismatchPct = Number(((diffPixels / (width * height)) * 100).toFixed(2));
  const topBandPct = bands[0]?.pct ?? 0;
  const worstBands = [...bands].sort((a, b) => b.pct - a.pct).slice(0, 3);

  const row = {
    route: item.route,
    name: item.name,
    remoteH: imgR.height,
    localH: imgL.height,
    deltaH: imgL.height - imgR.height,
    mismatchPct,
    topBandPct,
    worstBands,
    nav: `${item.remote.navLinks.length}/${item.local.navLinks.length}`,
    basketBodyOp: `${item.remote.basketInfo.bodyOpacityAttr}/${item.local.basketInfo.bodyOpacityAttr}`,
    headingDiffCount: headingDiffs.length,
    headingDiffs: headingDiffs.slice(0, 8),
    consoleErrors: item.localConsoleErrors.length,
    failedRequests: item.localFailedRequests.length,
  };
  summary.push(row);
  console.log(
    `${row.route.padEnd(28)} | H: ${row.remoteH}/${row.localH} (${row.deltaH >= 0 ? '+' : ''}${row.deltaH}) | Full: ${String(row.mismatchPct).padStart(5)}% | Top900: ${String(row.topBandPct).padStart(5)}% | HDiffs: ${row.headingDiffCount} | Nav: ${row.nav} | Basket: ${row.basketBodyOp} | Err: ${row.consoleErrors}/${row.failedRequests}`
  );
}

fs.writeFileSync(path.join(OUT_DIR, 'summary.json'), JSON.stringify(summary, null, 2));
