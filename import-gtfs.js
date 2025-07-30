import { importGtfs } from 'gtfs';
import config from './gtfs-config.js';

importGtfs(config)
  .then(() => {
    console.log('GTFS import complete.');
  })
  .catch((error) => {
    console.log('Import failed:', error.message);
  });
