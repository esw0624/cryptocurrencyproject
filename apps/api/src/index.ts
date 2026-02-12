import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import { z } from 'zod';
import type {
  IngestMarketDataRequest,
  PredictionRequest,
  PredictionResponse
} from '@crypto/shared';

dotenv.config();

const app = express();
const port = Number(process.env.PORT ?? 4000);

app.use(cors());
app.use(express.json());

const predictionSchema = z.object({
  symbol: z.string().min(1),
  horizonMinutes: z.number().int().positive().max(24 * 60)
});

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', service: 'api', timestamp: new Date().toISOString() });
});

app.post('/market-data/ingest', (req, res) => {
  const body = req.body as IngestMarketDataRequest;

  if (!Array.isArray(body?.points) || body.points.length === 0) {
    return res.status(400).json({ error: 'points array is required' });
  }

  return res.status(202).json({
    accepted: body.points.length,
    message: 'Market data accepted for processing.'
  });
});

app.post('/predict', (req, res) => {
  const parsed = predictionSchema.safeParse(req.body);

  if (!parsed.success) {
    return res.status(400).json({ error: parsed.error.flatten() });
  }

  const payload: PredictionRequest = parsed.data;

  const response: PredictionResponse = {
    symbol: payload.symbol.toUpperCase(),
    horizonMinutes: payload.horizonMinutes,
    predictedPriceUsd: 65000,
    confidence: 0.62,
    generatedAt: new Date().toISOString()
  };

  return res.json(response);
});

app.listen(port, () => {
  console.log(`API server listening on http://localhost:${port}`);
});
