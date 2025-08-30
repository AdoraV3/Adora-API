// controllers/gtfs.controller.js
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Default location inside the repo: data/gtfs.sqlite
const defaultPath = path.join(__dirname, '..', 'data', 'gtfs.sqlite');

// Allow override via env (useful on Render, e.g. /opt/render/project/src/data/gtfs.sqlite)
const dbPath = process.env.GTFS_DB_PATH || defaultPath;

console.log('[GTFS] Using DB at:', dbPath);

// Fail fast if DB file is missing
if (!fs.existsSync(dbPath)) {
  throw new Error(`[GTFS] DB not found at ${dbPath}. Place data/gtfs.sqlite in your repo or set GTFS_DB_PATH.`);
}

// Open DB (readonly is safer in production)
const db = new Database(dbPath, { readonly: true });

// ---------- Handlers ----------

export const getAllRoutes = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM routes WHERE agency_id IN ('GO', 'UPExpress')
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRouteById = (req, res) => {
  const { route_id } = req.params;
  try {
    const stmt = db.prepare(`SELECT * FROM routes WHERE route_id = ?`);
    const row = stmt.get(route_id);
    if (!row) return res.status(404).json({ error: 'Route not found' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoutesByAgency = (req, res) => {
  const { agency_id } = req.params;
  try {
    const stmt = db.prepare(`SELECT * FROM routes WHERE agency_id = ?`);
    res.json(stmt.all(agency_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllStops = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT stops.*
      FROM stops
      JOIN stop_times ON stops.stop_id = stop_times.stop_id
      JOIN trips ON stop_times.trip_id = trips.trip_id
      JOIN routes ON trips.route_id = routes.route_id
      WHERE routes.agency_id IN ('GO', 'UPExpress')
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStopById = (req, res) => {
  const { stop_id } = req.params;
  try {
    const stmt = db.prepare(`SELECT * FROM stops WHERE stop_id = ?`);
    const row = stmt.get(stop_id);
    if (!row) return res.status(404).json({ error: 'Stop not found' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllTrips = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT trips.*
      FROM trips
      JOIN routes ON trips.route_id = routes.route_id
      WHERE routes.agency_id IN ('GO', 'UPExpress')
    `);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTripById = (req, res) => {
  const { trip_id } = req.params;
  try {
    const stmt = db.prepare(`SELECT * FROM trips WHERE trip_id = ?`);
    const row = stmt.get(trip_id);
    if (!row) return res.status(404).json({ error: 'Trip not found' });
    res.json(row);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStopsByTrip = (req, res) => {
  const { trip_id } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT s.*
      FROM stop_times st
      JOIN stops s ON st.stop_id = s.stop_id
      WHERE st.trip_id = ?
      ORDER BY st.stop_sequence
    `);
    const rows = stmt.all(trip_id);
    if (!rows.length) return res.status(404).json({ error: 'No stops found for this trip' });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTripsByStop = (req, res) => {
  const { stop_id } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT DISTINCT t.*
      FROM stop_times st
      JOIN trips t ON st.trip_id = t.trip_id
      WHERE st.stop_id = ?
    `);
    res.json(stmt.all(stop_id));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAgencies = (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM agency`);
    res.json(stmt.all());
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNextArrivals = (req, res) => {
  const { stop_id } = req.params;
  const now = new Date();
  const currentTime = now.toTimeString().split(' ')[0]; // HH:MM:SS
  try {
    const stmt = db.prepare(`
      SELECT st.*, t.trip_headsign, r.route_short_name, r.route_long_name
      FROM stop_times st
      JOIN trips t ON st.trip_id = t.trip_id
      JOIN routes r ON t.route_id = r.route_id
      WHERE st.stop_id = ? AND st.arrival_time > ?
        AND r.agency_id IN ('GO', 'UPExpress')
      ORDER BY st.arrival_time ASC
      LIMIT 10
    `);
    res.json(stmt.all(stop_id, currentTime));
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getNextArrivalsByStopId = (req, res) => {
  const { stop_id } = req.params;
  try {
    const stmt = db.prepare(`
      SELECT st.*, t.route_id, t.service_id
      FROM stop_times st
      JOIN trips t ON st.trip_id = t.trip_id
      WHERE st.stop_id = ?
        AND st.arrival_time != ''
      ORDER BY st.arrival_time
      LIMIT 10
    `);
    const rows = stmt.all(stop_id);
    if (rows.length === 0) return res.status(404).json({ error: 'No arrivals found for this stop' });
    res.json(rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// (Optional export kept from your original)
export const gtfsIntentMap = {
  'all routes': getAllRoutes,
  'routes by agency': getRoutesByAgency,
  'route': getRouteById,
  'all stops': getAllStops,
  'stop': getStopById,
  'all trips': getAllTrips,
  'trip': getTripById,
  'stops by trip': getStopsByTrip,
  'trips by stop': getTripsByStop,
  'agencies': getAllAgencies,
  'next arrivals': getNextArrivals,
  'next arrivals by stop': getNextArrivalsByStopId
};
