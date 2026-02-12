export type AssetSymbol = 'BTC' | 'ETH' | 'XRP';
export type Timeframe = '1D' | '1W' | '1M' | '3M' | '1Y';

type BinanceSymbol = 'BTCUSDT' | 'ETHUSDT' | 'XRPUSDT';
type CoinGeckoAssetId = 'bitcoin' | 'ethereum' | 'ripple';

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

const ASSET_CONFIG: Record<AssetSymbol, { ticker: BinanceSymbol; name: string }> = {
  BTC: { ticker: 'BTCUSDT', name: 'Bitcoin' },
  ETH: { ticker: 'ETHUSDT', name: 'Ethereum' },
  XRP: { ticker: 'XRPUSDT', name: 'XRP' }
};

const BINANCE_BASE_URL = 'https://api.binance.com/api/v3';
const COINGECKO_BASE_URL = 'https://api.coingecko.com/api/v3';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000/api';

function requestError(response: Response, body: string) {
  if (body) {
    try {
      const parsed = JSON.parse(body) as { msg?: string };
      if (parsed.msg) return parsed.msg;
    } catch {
      // Ignore parse failures and fall back to raw text.
    }
  }

  return body || `Request failed with ${response.status}`;
}

async function request<T>(url: string): Promise<T> {
  const response = await fetch(url);
  if (!response.ok) {
    const message = await response.text();
    throw new Error(requestError(response, message));
  }
  return response.json() as Promise<T>;
}

interface BinanceTicker24h {
  symbol: BinanceSymbol;
  lastPrice: string;
  priceChangePercent: string;
  quoteVolume: string;
}

interface CoinGeckoMarket {
  id: CoinGeckoAssetId;
  current_price: number;
  price_change_percentage_24h_in_currency: number | null;
  total_volume: number;
  market_cap: number;
}

interface CoinGeckoMarketChart {
  prices: [number, number][];
}

type BinanceKline = [
  number,
  string,
  string,
  string,
  string,
  string,
  number,
  string,
  number,
  string,
  string,
  string
];

function toAssetSymbol(ticker: BinanceSymbol): AssetSymbol {
  switch (ticker) {
    case 'BTCUSDT':
      return 'BTC';
    case 'ETHUSDT':
      return 'ETH';
    case 'XRPUSDT':
      return 'XRP';
  }
}

function toCoinGeckoAssetId(symbol: AssetSymbol): CoinGeckoAssetId {
  switch (symbol) {
    case 'BTC':
      return 'bitcoin';
    case 'ETH':
      return 'ethereum';
    case 'XRP':
      return 'ripple';
  }
}

function fromCoinGeckoAssetId(assetId: CoinGeckoAssetId): AssetSymbol {
  switch (assetId) {
    case 'bitcoin':
      return 'BTC';
    case 'ethereum':
      return 'ETH';
    case 'ripple':
      return 'XRP';
  }
}

function toBinanceTimeframe(timeframe: Timeframe): { interval: string; limit: number } {
  switch (timeframe) {
    case '1D':
      return { interval: '5m', limit: 288 };
    case '1W':
      return { interval: '1h', limit: 168 };
    case '1M':
      return { interval: '4h', limit: 180 };
    case '3M':
      return { interval: '12h', limit: 180 };
    case '1Y':
      return { interval: '1d', limit: 365 };
    default:
      return { interval: '4h', limit: 180 };
  }
}

function toCoinGeckoDays(timeframe: Timeframe): string {
  switch (timeframe) {
    case '1D':
      return '1';
    case '1W':
      return '7';
    case '1M':
      return '30';
    case '3M':
      return '90';
    case '1Y':
      return '365';
    default:
      return '30';
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

async function getMarketSnapshotsFromBinance(symbols: AssetSymbol[]): Promise<MarketSnapshot[]> {
  const tickers = symbols.map((symbol) => ASSET_CONFIG[symbol].ticker);
  const query = encodeURIComponent(JSON.stringify(tickers));
  const marketData = await request<BinanceTicker24h[]>(`${BINANCE_BASE_URL}/ticker/24hr?symbols=${query}`);

  return marketData.map((item) => {
    const symbol = toAssetSymbol(item.symbol);
    return {
      symbol,
      name: ASSET_CONFIG[symbol].name,
      priceUsd: Number(item.lastPrice),
      change24hPct: Number(item.priceChangePercent),
      volume24hUsd: Number(item.quoteVolume),
      marketCapUsd: 0
    };
  });
}

async function getMarketSnapshotsFromCoinGecko(symbols: AssetSymbol[]): Promise<MarketSnapshot[]> {
  const ids = symbols.map(toCoinGeckoAssetId).join(',');
  const params = new URLSearchParams({
    vs_currency: 'usd',
    ids,
    price_change_percentage: '24h'
  });

  const marketData = await request<CoinGeckoMarket[]>(`${COINGECKO_BASE_URL}/coins/markets?${params.toString()}`);

  return marketData.map((item) => {
    const symbol = fromCoinGeckoAssetId(item.id);
    return {
      symbol,
      name: ASSET_CONFIG[symbol].name,
      priceUsd: item.current_price,
      change24hPct: item.price_change_percentage_24h_in_currency ?? 0,
      volume24hUsd: item.total_volume,
      marketCapUsd: item.market_cap
    };
  });
}

async function getHistoricalDataFromBinance(symbol: AssetSymbol, timeframe: Timeframe): Promise<HistoricalCandle[]> {
  const coinTicker = ASSET_CONFIG[symbol].ticker;
  const { interval, limit } = toBinanceTimeframe(timeframe);
  const history = await request<BinanceKline[]>(
    `${BINANCE_BASE_URL}/klines?symbol=${coinTicker}&interval=${interval}&limit=${limit}`
  );

  return history.map((candle) => ({
    timestamp: new Date(candle[0]).toISOString(),
    open: Number(candle[1]),
    high: Number(candle[2]),
    low: Number(candle[3]),
    close: Number(candle[4])
  }));
}

async function getHistoricalDataFromCoinGecko(symbol: AssetSymbol, timeframe: Timeframe): Promise<HistoricalCandle[]> {
  const assetId = toCoinGeckoAssetId(symbol);
  const params = new URLSearchParams({
    vs_currency: 'usd',
    days: toCoinGeckoDays(timeframe)
  });

  const history = await request<CoinGeckoMarketChart>(
    `${COINGECKO_BASE_URL}/coins/${assetId}/market_chart?${params.toString()}`
  );

  return history.prices.map(([timestamp, price]) => ({
    timestamp: new Date(timestamp).toISOString(),
    open: price,
    high: price,
    low: price,
    close: price
  }));
}

export const apiClient = {
  async getMarketSnapshots(symbols: AssetSymbol[]) {
    try {
      return await getMarketSnapshotsFromApi(symbols);
    } catch {
      try {
        return await getMarketSnapshotsFromBinance(symbols);
      } catch {
        return getMarketSnapshotsFromCoinGecko(symbols);
      }
    }
  },

  async getHistoricalData(symbol: AssetSymbol, timeframe: Timeframe) {
    try {
      return await getHistoricalDataFromApi(symbol, timeframe);
    } catch {
      try {
        return await getHistoricalDataFromBinance(symbol, timeframe);
      } catch {
        return getHistoricalDataFromCoinGecko(symbol, timeframe);
      }
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
