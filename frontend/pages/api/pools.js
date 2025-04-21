import { getActivePools } from '../../api/okuApiClient';

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const numPools = parseInt(req.query.num) || 10;
  const minTvl = parseFloat(req.query.minTvl) || 0;

  try {
    const activePoolsData = await getActivePools();
    
    if (!activePoolsData.result || !activePoolsData.result.pools) {
      return res.status(500).json({ error: 'Invalid response from Oku API' });
    }

    // Filter pools by TVL and calculate estimated APR
    const filteredPools = activePoolsData.result.pools
      .filter(pool => pool.tvl_usd >= minTvl)
      .filter(pool => {
        // Ensure TVL > 0 for APR calculation
        if (pool.tvl_usd > 0) {
          // Skip pools with zero or undefined fees
          return pool.total_fees_usd > 0;
        }
        return false;
      })
      .slice(0, numPools);

    return res.status(200).json({ pools: filteredPools });
  } catch (error) {
    console.error('Error fetching pools:', error);
    return res.status(500).json({ error: 'Failed to fetch pools: ' + error.message });
  }
}
