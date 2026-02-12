export type AssetSymbol = 'BTC' | 'ETH' | 'XRP';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

type CoinGeckoId = 'bitcoin' | 'ethereum' | 'ripple';

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

const ASSET_CONFIG: Record<AssetSymbol, { id: CoinGeckoId; name: string }> = {
  BTC: { id: 'bitcoin', name: 'Bitcoin' },
  ETH: { id: 'ethereum', name: 'Ethereum' },
  XRP: { id: 'ripple', name: 'XRP' }
};

const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

function timeframeToDays(timeframe: Timeframe): number {
  switch (timeframe) {
    case '1D':
      return 1;
    case '1W':
      return 7;
    case '1M':
      return 30;
    case '3M':
      return 90;
    case '1Y':
      return 365;
    default:
      return 30;
  }
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(message || `Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

interface CoinMarketItem {
  id: CoinGeckoId;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number;
  total_volume: number;
  market_cap: number;
}

interface CoinHistoryResponse {
  prices: [number, number][];
}

function toSymbol(id: CoinGeckoId): AssetSymbol {
  switch (id) {
    case 'bitcoin':
      return 'BTC';
    case 'ethereum':
      return 'ETH';
    case 'ripple':
      return 'XRP';
  }
}

function buildPrediction(symbol: AssetSymbol, timeframe: Timeframe, history: HistoricalCandle[]): PredictionResponse {
  const first = history[0]?.close ?? 0;
  const last = history.at(-1)?.close ?? 0;
  const momentum = first === 0 ? 0 : (last - first) / first;
  const projectedMove = momentum * 0.25;
  const predictedPriceUsd = Math.max(last * (1 + projectedMove), 0);
  const direction: PredictionResponse['direction'] =
    projectedMove > 0.005 ? 'up' : projectedMove < -0.005 ? 'down' : 'flat';

  return {
    symbol,
    horizon: timeframe,
    predictedPriceUsd,
    confidencePct: Math.min(Math.abs(momentum) * 100 + 55, 92),
    direction,
    lastModelRun: new Date().toISOString()
  };
}

async function getMarketSnapshotsFromApi(symbols: AssetSymbol[]): Promise<MarketSnapshot[]> {
  const params = new URLSearchParams({ symbols: symbols.join(',') });
  return request<MarketSnapshot[]>(`${API_BASE_URL}/markets?${params.toString()}`);
}

async function getHistoricalDataFromApi(symbol: AssetSymbol, timeframe: Timeframe): Promise<HistoricalCandle[]> {
  const params = new URLSearchParams({ symbol, timeframe });
  return request<HistoricalCandle[]>(`${API_BASE_URL}/history?${params.toString()}`);
}

async function getPredictionFromApi(symbol: AssetSymbol, timeframe: Timeframe): Promise<PredictionResponse> {
  const params = new URLSearchParams({ symbol, timeframe });
  return request<PredictionResponse>(`${API_BASE_URL}/prediction?${params.toString()}`);
}

export const apiClient = {
  async getMarketSnapshots(symbols: AssetSymbol[]) {
    try {
      return await getMarketSnapshotsFromApi(symbols);
    } catch {
      const ids = symbols.map((symbol) => ASSET_CONFIG[symbol].id).join(',');
      const marketData = await request<CoinMarketItem[]>(
        `${COINGECKO_BASE_URL}/coins/markets?vs_currency=usd&ids=${ids}&order=market_cap_desc&sparkline=false&price_change_percentage=24h`
      );

      return marketData.map((item) => ({
        symbol: toSymbol(item.id),
        name: item.name,
        priceUsd: item.current_price,
        change24hPct: item.price_change_percentage_24h ?? 0,
        volume24hUsd: item.total_volume,
        marketCapUsd: item.market_cap
      }));
    }
  },

  async getHistoricalData(symbol: AssetSymbol, timeframe: Timeframe) {
    try {
      return await getHistoricalDataFromApi(symbol, timeframe);
    } catch {
      const days = timeframeToDays(timeframe);
      const coinId = ASSET_CONFIG[symbol].id;
      const history = await request<CoinHistoryResponse>(
        `${COINGECKO_BASE_URL}/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=${days <= 30 ? 'hourly' : 'daily'}`
      );

      return history.prices.map(([timestamp, price]) => ({
        timestamp: new Date(timestamp).toISOString(),
        open: price,
        high: price,
        low: price,
        close: price
      }));
    }
  },

  async getPrediction(symbol: AssetSymbol, timeframe: Timeframe, history?: HistoricalCandle[]) {
    try {
      return await getPredictionFromApi(symbol, timeframe);
    } catch {
      const sourceHistory = history ?? (await this.getHistoricalData(symbol, timeframe));
      return buildPrediction(symbol, timeframe, sourceHistory);
    }
  }
};
