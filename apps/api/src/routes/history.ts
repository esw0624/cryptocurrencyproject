import { Router } from 'express';

import { HistoryQueryDto, HistoryQuerySchema, HistoryResponseDto } from '../../../../packages/shared/src/dto';
import { validateQuery } from '../lib/http';

export const historyRouter = Router();

historyRouter.get('/history', validateQuery(HistoryQuerySchema), (req, res) => {
  const { symbol, interval, limit } = req.query as HistoryQueryDto;
  const now = Date.now();

  const data = Array.from({ length: limit }, (_, index) => {
    const offset = limit - index;
    const open = 50000 + offset * 7;
    const close = open + 12;

    return {
      timestamp: new Date(now - offset * 60 * 60 * 1000).toISOString(),
      open,
      high: close + 6,
      low: open - 5,
      close,
      volume: 100 + offset,
    };
  });

  const response: HistoryResponseDto = {
    symbol,
    interval,
    data,
  };

  return res.json(response);
});
