// server.js
import dotenv from 'dotenv';
dotenv.config({ debug: false });

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

import gtfsRoutes from './routes/gtfs.routes.js';
import aviationRoutes from './routes/aviation.routes.js';
import vapiWebhookRoutes from './routes/vapiWebhook.js';

const app = express();

// --- CORS + JSON ---
app.use(cors({ origin: '*', methods: ['GET', 'POST', 'OPTIONS'] }));
app.use(express.json());
app.options('*', cors());

// --- Optional health & debug endpoints ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

app.get('/health', (_, res) => res.json({ ok: true }));

app.get('/debug/gtfs-db', (req, res) => {
  const defaultPath = path.join(__dirname, 'data', 'gtfs.sqlite');
  const dbPath = process.env.GTFS_DB_PATH || defaultPath;
  res.json({
    dbPath,
    exists: fs.existsSync(dbPath)
  });
});

// --- Your APIs ---
app.use('/api/gtfs', gtfsRoutes);
app.use('/api/aviation', aviationRoutes);
app.use('/', vapiWebhookRoutes);

// --- Start server (Render-friendly) ---
const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});
