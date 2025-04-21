import { useState } from 'react';
import Head from 'next/head';
import PoolSelector from '../components/PoolSelector';
import BacktestForm from '../components/BacktestForm';
import BacktestResults from '../components/BacktestResults';

export default function Home() {
  const [selectedPool, setSelectedPool] = useState(null);
  const [backtestResults, setBacktestResults] = useState(null);
  const [loading, setLoading] = useState(false);

  const handlePoolSelect = (pool) => {
    setSelectedPool(pool);
    setBacktestResults(null);
  };

  const handleBacktestSubmit = async (backtestParams) => {
    setLoading(true);
    try {
      const response = await fetch('/api/backtest', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          poolAddress: selectedPool.address,
          ...backtestParams
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setBacktestResults(data.result);
      } else {
        alert('Error running backtest: ' + (data.error || 'Unknown error'));
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Failed to run backtest. See console for details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <Head>
        <title>Oku API Uniswap Backtest Tool</title>
        <meta name="description" content="Backtest Uniswap v3 liquidity provision strategies" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main>
        <div className="header">
          <h1>Oku API Uniswap Backtest Tool</h1>
          <p>Backtest Uniswap v3 liquidity provision strategies</p>
        </div>

        <PoolSelector onSelectPool={handlePoolSelect} />

        {selectedPool && (
          <div className="card">
            <h2>Selected Pool: {selectedPool.t0_name}/{selectedPool.t1_name}</h2>
            <p>Address: {selectedPool.address}</p>
            <p>TVL: ${selectedPool.tvl_usd.toLocaleString()}</p>
            <p>Fee Tier: {selectedPool.fee / 10000}%</p>
            
            <BacktestForm 
              pool={selectedPool} 
              onSubmit={handleBacktestSubmit}
              loading={loading}
            />
          </div>
        )}

        {backtestResults && (
          <BacktestResults 
            results={backtestResults}
            token0={selectedPool.t0_name}
            token1={selectedPool.t1_name}
          />
        )}
      </main>
    </div>
  );
}
