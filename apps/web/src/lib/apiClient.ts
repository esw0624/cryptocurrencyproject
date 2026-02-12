export type AssetSymbol = 'BTC' | 'ETH' | 'XRP';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface MarketSnapshot {
  symbol: AssetSymbol;
  name: string;
  priceUsd: number;
  change24hPct: number;
  volume24hUsd: number;
  marketCapUsd: number;
}

export interface HistoricalCandle {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
}

export interface PredictionResponse {
  symbol: AssetSymbol;
  horizon: string;
  predictedPriceUsd: number;
  confidencePct: number;
  direction: 'up' | 'down' | 'flat';
  lastModelRun: string;
}

const API_BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:3000';

async function request<T>(path: string): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const apiClient = {
  getMarketSnapshots: (symbols: AssetSymbol[]) =>
    request<MarketSnapshot[]>(`/api/markets?symbols=${symbols.join(',')}`),

  getHistoricalData: (symbol: AssetSymbol, timeframe: Timeframe) =>
    request<HistoricalCandle[]>(`/api/history?symbol=${symbol}&timeframe=${timeframe}`),

  getPrediction: (symbol: AssetSymbol, timeframe: Timeframe) =>
    request<PredictionResponse>(`/api/prediction?symbol=${symbol}&timeframe=${timeframe}`)
};
