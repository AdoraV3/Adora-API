// scripts/import-gtfs.mjs
import { importGtfs } from 'gtfs';
import fs from 'fs';

const CONFIG_PATH = './gtfs-config.json';

if (!fs.existsSync(CONFIG_PATH)) {
  console.error(`[error] ${CONFIG_PATH} not found. Create it in your project root.`);
  process.exit(1);
}

const raw = fs.readFileSync(CONFIG_PATH, 'utf8');
const config = JSON.parse(raw);

// Make sure output folder exists (importGtfs will create file)
const outDir = (config.sqlitePath || 'data/gtfs.sqlite').split('/').slice(0, -1).join('/');
if (outDir && !fs.existsSync(outDir)) {
  fs.mkdirSync(outDir, { recursive: true });
}

console.log('[start] Importing GTFS with config:', CONFIG_PATH);
console.log('[info] Output DB:', config.sqlitePath);

try {
  await importGtfs(config);
  console.log('[done] GTFS import complete.');
} catch (err) {
  console.error('[error] GTFS import failed:', err?.message || err);
  process.exit(1);
}
