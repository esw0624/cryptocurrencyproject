import { Router } from 'express';

import {
  PredictionsQueryDto,
  PredictionsQuerySchema,
  PredictionsResponseDto,
} from '../../../../packages/shared/src/dto';
import { validateQuery } from '../lib/http';

export const predictionsRouter = Router();

predictionsRouter.get('/predictions', validateQuery(PredictionsQuerySchema), (req, res) => {
  const { symbol, horizon } = req.query as PredictionsQueryDto;
  const now = Date.now();

  const predictions = Array.from({ length: horizon }, (_, index) => ({
    timestamp: new Date(now + (index + 1) * 60 * 60 * 1000).toISOString(),
    predictedPrice: 52000 + index * 32,
    confidence: Number(Math.max(0.4, 0.92 - index * 0.01).toFixed(2)),
  }));

  const response: PredictionsResponseDto = {
    symbol,
    horizon,
    predictions,
  };

  return res.json(response);
});
