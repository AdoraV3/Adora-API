import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';

// Resolve the path to gtfs.sqlite
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = process.env.GTFS_DB_PATH || path.join(__dirname, '..', 'gtfs.sqlite');

// Open database
const db = new Database(dbPath);

export const getAllRoutes = (req, res) => {
  try {
    const stmt = db.prepare(`
      SELECT * FROM routes WHERE agency_id IN ('GO', 'UPExpress')
    `);
    const routes = stmt.all();
    res.json(routes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRouteById = (req, res) => {
  const { route_id } = req.params;

  try {
    const stmt = db.prepare(`SELECT * FROM routes WHERE route_id = ?`);
    const route = stmt.get(route_id);

    if (!route) {
      return res.status(404).json({ error: 'Route not found' });
    }

    res.json(route);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getRoutesByAgency = (req, res) => {
  const { agency_id } = req.params;

  try {
    const stmt = db.prepare(`SELECT * FROM routes WHERE agency_id = ?`);
    const routes = stmt.all(agency_id);
    res.json(routes);
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
    const stops = stmt.all();
    res.json(stops);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getStopById = (req, res) => {
  const { stop_id } = req.params;

  try {
    const stmt = db.prepare(`SELECT * FROM stops WHERE stop_id = ?`);
    const stop = stmt.get(stop_id);

    if (!stop) {
      return res.status(404).json({ error: 'Stop not found' });
    }

    res.json(stop);
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
    const trips = stmt.all();
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getTripById = (req, res) => {
  const { trip_id } = req.params;

  try {
    const stmt = db.prepare(`SELECT * FROM trips WHERE trip_id = ?`);
    const trip = stmt.get(trip_id);

    if (!trip) {
      return res.status(404).json({ error: 'Trip not found' });
    }

    res.json(trip);
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
    const stops = stmt.all(trip_id);

    if (!stops.length) {
      return res.status(404).json({ error: 'No stops found for this trip' });
    }

    res.json(stops);
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

    const trips = stmt.all(stop_id);
    res.json(trips);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllAgencies = (req, res) => {
  try {
    const stmt = db.prepare(`SELECT * FROM agency`);
    const agencies = stmt.all();
    res.json(agencies);
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
    const arrivals = stmt.all(stop_id, currentTime);
    res.json(arrivals);
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

    const arrivals = stmt.all(stop_id);

    if (arrivals.length === 0) {
      return res.status(404).json({ error: 'No arrivals found for this stop' });
    }

    res.json(arrivals);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


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