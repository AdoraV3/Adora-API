import express from 'express';
import { getAllAgencies, getAllRoutes, getAllStops, getAllTrips, getNextArrivals, getNextArrivalsByStopId, getRouteById, getRoutesByAgency, getStopById, getStopsByTrip, getTripById, getTripsByStop } from '../controllers/gtfs.controller.js';

const router = express.Router();

//Routes
router.get('/routes', getAllRoutes);
router.get('/routes/:route_id', getRouteById);
router.get('/agency/:agency_id/routes', getRoutesByAgency);


//Agencies
router.get('/agencies', getAllAgencies);

//Stops
router.get('/stops', getAllStops);
router.get('/stops/:stop_id', getStopById);
router.get('/stops/:stop_id/trips', getTripsByStop);

//Trips
router.get('/trips', getAllTrips);
router.get('/trips/:trip_id', getTripById);
router.get('/trips/:trip_id/stops', getStopsByTrip);

//Next arrivals at a stop
router.get('/stops/:stop_id/arrivals', getNextArrivals);
router.get('/stops/:stop_id/next-arrivals', getNextArrivalsByStopId);

export default router;
