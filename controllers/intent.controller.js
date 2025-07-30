import { getAllRoutes, getAllStops, getAllTrips, getStopById, getRouteById, getTripById, getStopsByTrip, getTripsByStop, getNextArrivals } from './gtfs.controller.js';
import { getFlightsByAirport } from './aviation.controller.js';
import { parseStopIdFromQuery, parseAirportCode } from '../utils/parser.js';

// Map keywords to their GTFS-related handlers
const gtfsIntentMap = {
  route: getAllRoutes,
  stop: getAllStops,
  trip: getAllTrips,
  next: getNextArrivals,
  arrival: getNextArrivals,
  station: getAllStops,
  terminal: getAllStops
};

// Map keywords to their AviationStack-related handlers
const flightIntentMap = {
  flight: getFlightsByAirport,
  airline: getFlightsByAirport,
  airport: getFlightsByAirport,
  air: getFlightsByAirport
};

// Main function to handle voice query based on detected keywords and parsed IDs
export const handleVoiceQuery = (req, res) => {
  const { query } = req.query;

  if (!query) {
    return res.status(400).json({ error: 'Missing query parameter' });
  }

  const lowerQuery = query.toLowerCase();
  const stopId = parseStopIdFromQuery(query);
  const airportCode = parseAirportCode(query);

  for (const [keyword, handler] of Object.entries(flightIntentMap)) {
    if (lowerQuery.includes(keyword)) {
      if (airportCode) req.query.dep_iata = airportCode;
      return handler(req, res);
    }
  }

  for (const [keyword, handler] of Object.entries(gtfsIntentMap)) {
    if (lowerQuery.includes(keyword)) {
      if (stopId) req.params.stop_id = stopId;
      return handler(req, res);
    }
  }

  return res.status(400).json({ error: 'Unable to determine query type or missing identifier' });
};

// Pure intent classifier for logging or routing (optional)
export const detectQueryIntent = (query) => {
  const roadKeywords = [
    'bus', 'train', 'subway', 'transit', 'commute', 'station',
    'stop', 'gtfs', 'go transit', 'up express', 'rail'
  ];

  const flightKeywords = [
    'flight', 'airport', 'airline', 'plane', 'boarding', 'arrival',
    'departure', 'terminal', 'aviation'
  ];

  const lowerQuery = query.toLowerCase();
  const isRoad = roadKeywords.some(keyword => lowerQuery.includes(keyword));
  const isFlight = flightKeywords.some(keyword => lowerQuery.includes(keyword));

  if (isRoad && !isFlight) return 'road';
  if (isFlight && !isRoad) return 'flight';
  return 'unknown';
};