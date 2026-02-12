import { Area, AreaChart, CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
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

  return (
    <section className="panel">
      <div className="panel__header">
        <h3>Price Chart</h3>
        <span className="muted">{mode === 'line' ? 'Line' : 'Candlestick-like range'}</span>
      </div>
      <div className="chart-wrap">
        <ResponsiveContainer width="100%" height="100%">
          {mode === 'line' ? (
            <LineChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3344" />
              <XAxis dataKey="time" tick={{ fill: '#97a3b8' }} />
              <YAxis tick={{ fill: '#97a3b8' }} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <Line type="monotone" dataKey="close" stroke="#4f8cff" strokeWidth={2} dot={false} />
            </LineChart>
          ) : (
            <AreaChart data={points}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2c3344" />
              <XAxis dataKey="time" tick={{ fill: '#97a3b8' }} />
              <YAxis tick={{ fill: '#97a3b8' }} tickFormatter={(value) => `$${value}`} />
              <Tooltip formatter={(value) => formatter.format(Number(value))} />
              <Area type="monotone" dataKey="high" stroke="#1bc5a3" fill="#1bc5a322" />
              <Area type="monotone" dataKey="low" stroke="#ea5252" fill="#ea525222" />
            </AreaChart>
          )}
        </ResponsiveContainer>
      </div>
    </section>
  );
}
