import express from 'express';
import { getFlightsByAirport } from '../controllers/aviation.controller.js';

const router = express.Router();

router.get('/flights', getFlightsByAirport);

export default router;