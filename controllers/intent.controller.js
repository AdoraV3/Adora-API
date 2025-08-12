import {
  getAllRoutes,
  getAllStops,
  getAllTrips,
  getStopById,
  getRouteById,
  getTripById,
  getStopsByTrip,
  getTripsByStop,
  getNextArrivals
} from './gtfs.controller.js';

import { getFlightsByAirport } from './aviation.controller.js';
import { parseStopIdFromQuery, parseAirportCode } from '../utils/parser.js';
import { detectQueryIntent } from '../utils/detectQueryIntent.js';

const gtfsIntentMap = {
  route: getAllRoutes,
  stop: getAllStops,
  trip: getAllTrips,
  next: getNextArrivals,
  arrival: getNextArrivals,
  station: getAllStops,
  terminal: getAllStops
};

const flightIntentMap = {
  flight: getFlightsByAirport,
  airline: getFlightsByAirport,
  airport: getFlightsByAirport,
  air: getFlightsByAirport
};

function findHandler(message, intentMap) {
  const lowerMsg = message.toLowerCase();
  for (const [keyword, handler] of Object.entries(intentMap)) {
    if (lowerMsg.includes(keyword)) {
      return handler;
    }
  }
  return null;
}

export const handleVoiceQuery = (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Missing or invalid voice message' });
  }

  const intentType = detectQueryIntent(message);
  const stopId = parseStopIdFromQuery(message);
  const airportCode = parseAirportCode(message);

  try {
    if (intentType === 'flight') {
      const handler = findHandler(message, flightIntentMap) || getFlightsByAirport;

      if (airportCode) {
        req.query.dep_iata = airportCode;
      }

      return handler(req, res);
    }

    if (intentType === 'road') {
      const handler = findHandler(message, gtfsIntentMap) || getAllStops;

      if (stopId) {
        req.params.stop_id = stopId;
      }

      return handler(req, res);
    }

    return res.status(400).json({
      error: 'Unable to determine query type',
      originalMessage: message
    });

  } catch (err) {
    console.error('Error handling voice query:', err);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
