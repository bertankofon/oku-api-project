import { useState } from 'react';

export default function BacktestForm({ pool, onSubmit, loading }) {
  const [pctBelow, setPctBelow] = useState(10);
  const [pctAbove, setPctAbove] = useState(10);
  const [token0Amount, setToken0Amount] = useState(1);
  const [token1Amount, setToken1Amount] = useState(1);
  const [daysBack, setDaysBack] = useState(30);

  const handleSubmit = (e) => {
    e.preventDefault();
    
    onSubmit({
      pctBelow,
      pctAbove,
      token0Amount,
      token1Amount,
      daysBack
    });
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Configure Backtest</h3>
      
      <div className="input-group">
        <label>Price Range Setup:</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="pctBelow">% Below Current Price:</label>
            <input
              id="pctBelow"
              type="number"
              value={pctBelow}
              min="0"
              max="100"
              onChange={(e) => setPctBelow(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="pctAbove">% Above Current Price:</label>
            <input
              id="pctAbove"
              type="number"
              value={pctAbove}
              min="0"
              max="100"
              onChange={(e) => setPctAbove(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label>Token Amounts:</label>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <div style={{ flex: 1 }}>
            <label htmlFor="token0Amount">{pool.t0_name} Amount:</label>
            <input
              id="token0Amount"
              type="number"
              value={token0Amount}
              min="0"
              step="0.01"
              onChange={(e) => setToken0Amount(parseFloat(e.target.value) || 0)}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label htmlFor="token1Amount">{pool.t1_name} Amount:</label>
            <input
              id="token1Amount"
              type="number"
              value={token1Amount}
              min="0"
              step="0.01"
              onChange={(e) => setToken1Amount(parseFloat(e.target.value) || 0)}
            />
          </div>
        </div>
      </div>
      
      <div className="input-group">
        <label htmlFor="daysBack">Days Back:</label>
        <input
          id="daysBack"
          type="number"
          value={daysBack}
          min="1"
          max="365"
          onChange={(e) => setDaysBack(parseInt(e.target.value) || 30)}
        />
      </div>
      
      <button type="submit" disabled={loading}>
        {loading ? 'Running Backtest...' : 'Run Backtest'}
      </button>
    </form>
  );
}
