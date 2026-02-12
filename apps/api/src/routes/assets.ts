import { Router } from 'express';

import { AssetsResponseDto } from '../../../../packages/shared/src/dto';

const SUPPORTED_ASSETS: AssetsResponseDto['assets'] = [
  { symbol: 'BTC-USD', baseAsset: 'BTC', quoteAsset: 'USD', exchange: 'coinbase', status: 'active' },
  { symbol: 'ETH-USD', baseAsset: 'ETH', quoteAsset: 'USD', exchange: 'coinbase', status: 'active' },
  { symbol: 'SOL-USD', baseAsset: 'SOL', quoteAsset: 'USD', exchange: 'coinbase', status: 'active' },
];

export const assetsRouter = Router();

assetsRouter.get('/assets', (_req, res) => {
  const response: AssetsResponseDto = {
    assets: SUPPORTED_ASSETS,
  };

  return res.json(response);
});
