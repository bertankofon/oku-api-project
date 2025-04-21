# Oku API Uniswap Backtest Tool

A tool for backtesting Uniswap v3 liquidity provision strategies using the Oku API.

## Features

- Browse active Uniswap v3 pools by TVL
- Backtest liquidity positions with historical data
- Compare LP performance vs. HODL strategy
- Analyze impermanent loss and fee earnings

## Quick Start

1. **Install dependencies:**
   ```
   npm install
   ```

2. **Build the project:**
   ```
   npm run build
   ```

3. **Run the application:**
   ```
   npm start
   ```

## How It Works

The tool prompts you to:
1. Select pools to analyze
2. Choose a pool for backtesting
3. Define price range and token amounts
4. Set a timeframe for the backtest
5. View detailed performance metrics

Results include position values, impermanent loss, fee earnings, and profitability comparisons.

## Requirements

- Node.js v14+
- npm v6+

## Notes

Uses the Oku API (https://omni.icarus.tools) for Uniswap v3 on-chain data.
