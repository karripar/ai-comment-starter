import express from 'express';

import route from './routes/route';

import {MessageResponse} from '../types/MessageTypes';

const router = express.Router();

router.get<{}, MessageResponse>('/', (_req, res) => {
  res.json({
    message: 'routes: /ai',
  });
});

router.use('/ai', route);

export default router;
