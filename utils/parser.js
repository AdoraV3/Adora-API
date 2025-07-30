export function parseStopIdFromQuery(query) {
  const match = query.match(/stop\s+(\d{2,6})/i);
  return match ? match[1] : null;
}

export function parseAirportCode(query) {
  const match = query.match(/\b([A-Z]{3})\b/i);
  return match ? match[1].toUpperCase() : null;
}
