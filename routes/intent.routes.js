import express from 'express';
import { handleVoiceQuery } from '../controllers/intent.controller.js';

const router = express.Router();

router.get('/', handleVoiceQuery);

export default router;