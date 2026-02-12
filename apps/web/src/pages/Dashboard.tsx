import { useEffect, useMemo, useState } from 'react';
import { AssetSelector } from '../components/AssetSelector';
import { MarketCard } from '../components/MarketCard';
import { PredictionPanel } from '../components/PredictionPanel';
import { PriceChart } from '../components/PriceChart';
import { TimeframeControls } from '../components/TimeframeControls';
import { apiClient, type AssetSymbol, type HistoricalCandle, type MarketSnapshot, type PredictionResponse, type Timeframe } from '../lib/apiClient';

const TRACKED_ASSETS: AssetSymbol[] = ['BTC', 'ETH', 'XRP'];

export function Dashboard() {
  const [markets, setMarkets] = useState<MarketSnapshot[]>([]);
  const [history, setHistory] = useState<HistoricalCandle[]>([]);
  const [prediction, setPrediction] = useState<PredictionResponse | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<AssetSymbol>('BTC');
  const [timeframe, setTimeframe] = useState<Timeframe>('1M');
  const [chartMode, setChartMode] = useState<'line' | 'candlestick'>('line');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      setError(null);

      try {
        const [marketData, historicalData, predictionData] = await Promise.all([
          apiClient.getMarketSnapshots(TRACKED_ASSETS),
          apiClient.getHistoricalData(selectedAsset, timeframe),
          apiClient.getPrediction(selectedAsset, timeframe)
        ]);

        setMarkets(marketData);
        setHistory(historicalData);
        setPrediction(predictionData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load dashboard data.');
      } finally {
        setLoading(false);
      }
    }

    void loadData();
  }, [selectedAsset, timeframe]);

  const selectedMarket = useMemo(
    () => markets.find((market) => market.symbol === selectedAsset),
    [markets, selectedAsset]
  );

  return (
    <main className="dashboard">
      <nav className="top-nav">
        <div className="brand">Cipher Markets</div>
        <div className="top-nav__controls">
          <AssetSelector assets={TRACKED_ASSETS} selectedAsset={selectedAsset} onSelect={setSelectedAsset} />
          <TimeframeControls timeframe={timeframe} onChange={setTimeframe} />
        </div>
      </nav>

      {error && <div className="status status--error">{error}</div>}
      {loading && <div className="status">Loading live market data…</div>}

      {!loading && !error && (
        <>
          <section className="market-grid">
            {markets.map((market) => (
              <MarketCard key={market.symbol} market={market} />
            ))}
          </section>

          <section className="content-grid">
            <div>
              <div className="panel__header panel__header--inline">
                <h2>{selectedMarket?.name ?? selectedAsset} overview</h2>
                <div className="mode-toggle">
                  <button
                    className={`chip chip--small ${chartMode === 'line' ? 'chip--active' : ''}`}
                    onClick={() => setChartMode('line')}
                  >
                    Line
                  </button>
                  <button
                    className={`chip chip--small ${chartMode === 'candlestick' ? 'chip--active' : ''}`}
                    onClick={() => setChartMode('candlestick')}
                  >
                    Candlestick
                  </button>
                </div>
              </div>
              <PriceChart data={history} mode={chartMode} />
            </div>
            {prediction && <PredictionPanel prediction={prediction} />}
          </section>
        </>
      )}
    </main>
  );
}
