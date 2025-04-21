import { 
  getLiveBlock, 
  getPoolDetails, 
  getLastPoolTick, 
  backtestPositionInTimeRange, 
  getPoolTickStateAtTimestamp 
} from '../../api/okuApiClient';

// Constants for tick calculations
const MIN_TICK = -887272;
const MAX_TICK = 887272;
const MS_PER_DAY = 24 * 60 * 60 * 1000;

// Helper to compute tick spacing from fee tier
function getTickSpacing(fee) {
  if (fee === 500) return 10;
  if (fee === 3000) return 60;
  if (fee === 10000) return 200;
  return 60;
}

// Convert a human-readable amount to a raw hex string using the given decimals
function convertAmountToHex(amountStr, decimals) {
  const amountFloat = parseFloat(amountStr);
  if (isNaN(amountFloat) || amountFloat <= 0) {
    return "0x0";
  }
  const rawValue = BigInt(Math.round(amountFloat * Math.pow(10, decimals)));
  return "0x" + rawValue.toString(16);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { 
      poolAddress,
      pctBelow,
      pctAbove,
      token0Amount,
      token1Amount,
      daysBack
    } = req.body;

    if (!poolAddress) {
      return res.status(400).json({ error: 'Pool address is required' });
    }

    // Get pool details
    const poolDetails = await getPoolDetails(poolAddress);
    const currentTick = await getLastPoolTick(poolAddress);

    // Calculate timestamp range
    const now = Date.now();
    const timestampEnd = now;
    const timestampStart = now - (daysBack * MS_PER_DAY);

    // Get tick at start timestamp
    const initialTick = await getPoolTickStateAtTimestamp(poolAddress, timestampStart);
    
    // Calculate tick bounds from percentages
    const tickSpacing = getTickSpacing(poolDetails.fee);
    
    let rawTickLower, rawTickUpper;
    
    // Calculate lower tick
    if (pctBelow === "infinite") {
      rawTickLower = MIN_TICK;
    } else {
      const offsetBelow = Math.round(Math.log(1 - pctBelow / 100) / Math.log(1.0001));
      rawTickLower = initialTick + offsetBelow;
    }
    
    // Calculate upper tick
    if (pctAbove === "infinite") {
      rawTickUpper = MAX_TICK;
    } else {
      const offsetAbove = Math.round(Math.log(1 + pctAbove / 100) / Math.log(1.0001));
      rawTickUpper = initialTick + offsetAbove;
    }
    
    // Adjust ticks to be divisible by tickSpacing
    const tickLower = Math.floor(rawTickLower / tickSpacing) * tickSpacing;
    const tickUpper = Math.ceil(rawTickUpper / tickSpacing) * tickSpacing;
    
    // Convert token amounts to hex
    const token0AmountHex = convertAmountToHex(token0Amount, poolDetails.t0_decimals);
    const token1AmountHex = convertAmountToHex(token1Amount, poolDetails.t1_decimals);
    
    // Run the backtest
    const backtestResponse = await backtestPositionInTimeRange(
      poolAddress,
      tickLower,
      tickUpper,
      token0AmountHex,
      token1AmountHex,
      timestampStart,
      timestampEnd
    );
    
    // Return the response
    return res.status(200).json(backtestResponse);
  } catch (error) {
    console.error('Error running backtest:', error);
    return res.status(500).json({ error: 'Failed to run backtest: ' + error.message });
  }
}
