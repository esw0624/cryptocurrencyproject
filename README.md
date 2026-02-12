# Cryptocurrency Project

## Baseline ML pipeline (`apps/api/src/ml`)

This repository includes a baseline, time-series-aware ML pipeline for cryptocurrency return forecasting.

### Interfaces

- `trainModel(asset, timeframe)`
  - Loads historical candles from `data/candles/<asset>_<timeframe>.json` (also accepts `-` or `.` separator variants).
  - Builds features from price history.
  - Splits train/validation strictly by time (80/20) with no shuffling.
  - Trains a baseline linear regression model.
  - Computes validation metrics: MAE, RMSE, directional accuracy.
  - Persists the training run in `model_runs/<run_id>.json`.

- `predict(asset, horizon)`
  - Loads the latest trained model for an asset from `model_runs`.
  - Generates the most recent feature vector from candles.
  - Predicts a compounded return over `horizon` steps.
  - Persists prediction output in `predictions/<prediction_id>.json`.

### Feature engineering

The current baseline uses:

- Close-price lags (`lagClose1`, `lagClose2`, `lagClose3`)
- Short returns (`ret1`, `ret3`)
- Moving averages (`ma5`, `ma10`)
- Rolling volatility (`vol5`, standard deviation of recent returns)

### Expected candle format

`data/candles/*.json` should contain an array of candle objects:

```json
[
  {
    "timestamp": "2024-01-01T00:00:00Z",
    "open": 42000,
    "high": 42100,
    "low": 41800,
    "close": 41950,
    "volume": 123.45
  }
]
```

### Model limitations

This is a minimal baseline intended for experimentation and infrastructure scaffolding.

- It uses a simple linear model and may underfit nonlinear market behavior.
- It predicts next-step return and compounds for multi-step horizons, which can accumulate error.
- It relies only on technical features from OHLCV candles and ignores market microstructure, macro context, news, and on-chain data.
- Backtest and live performance can diverge significantly due to regime shifts and non-stationarity.
- Metrics are validation-only and do not guarantee out-of-sample profitability.

## Disclaimer

This project and its model outputs are for educational and research purposes only and **do not constitute financial advice**. Trading cryptocurrencies involves substantial risk, and you are solely responsible for your decisions.
