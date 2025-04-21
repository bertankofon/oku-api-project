import { 
    getLiveBlock, 
    getActivePools, 
    getPoolDetails, 
    getLastPoolTick, 
    backtestPosition,
    backtestPositionInTimeRange,
    getPoolTickStateAtTimestamp,
    PositionStatistics
  } from './okuApi';
  import readline from 'readline';
  
  // Helper function to prompt user input.
  function askQuestion(query: string): Promise<string> {
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    return new Promise(resolve => rl.question(query, ans => {
      rl.close();
      resolve(ans);
    }));
  }
  
  // Convert a human-readable amount to a raw hex string using the given decimals.
  function convertAmountToHex(amountStr: string, decimals: number): string {
    const amountFloat = parseFloat(amountStr);
    const rawValue = BigInt(Math.round(amountFloat * Math.pow(10, decimals)));
    return "0x" + rawValue.toString(16);
  }
  
  // Approximate blocks per day on Ethereum.
  const BLOCKS_PER_DAY = 6600;
  // Milliseconds per day for timestamp calculations
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  
  // Uniswap v3 theoretical tick bounds.
  const MIN_TICK = -887272;
  const MAX_TICK = 887272;
  
  // Helper to compute tick spacing from fee tier.
  function getTickSpacing(fee: number): number {
    // Common Uniswap v3 fee tiers:
    // 500 -> 10, 3000 -> 60, 10000 -> 200.
    if (fee === 500) return 10;
    if (fee === 3000) return 60;
    if (fee === 10000) return 200;
    // Fallback default
    return 60;
  }
  
  // Helper to convert token values to USD
  function convertToUSD(tokenAmount: number, tokenPrice: number): number {
    return tokenAmount * tokenPrice;
  }
  
  // Renders a concise summary of the backtest results, comparing LP strategy vs. HODL.
  function renderBacktestSummary(backtest: PositionStatistics, token0Name: string, token1Name: string) {
    const {
      // Price data
      price_initial_quoted0,
      price_final_quoted0,
      price_initial_quoted1,
      price_final_quoted1,
      position_price_lower,
      position_price_upper,
  
      // Token amounts
      amount0_initial,
      amount1_initial,
      amount0_final,
      amount1_final,
  
      // Values in token0
      value_initial_quoted0,
      value_now_quoted0,
      value_if_held_quoted0,
      
      // Values in token1
      value_initial_quoted1,
      value_now_quoted1,
      value_if_held_quoted1,
  
      // IL and Fees in token0
      impermanent_loss_quoted0,
      fees_token0,
      fees_token1,
      fees_quoted0,
      net_profit_quoted0,
      
      // IL and Fees in token1
      impermanent_loss_quoted1,
      fees_quoted1,
      net_profit_quoted1,
      return_proportion_quoted0,
      return_proportion_quoted1,
  
      // APR, volume, etc.
      position_fee_apr0,
      position_fee_apr1,
      backtest_start_time,
      backtest_end_time,
    } = backtest;
    
    // Calculate percentage changes for both token0 and token1 denominations
    const returnProportion0Pct = return_proportion_quoted0 * 100;
    const returnProportion1Pct = return_proportion_quoted1 * 100;
    
    // Calculate impermanent loss as percentage of HODL value
    const ilPercent0 = value_if_held_quoted0 > 0 ? (impermanent_loss_quoted0 / value_if_held_quoted0) * 100 : 0;
    const ilPercent1 = value_if_held_quoted1 > 0 ? (impermanent_loss_quoted1 / value_if_held_quoted1) * 100 : 0;
    
    // Calculate fees as percentage of initial investment
    const feesPercent0 = value_initial_quoted0 > 0 ? (fees_quoted0 / value_initial_quoted0) * 100 : 0;
    const feesPercent1 = value_initial_quoted1 > 0 ? (fees_quoted1 / value_initial_quoted1) * 100 : 0;
    
    // Calculate price change percentage
    const pricePctChange = price_initial_quoted0 > 0 ? ((price_final_quoted0 / price_initial_quoted0) - 1) * 100 : 0;
  
    // Format a number with a + sign if positive
    const formatWithSign = (num: number, decimals = 2) => (num >= 0 ? '+' : '') + num.toFixed(decimals);
  
    console.log("\n========== BACKTEST SUMMARY ==========");
    console.log(`Strategy Time Range:`);
    console.log(`  Start: ${backtest_start_time}`);
    console.log(`  End:   ${backtest_end_time}`);
    
    console.log(`\n--- Strategy Details ---`);
    console.log(`  Price Range: [${position_price_lower.toFixed(4)} , ${position_price_upper.toFixed(4)}]`);
    console.log(`  Initial Deposits: ${amount0_initial.toFixed(4)} ${token0Name}, ${amount1_initial.toFixed(4)} ${token1Name}`);
    console.log(`  Final Balances:   ${amount0_final.toFixed(4)} ${token0Name}, ${amount1_final.toFixed(4)} ${token1Name}`);
    
    console.log(`\n--- Value & Fees (in ${token0Name}) ---`);
    console.log(`  Initial Value:      ${value_initial_quoted0.toFixed(4)} ${token0Name}`);
    console.log(`  Final Value:        ${value_now_quoted0.toFixed(4)} ${token0Name} (${formatWithSign(returnProportion0Pct)}%)`);
    console.log(`  If Held:            ${value_if_held_quoted0.toFixed(4)} ${token0Name}`);
    console.log(`  Impermanent Loss:   ${impermanent_loss_quoted0.toFixed(4)} ${token0Name} (${ilPercent0.toFixed(2)}% of HODL value)`);
    console.log(`  Fees Earned:        ${fees_quoted0.toFixed(4)} ${token0Name} (${feesPercent0.toFixed(2)}% of initial)`);
    console.log(`  Net Profit:         ${net_profit_quoted0.toFixed(4)} ${token0Name} (${formatWithSign(returnProportion0Pct)}%)`);
  
    console.log(`\n--- Value & Fees (in ${token1Name}) ---`);
    console.log(`  Initial Value:      ${value_initial_quoted1.toFixed(4)} ${token1Name}`);
    console.log(`  Final Value:        ${value_now_quoted1.toFixed(4)} ${token1Name} (${formatWithSign(returnProportion1Pct)}%)`);
    console.log(`  If Held:            ${value_if_held_quoted1.toFixed(4)} ${token1Name}`);
    console.log(`  Impermanent Loss:   ${impermanent_loss_quoted1.toFixed(4)} ${token1Name} (${ilPercent1.toFixed(2)}% of HODL value)`);
    console.log(`  Fees Earned:        ${fees_quoted1.toFixed(4)} ${token1Name} (${feesPercent1.toFixed(2)}% of initial)`);
    console.log(`  Net Profit:         ${net_profit_quoted1.toFixed(4)} ${token1Name} (${formatWithSign(returnProportion1Pct)}%)`);
    
    console.log(`\n--- Raw Fee Earnings ---`);
    console.log(`  ${token0Name} Earned:      ${fees_token0.toFixed(6)} ${token0Name}`);
    console.log(`  ${token1Name} Earned:      ${fees_token1.toFixed(6)} ${token1Name}`);
  
    console.log(`\n--- Performance Metrics ---`);
    console.log(`  ${token0Name} Return:      ${formatWithSign(returnProportion0Pct)}%`);
    console.log(`  ${token1Name} Return:      ${formatWithSign(returnProportion1Pct)}%`);
    console.log(`  Price Change:        ${formatWithSign(pricePctChange)}% (${price_initial_quoted0.toFixed(4)} → ${price_final_quoted0.toFixed(4)} ${token1Name}/${token0Name})`);
    console.log(`  Fee APR (${token0Name}):    ${position_fee_apr0.toFixed(2)}%`);
    console.log(`  Fee APR (${token1Name}):    ${position_fee_apr1.toFixed(2)}%`);
    
    console.log(`\n--- Strategy Assessment ---`);
    // Determine if the strategy was profitable in either denomination
    const profitable0 = net_profit_quoted0 > 0;
    const profitable1 = net_profit_quoted1 > 0;
    const better0 = value_now_quoted0 > value_if_held_quoted0;
    const better1 = value_now_quoted1 > value_if_held_quoted1;
    
    if (profitable0 && profitable1) {
      console.log(`  ✓ Strategy was profitable in both ${token0Name} and ${token1Name} terms`);
    } else if (profitable0) {
      console.log(`  ⚠️ Strategy was profitable in ${token0Name} but not in ${token1Name} terms`);
    } else if (profitable1) {
      console.log(`  ⚠️ Strategy was profitable in ${token1Name} but not in ${token0Name} terms`);
    } else {
      console.log(`  ❌ Strategy was not profitable in either denomination`);
    }
    
    if ((better0 && better1) || (better0 && profitable1) || (better1 && profitable0)) {
      console.log(`  ✓ LP strategy outperformed simple HODL strategy`);
    } else {
      console.log(`  ⚠️ Simple HODL would have performed better`);
    }
    
    if (fees_quoted0 > impermanent_loss_quoted0 || fees_quoted1 > impermanent_loss_quoted1) {
      console.log(`  ✓ Earned fees compensated for impermanent loss`);
    } else {
      console.log(`  ⚠️ Impermanent loss exceeded fee earnings`);
    }
    
    console.log("=======================================\n");
  }
  
  async function main() {
    try {
      console.log("Fetching latest live block...");
      const liveBlockData = await getLiveBlock();
      console.log("Live block:", liveBlockData.result);
  
      // Ask user for number of pools to list and minimum TVL threshold.
      const numPoolsInput = await askQuestion("Enter number of pools to list: ");
      const numPools = parseInt(numPoolsInput, 10) || 50;
      const minTvlInput = await askQuestion("Enter minimum TVL threshold (USD): ");
      const minTvl = parseFloat(minTvlInput) || 0;
  
      console.log(`Fetching active pools sorted by TVL (first ${numPools})...`);
      const activePoolsData = await getActivePools();
      if (activePoolsData.result.pools.length === 0) {
        console.log("No active pools found.");
        return;
      }
  
      // Filter out pools with 0 or undefined APR and with TVL below threshold.
      const filteredPools = activePoolsData.result.pools
        .filter(pool => pool.tvl_usd >= minTvl)
        .filter(pool => {
          // Calculate estimated APR only if TVL > 0.
          if (pool.tvl_usd > 0) {
            const estimatedApr = (pool.total_fees_usd / pool.tvl_usd) * 365 * 100;
            return estimatedApr > 0;
          }
          return false;
        })
        .slice(0, numPools);
      
      if (filteredPools.length === 0) {
        console.log("No pools meet your criteria.");
        return;
      }
      
      console.log("Filtered Active Pools:");
      filteredPools.forEach(pool => {
        const pairName = `${pool.t0_name} / ${pool.t1_name}`;
        const estimatedApr = (pool.tvl_usd > 0)
          ? ((pool.total_fees_usd / pool.tvl_usd) * 365 * 100).toFixed(2) + "%"
          : "N/A";
        console.log(`Pool Address: ${pool.address}`);
        console.log(`Pair Name: ${pairName}`);
        console.log(`TVL (USD): ${pool.tvl_usd}`);
        console.log(`APR: ${estimatedApr}`);
        console.log('----------------------------');
      });
  
      const runTest = await askQuestion("Do you want to run a backtest on one of these pools? (yes/no): ");
      if (runTest.trim().toLowerCase() !== 'yes') {
        console.log("Exiting backtest.");
        return;
      }
  
      let poolAddress = await askQuestion(`Enter pool address for backtest (default: ${filteredPools[0].address}): `);
      if (!poolAddress.trim()) {
        poolAddress = filteredPools[0].address;
      }
  
      // Retrieve detailed pool info.
      const poolDetails = await getPoolDetails(poolAddress);
      console.log("Pool Detailed Info:");
      console.log(`Token0: ${poolDetails.t0_name} (Decimals: ${poolDetails.t0_decimals})`);
      console.log(`Token1: ${poolDetails.t1_name} (Decimals: ${poolDetails.t1_decimals})`);
      
      // Instead of relying on pool details for tick, use the lastPoolTick endpoint.
      const currentTick = await getLastPoolTick(poolAddress);
      console.log(`Current Pool Tick (from lastPoolTick endpoint): ${currentTick}`);


      // Always use timestamp-based backtest for more accurate results
      const isTimestampBased = true;
      const tickSpacing = getTickSpacing(poolDetails.fee);
      console.log(`Derived Tick Spacing (from fee ${poolDetails.fee}): ${tickSpacing}`);
  
      // Ask user for percentage offsets relative to the current tick.
      const pctBelowInput = await askQuestion("Enter percentage below current tick for liquidity (e.g., 5,10,15,20,50 or 'infinite'): ");
      const pctAboveInput = await askQuestion("Enter percentage above current tick for liquidity (e.g., 5,10,15,20,50 or 'infinite'): ");
  
      let rawTickLower: number;
      let rawTickUpper: number;
      if (pctBelowInput.trim().toLowerCase() === "infinite") {
        rawTickLower = MIN_TICK;
      } else {
        const pctBelow = parseFloat(pctBelowInput);
        const offsetBelow = Math.round(Math.log(1 - pctBelow / 100) / Math.log(1.0001));
        rawTickLower = currentTick + offsetBelow;
      }
      if (pctAboveInput.trim().toLowerCase() === "infinite") {
        rawTickUpper = MAX_TICK;
      } else {
        const pctAbove = parseFloat(pctAboveInput);
        const offsetAbove = Math.round(Math.log(1 + pctAbove / 100) / Math.log(1.0001));
        rawTickUpper = currentTick + offsetAbove;
      }
    
      // Adjust tick bounds so that they are divisible by tickSpacing.
      const tickLower = Math.floor(rawTickLower / tickSpacing) * tickSpacing;
      const tickUpper = Math.ceil(rawTickUpper / tickSpacing) * tickSpacing;
      console.log(`Calculated Tick Range (adjusted): ${tickLower} to ${tickUpper}`);
    
      // Ask for deposit amounts.
      console.log(`Note: ${poolDetails.t0_name} uses ${poolDetails.t0_decimals} decimals and ${poolDetails.t1_name} uses ${poolDetails.t1_decimals} decimals.`);
      const token0Input = await askQuestion(`Enter deposit amount for ${poolDetails.t0_name} (human-readable): `);
      const token1Input = await askQuestion(`Enter deposit amount for ${poolDetails.t1_name} (human-readable): `);
      const token0AmountHex = convertAmountToHex(token0Input, poolDetails.t0_decimals);
      const token1AmountHex = convertAmountToHex(token1Input, poolDetails.t1_decimals);
    
      // Ask for number of days back.
      const daysInput = await askQuestion("Enter number of days back for the backtest: ");
      const daysBack = parseInt(daysInput, 10);
      
      let tickLowerFinal = tickLower;
      let tickUpperFinal = tickUpper;
      let backtestResponse;
      
      if (isTimestampBased) {
        // Calculate timestamp range for backtest
        const now = Date.now();
        const timestampEnd = now;
        const timestampStart = now - (daysBack * MS_PER_DAY);
        console.log(`Backtest timestamp range: ${new Date(timestampStart).toISOString()} to ${new Date(timestampEnd).toISOString()}`);
        
        // Get the tick at the start timestamp
        const initialTick = await getPoolTickStateAtTimestamp(poolAddress, timestampStart);
        console.log(`Pool Tick at start timestamp: ${initialTick}`);
        
        // Recalculate tick bounds based on the initial tick (not the current tick)
        if (pctBelowInput.trim().toLowerCase() !== "infinite" || pctAboveInput.trim().toLowerCase() !== "infinite") {
          console.log("Recalculating tick bounds based on the tick at the start of the backtest period...");
          
          let recalcTickLower = tickLower;
          let recalcTickUpper = tickUpper;
          
          if (pctBelowInput.trim().toLowerCase() !== "infinite") {
            const pctBelow = parseFloat(pctBelowInput);
            const offsetBelow = Math.round(Math.log(1 - pctBelow / 100) / Math.log(1.0001));
            recalcTickLower = initialTick + offsetBelow;
          } else {
            recalcTickLower = MIN_TICK;
          }
          
          if (pctAboveInput.trim().toLowerCase() !== "infinite") {
            const pctAbove = parseFloat(pctAboveInput);
            const offsetAbove = Math.round(Math.log(1 + pctAbove / 100) / Math.log(1.0001));
            recalcTickUpper = initialTick + offsetAbove;
          } else {
            recalcTickUpper = MAX_TICK;
          }
          
          // Adjust recalculated tick bounds to be divisible by tickSpacing
          tickLowerFinal = Math.floor(recalcTickLower / tickSpacing) * tickSpacing;
          tickUpperFinal = Math.ceil(recalcTickUpper / tickSpacing) * tickSpacing;
          
          console.log(`Recalculated Tick Range (adjusted): ${tickLowerFinal} to ${tickUpperFinal}`);
        }
        
        console.log(`Running timestamp-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLowerFinal}
          Tick Upper: ${tickUpperFinal}
          ${poolDetails.t0_name} Deposit (raw hex): ${token0AmountHex}
          ${poolDetails.t1_name} Deposit (raw hex): ${token1AmountHex}
          Timestamp Start: ${new Date(timestampStart).toISOString()}
          Timestamp End: ${new Date(timestampEnd).toISOString()}
        `);
        
        backtestResponse = await backtestPositionInTimeRange(
          poolAddress,
          tickLowerFinal,
          tickUpperFinal,
          token0AmountHex,
          token1AmountHex,
          timestampStart,
          timestampEnd
        );
      } else {
        // Block-based backtest (original implementation)
        const blockEnd = liveBlockData.result;
        const blockStart = blockEnd - (daysBack * BLOCKS_PER_DAY);
        console.log(`Backtest block range: ${blockStart} to ${blockEnd}`);
      
        console.log(`Running block-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLower}
          Tick Upper: ${tickUpper}
          ${poolDetails.t0_name} Deposit (raw hex): ${token0AmountHex}
          ${poolDetails.t1_name} Deposit (raw hex): ${token1AmountHex}
          Block Start: ${blockStart}
          Block End: ${blockEnd}
        `);
      
        backtestResponse = await backtestPosition(
          poolAddress,
          tickLower,
          tickUpper,
          token0AmountHex,
          token1AmountHex,
          blockStart,
          blockEnd
        );
      }
      
      // Remove historic fees if present.
      if (backtestResponse.result.historic_fees) {
        delete backtestResponse.result.historic_fees;
      }
      if (backtestResponse.result.historic_fees) {
        delete backtestResponse.result.historic_fees;
      }
      
      // Debug: log the full response to see all available fields
      console.log("\n========== DEBUG: API RESPONSE FIELDS ==========");
      console.log(JSON.stringify(backtestResponse.result, null, 2));
      console.log("=============================================\n");
      
      // Now present the result in a nice UI-like summary.
      renderBacktestSummary(backtestResponse.result, poolDetails.t0_name, poolDetails.t1_name);
    } catch (error) {
      console.error("Error during API calls:", error);
    }
  }
  
  main();