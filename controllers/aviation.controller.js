import dotenv from 'dotenv';
dotenv.config({ debug: false });
import axios from 'axios';
const API_KEY = process.env.AVIATIONSTACK_KEY;
const BASE_URL = 'http://api.aviationstack.com/v1';


export const getFlightsByAirport = async (req, res) => {
  const { dep_iata, arr_iata, airline, arrival_after, arrival_before } = req.query;

  if (!API_KEY) {
    return res.status(500).json({ error: 'Missing AviationStack API key' });
  }

  if (!dep_iata && !arr_iata && !airline) {
    return res.status(400).json({ error: 'At least one query parameter is required (dep_iata, arr_iata, or airline)' });
  }

  const params = new URLSearchParams({ access_key: API_KEY });
  if (dep_iata) params.append('dep_iata', dep_iata.toUpperCase());
  if (arr_iata) params.append('arr_iata', arr_iata.toUpperCase());
  if (airline) params.append('airline_name', airline);

  try {
    const response = await axios.get(`${BASE_URL}/flights?${params.toString()}`);
    let flights = response.data.data;

    if (arrival_after || arrival_before) {
      const parseTime = (str) => {
        const ts = new Date(str).getTime();
        return isNaN(ts) ? null : ts;
      };

      const after = arrival_after ? parseTime(arrival_after) : null;
      const before = arrival_before ? parseTime(arrival_before) : null;

      flights = flights.filter(flight => {
        const arrival = flight.arrival?.estimated;
        const time = parseTime(arrival);
        if (!time) return false;
        return (!after || time >= after) && (!before || time <= before);
      });
    }

    const formatted = flights.map(flight => ({
      airline: flight.airline?.name,
      flight_number: flight.flight?.number,
      departure_airport: flight.departure?.iata,
      arrival_airport: flight.arrival?.iata,
      departure_time: flight.departure?.estimated,
      arrival_time: flight.arrival?.estimated,
      status: flight.flight_status
    }));

    res.json(formatted);
  } catch (error) {
    console.error('AviationStack API error:', error.response?.data || error.message);
    res.status(500).json({ error: 'Could not fetch flight data' });
  }
};