import { useState, useEffect } from 'react';

export default function PoolSelector({ onSelectPool }) {
  const [pools, setPools] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numPools, setNumPools] = useState(10);
  const [minTvl, setMinTvl] = useState(1000000); // Default 1M TVL

  const fetchPools = async () => {
    setLoading(true);
    try {
      const response = await fetch(`/api/pools?num=${numPools}&minTvl=${minTvl}`);
      const data = await response.json();
      if (response.ok) {
        setPools(data.pools);
      } else {
        console.error('Error fetching pools:', data.error);
        alert('Failed to fetch pools: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to fetch pools. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPools();
  }, []);

  return (
    <div className="card">
      <h2>Select Uniswap Pool</h2>
      
      <div className="input-group">
        <label htmlFor="numPools">Number of pools to display:</label>
        <input
          id="numPools"
          type="number"
          value={numPools}
          min="1"
          max="100"
          onChange={(e) => setNumPools(parseInt(e.target.value) || 10)}
        />
      </div>
      
      <div className="input-group">
        <label htmlFor="minTvl">Minimum TVL (USD):</label>
        <input
          id="minTvl"
          type="number"
          value={minTvl}
          min="0"
          step="100000"
          onChange={(e) => setMinTvl(parseFloat(e.target.value) || 0)}
        />
      </div>
      
      <button onClick={fetchPools} disabled={loading}>
        {loading ? 'Loading...' : 'Fetch Pools'}
      </button>
      
      {pools.length > 0 ? (
        <div className="pool-list">
          {pools.map((pool) => (
            <div key={pool.address} className="card" onClick={() => onSelectPool(pool)} style={{ cursor: 'pointer' }}>
              <h3>{pool.t0_name} / {pool.t1_name}</h3>
              <p>TVL: ${pool.tvl_usd.toLocaleString()}</p>
              <p>Fee: {pool.fee / 10000}%</p>
              <p>Est. APR: {((pool.total_fees_usd / pool.tvl_usd) * 365 * 100).toFixed(2)}%</p>
            </div>
          ))}
        </div>
      ) : (
        <p>{loading ? 'Loading pools...' : 'No pools found. Try adjusting criteria.'}</p>
      )}
    </div>
  );
}
