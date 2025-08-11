import { getAllRoutes, getAllStops, getAllTrips, getStopById, getRouteById, getTripById, getStopsByTrip, getTripsByStop, getNextArrivals } from './gtfs.controller.js';
import { getFlightsByAirport } from './aviation.controller.js';
import { parseStopIdFromQuery, parseAirportCode } from '../utils/parser.js';

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

export const handleVoiceQuery = (req, res) => {
  const { message } = req.body;

  if (!message || typeof message !== "string") {
    return res.status(400).json({ error: "Missing or invalid voice message" });
  }

  const lowerMessage = message.toLowerCase();
  const stopId = parseStopIdFromQuery(message);
  const airportCode = parseAirportCode(message);

  for (const [keyword, handler] of Object.entries(flightIntentMap)) {
    if (lowerMessage.includes(keyword)) {
      if (airportCode) req.query.dep_iata = airportCode;
      return handler(req, res);
    }
  }

  for (const [keyword, handler] of Object.entries(gtfsIntentMap)) {
    if (lowerMessage.includes(keyword)) {
      if (stopId) req.params.stop_id = stopId;
      return handler(req, res);
    }
  }

  return res.status(400).json({
    error: "Unable to determine query type or missing identifier",
    originalMessage: message
  });
};

export const detectQueryIntent = (message) => {
  const roadKeywords = [
    'bus', 'train', 'subway', 'transit', 'commute', 'station',
    'stop', 'gtfs', 'go transit', 'up express', 'rail'
  ];

  const flightKeywords = [
    'flight', 'airport', 'airline', 'plane', 'boarding', 'arrival',
    'departure', 'terminal', 'aviation'
  ];

  const lowerMessage = message.toLowerCase();
  const isRoad = roadKeywords.some(keyword => lowerMessage.includes(keyword));
  const isFlight = flightKeywords.some(keyword => lowerMessage.includes(keyword));

  if (isRoad && !isFlight) return 'road';
  if (isFlight && !isRoad) return 'flight';
  return 'unknown';
};