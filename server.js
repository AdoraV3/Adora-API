import dotenv from 'dotenv';
dotenv.config({ debug: false });

import express from 'express';
import gtfsRoutes from './routes/gtfs.routes.js';
import aviationRoutes from './routes/aviation.routes.js';
import intentRoutes from './routes/intent.routes.js';

const app = express();

app.use(express.json());
app.use('/api/gtfs', gtfsRoutes);
app.use('/api/aviation', aviationRoutes);
app.use('/intent', intentRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
