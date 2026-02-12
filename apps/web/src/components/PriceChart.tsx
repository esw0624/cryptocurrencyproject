import { Area, AreaChart, CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { HistoricalCandle } from '../lib/apiClient';

interface PriceChartProps {
  data: HistoricalCandle[];
  mode: 'line' | 'candlestick';
}

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 2
});

export function PriceChart({ data, mode }: PriceChartProps) {
  const points = data.map((item) => ({
    time: new Date(item.timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }),
    close: item.close,
    high: item.high,
    low: item.low
  }));

  const latest = points.at(-1)?.close ?? 0;

  return (
    <section className="panel">
      <div className="panel__header">
        <h3>Price Chart</h3>
        <span className="muted">{mode === 'line' ? 'Momentum view' : 'Volatility range view'}</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'line' ? (
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3344" />
              <XAxis dataKey="time" tick={{ fill: '#97a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#97a3b8', fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <ReferenceLine y={latest} stroke="#5a6d94" strokeDasharray="4 4" />
              <Line type="monotone" dataKey="close" stroke="#7f8bff" strokeWidth={2.3} dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3344" />
              <XAxis dataKey="time" tick={{ fill: '#97a3b8', fontSize: 12 }} />
              <YAxis tick={{ fill: '#97a3b8', fontSize: 12 }} tickFormatter={(value) => `$${Number(value).toLocaleString()}`} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <Area type="monotone" dataKey="high" stroke="#14d8b3" fill="#14d8b326" strokeWidth={2} />
              <Area type="monotone" dataKey="low" stroke="#ff6d8a" fill="#ff6d8a24" strokeWidth={2} />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
