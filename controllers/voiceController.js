import axios from 'axios';
import { detectQueryIntent } from '../utils/detectQueryIntent.js';

export const handleVoiceQuery = async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    const intent = detectQueryIntent(message);

    if (intent === 'road') {
      return res.json({ type: 'road', message: 'GTFS query would run here' });

    } else if (intent === 'flight') {
      const dep_iata = 'YYZ';
      const apiKey = process.env.AVIATIONSTACK_API_KEY;

      const flightRes = await axios.get('http://api.aviationstack.com/v1/flights', {
        params: {
          access_key: apiKey,
          dep_iata,
        },
      });

      return res.json({
        type: 'flight',
        data: flightRes.data
      });

    } else {
      return res.json({ type: 'unknown', message: 'Could not detect intent' });
    }
  } catch (error) {
    console.error(error.message);
    return res.status(500).json({ error: 'Internal server error' });
  }
};
