        console.log(`Price at start timestamp (token1/token0): ${price.toFixed(8)}`);
        
        // Calculate token amounts based on USD investment
        // In Uniswap v3, the value formula is:
        // USD value = (amount0 * price0_usd) + (amount1 * price1_usd)
        
        // For simplicity, we'll split the investment 50/50 in value
        // This assumes token1 is the quote token (like USDC)
        const halfInvestmentUsd = totalUsdInvestment / 2;
        
        // If we have pricing data, we can calculate more precisely
        // For now using a simple 50/50 split
        const token0Amount = halfInvestmentUsd / price; // Assuming price is token1 per token0
        const token1Amount = halfInvestmentUsd;
        
        console.log(`Calculated token amounts based on $${totalUsdInvestment.toFixed(2)} investment:`);
        console.log(`- ${token0Amount.toFixed(6)} ${poolDetails.t0_name}`);
        console.log(`- ${token1Amount.toFixed(6)} ${poolDetails.t1_name}`);
        
        const token0AmountHex = convertAmountToHex(token0Amount.toString(), poolDetails.t0_decimals);
        const token1AmountHex = convertAmountToHex(token1Amount.toString(), poolDetails.t1_decimals);
        console.log(`Recalculated Tick Range (adjusted): ${tickLowerFinal} to ${tickUpperFinal}`);
        }
        
        console.log(`Running timestamp-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLowerFinal}
          Tick Upper: ${tickUpperFinal}
          Total USD Investment: $${totalUsdInvestment.toFixed(2)}
          ${poolDetails.t0_name} Deposit: ${token0Amount.toFixed(6)} (raw hex: ${token0AmountHex})
          ${poolDetails.t1_name} Deposit: ${token1Amount.toFixed(6)} (raw hex: ${token1AmountHex})
          Timestamp Start: ${new Date(timestampStart).toISOString()}
          Timestamp End: ${new Date(timestampEnd).toISOString()}
        `);
        // We would need to get the price at block start for block-based backtest
        // For now, using a simpler 50/50 split approach for block-based as well
        const halfInvestmentUsd = totalUsdInvestment / 2;
        // This is a simplified approach and less accurate than the timestamp method
        const token0Amount = halfInvestmentUsd; // Simplified assumption
        const token1Amount = halfInvestmentUsd; // Simplified assumption
        
        const token0AmountHex = convertAmountToHex(token0Amount.toString(), poolDetails.t0_decimals);
        const token1AmountHex = convertAmountToHex(token1Amount.toString(), poolDetails.t1_decimals);
        
        console.log(`Running block-based backtest for pool ${poolAddress} with parameters:
        console.log(`Backtest block range: ${blockStart} to ${blockEnd        console.log(`Running timestamp-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLowerFinal}
          Tick Upper: ${tickUpperFinal}
          Total USD Investment: $${totalUsdInvestment.toFixed(2)}
          ${poolDetails.t0_name} Deposit: ${token0Amount.toF        const initialTick = await getPoolTickStateAtTimestamp(poolAddress, timestampStart);
        console.log(`Pool Tick at start timestamp: ${initialTick}`);
        
        // Calculate the price at the start timestamp
        const sqrtPriceX96 = 1.0001 ** (initialTick / 2);
        const price = sqrtPriceX96 ** 2;
        console.log(`Price at start timestamp (token1/token0): ${price.toFixed(8)}`);
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
            const offsetAbov        console.log(`Recalculated Tick Range (adjusted): ${tickLowerFinal} to ${tickUpperFinal}`);
        }
        
        console.log(`Running timestamp-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLowerFinal}
          Tick Upper: ${tickUpperFinal}
          Total USD Investment: $${totalUsdInvestment.toFixed(2)}
          ${poolDetails.t0_name} Deposit: ${token0Amount.toFixed(6)} (raw hex: ${token0AmountHex})
          ${poolDetails.t1_name} Deposit: ${token1Amount.toFixed(6)} (raw hex: ${token1AmountHex})
          Timestamp Start: ${new Date(timestampStart).toISOString()}
          Timestamp End: ${new Date(timestampEnd).toISOString()}
        `);
      } else {
        // Block-based backtest (original implementation)
        const blockEnd = liveBlockData.result;
        const blockStart = blockEnd - (daysBack * BLOCKS_PER_DAY);
        console.log(`Backtest block range: ${blockStart} to ${blockEnd}`);
      
        // We would need to get the price at block start for block-based backtest
        // For now, using a simpler 50/50 split approach for block-based as well
        const halfInvestmentUsd = totalUsdInvestment / 2;
        const token0Amount = halfInvestmentUsd; // Simplified assumption
        const token1Amount = halfInvestmentUsd; // Simplified assumption
        
        const token0AmountHex = convertAmountToHex(token0Amount.toString(), poolDetails.t0_decimals);
        const token1AmountHex = convertAmountToHex(token1Amount.toString(), poolDetails.t1_decimals);
        
        console.log(`Running block-based backtest for pool ${poolAddress} with parameters:
          Tick Lower: ${tickLower}
          Tick Upper: ${tickUpper}
          Total USD Investment: $${totalUsdInvestment.toFixed(2)}
          ${poolDetails.t0_name} Deposit: ${token0Amount.toFixed(6)} (raw hex: ${token0AmountHex})
          ${poolDetails.t1_name} Deposit: ${token1Amount.toFixed(6)} (raw hex: ${token1AmountHex})
          Block Start: ${blockStart}
          Block End: ${blockEnd}
        `);
      // Now present the result in a nice UI-like summary.
      renderBacktestSummary(backtestResponse.result, poolDetails.t0_name, poolDetails.t1_name, totalUsdInvestment);
