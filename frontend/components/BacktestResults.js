export default function BacktestResults({ results, token0, token1 }) {
  // Helper to format numbers with sign
  const formatWithSign = (num, decimals = 2) => {
    if (num === undefined || num === null) return 'N/A';
    return (num >= 0 ? '+' : '') + num.toFixed(decimals);
  };

  // Helper to add formatting classNames
  const getValueClass = (value) => {
    if (value === undefined || value === null) return '';
    return value >= 0 ? 'positive' : 'negative';
  };

  // Extract relevant metrics
  // Extract relevant metrics
  const {
    // Price data
    price_initial_quoted0,
    price_final_quoted0,
    position_price_lower,
    position_price_upper,

    // Token amounts
    amount0_initial,
    amount1_initial,
    amount0_final,
    amount1_final,

    // Values and profits for token0
    value_initial_quoted0,
    value_now_quoted0,
    value_if_held_quoted0,
    impermanent_loss_quoted0,
    fees_quoted0,
    net_profit_quoted0,
    return_proportion_quoted0,

    // Values and profits for token1
    value_initial_quoted1,
    value_now_quoted1,
    value_if_held_quoted1,
    impermanent_loss_quoted1,
    fees_quoted1,
    net_profit_quoted1,
    return_proportion_quoted1,

    // APRs
    position_fee_apr0,
    position_fee_apr1,
    
    // Time
    backtest_start_time,
    backtest_end_time,
  } = results;
  // Calculate some derived metrics for token0
  const returnPct = return_proportion_quoted0 * 100;
  const ilPct = value_if_held_quoted0 > 0 ? (impermanent_loss_quoted0 / value_if_held_quoted0) * 100 : 0;
  const feesPct = value_initial_quoted0 > 0 ? (fees_quoted0 / value_initial_quoted0) * 100 : 0;
  const pricePctChange = price_initial_quoted0 > 0 ? ((price_final_quoted0 / price_initial_quoted0) - 1) * 100 : 0;

  // Calculate some derived metrics for token1
  const returnPct1 = return_proportion_quoted1 * 100;
  const ilPct1 = value_if_held_quoted1 > 0 ? (impermanent_loss_quoted1 / value_if_held_quoted1) * 100 : 0;
  const feesPct1 = value_initial_quoted1 > 0 ? (fees_quoted1 / value_initial_quoted1) * 100 : 0;

  return (
    <div className="backtest-results">
      <h2>Backtest Results</h2>
      
      <div>
        <h3>Time Period</h3>
        <div className="metric-row">
          <span>Start:</span>
          <span>{backtest_start_time}</span>
        </div>
        <div className="metric-row">
          <span>End:</span>
          <span>{backtest_end_time}</span>
        </div>
      </div>
      
      <div>
        <h3>Strategy Details</h3>
        <div className="metric-row">
          <span>Price Range:</span>
          <span>[{position_price_lower?.toFixed(4)}, {position_price_upper?.toFixed(4)}]</span>
        </div>
        <div className="metric-row">
          <span>Initial Deposits:</span>
          <span>{amount0_initial?.toFixed(6)} {token0}, {amount1_initial?.toFixed(6)} {token1}</span>
        </div>
        <div className="metric-row">
          <span>Final Balances:</span>
          <span>{amount0_final?.toFixed(6)} {token0}, {amount1_final?.toFixed(6)} {token1}</span>
        </div>
      </div>
      
      <div>
        <h3>Performance Summary (in {token0})</h3>
        <div className="metric-row">
          <span>Initial Value:</span>
          <span>{value_initial_quoted0?.toFixed(4)} {token0}</span>
        </div>
        <div className="metric-row">
          <span>Final Value:</span>
          <span className={getValueClass(returnPct)}>
            {value_now_quoted0?.toFixed(4)} {token0} ({formatWithSign(returnPct)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>If Held:</span>
          <span>{value_if_held_quoted0?.toFixed(4)} {token0}</span>
        </div>
        <div className="metric-row">
          <span>Impermanent Loss:</span>
          <span className={getValueClass(-ilPct)}>
            {impermanent_loss_quoted0?.toFixed(4)} {token0} ({ilPct.toFixed(2)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>Fees Earned:</span>
          <span className="positive">
            {fees_quoted0?.toFixed(4)} {token0} ({feesPct.toFixed(2)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>Net Profit:</span>
          <span className={getValueClass(net_profit_quoted0)}>
            {net_profit_quoted0?.toFixed(4)} {token0} ({formatWithSign(returnPct)}%)
          </span>
        </div>
      </div>
      
      <div>
        <h3>Performance Summary (in {token1})</h3>
        <div className="metric-row">
          <span>Initial Value:</span>
          <span>{value_initial_quoted1?.toFixed(4)} {token1}</span>
        </div>
        <div className="metric-row">
          <span>Final Value:</span>
          <span className={getValueClass(returnPct1)}>
            {value_now_quoted1?.toFixed(4)} {token1} ({formatWithSign(returnPct1)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>If Held:</span>
          <span>{value_if_held_quoted1?.toFixed(4)} {token1}</span>
        </div>
        <div className="metric-row">
          <span>Impermanent Loss:</span>
          <span className={getValueClass(-ilPct1)}>
            {impermanent_loss_quoted1?.toFixed(4)} {token1} ({ilPct1.toFixed(2)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>Fees Earned:</span>
          <span className="positive">
            {fees_quoted1?.toFixed(4)} {token1} ({feesPct1.toFixed(2)}%)
          </span>
        </div>
        <div className="metric-row">
          <span>Net Profit:</span>
          <span className={getValueClass(net_profit_quoted1)}>
            {net_profit_quoted1?.toFixed(4)} {token1} ({formatWithSign(returnPct1)}%)
          </span>
        </div>
      </div>
      
      <div>
        <h3>Performance Metrics</h3>
        <div className="metric-row">
          <span>Price Change:</span>
          <span className={getValueClass(pricePctChange)}>
            {formatWithSign(pricePctChange)}% ({price_initial_quoted0?.toFixed(4)} → {price_final_quoted0?.toFixed(4)} {token1}/{token0})
          </span>
        </div>
        <div className="metric-row">
          <span>Fee APR ({token0}):</span>
          <span className="positive">{position_fee_apr0?.toFixed(2)}%</span>
        </div>
        <div className="metric-row">
          <span>Fee APR ({token1}):</span>
          <span className="positive">{position_fee_apr1?.toFixed(2)}%</span>
        </div>
      </div>
      
      <div>
        <h3>Strategy Assessment</h3>
        <div className="metric-row">
          {net_profit_quoted0 > 0 ? (
            <span className="positive">✓ Strategy was profitable</span>
          ) : (
            <span className="negative">❌ Strategy was not profitable</span>
          )}
        </div>
        <div className="metric-row">
          {value_now_quoted0 > value_if_held_quoted0 ? (
            <span className="positive">✓ LP strategy outperformed HODL</span>
          ) : (
            <span className="negative">❌ HODL would have performed better</span>
          )}
        </div>
        <div className="metric-row">
          {fees_quoted0 > Math.abs(impermanent_loss_quoted0) ? (
            <span className="positive">✓ Fees compensated for impermanent loss</span>
          ) : (
            <span className="negative">❌ Impermanent loss exceeded fee earnings</span>
          )}
        </div>
      </div>
    </div>
  );
}
