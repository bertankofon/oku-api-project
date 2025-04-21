import axios from 'axios';

const BASE_URL = "https://omni.icarus.tools";

// ---------------------------
// Type Definitions
// ---------------------------
export interface LiveBlockResponse {
  result: number;
  id: number | string;
  jsonrpc?: string;
}

// Added fee field so that we can compute tick spacing.
export interface PoolSummary {
  address: string;
  t0_name: string;
  t1_name: string;
  tvl_usd: number;
  total_fees_usd: number;
  fee: number;
  apr?: number;
  t0_decimals: number;
  t1_decimals: number;
}

export interface SearchResponse {
  pools: PoolSummary[];
  result_size: number;
}

export interface TopPoolsResponse {
  result: SearchResponse;
  id: number | string;
  jsonrpc?: string;
}

// For backtesting, we capture a subset of position statistics.
export interface PositionStatistics {
  amount0_final: number;
  amount0_initial: number;
  amount1_final: number;
  amount1_initial: number;
  backtest_start_time: string;
  backtest_end_time: string;
  fees_quoted0: number;
  fees_quoted1: number;
  fees_token0: number;
  fees_token1: number;
  [key: string]: any;
}

export interface BacktestResponse {
  result: PositionStatistics;
  id: number | string;
  jsonrpc?: string;
}

// LastPoolTick endpoint response.
export interface LastPoolTickResponse {
  result: number;
  id: number | string;
  jsonrpc?: string;
}

// PoolTickStateAtTimestamp endpoint response.
export interface PoolTickStateAtTimestampResponse {
  result: {
    tick: number;
    sqrt_price_x96: string;
  };
  id: number | string;
  jsonrpc?: string;
}

// ---------------------------
// API Functions
// ---------------------------

export async function getLiveBlock(chain: string = "ethereum"): Promise<LiveBlockResponse> {
  const endpoint = `${BASE_URL}/${chain}/cush/liveBlock`;
  const requestBody = { params: [], id: 1 };
  const response = await axios.post<LiveBlockResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getActivePools(chain: string = "ethereum"): Promise<TopPoolsResponse> {
  const endpoint = `${BASE_URL}/${chain}/cush/topPools`;
  const requestBody = {
    params: [{
      fee_tiers: [100, 500, 3000, 10000],
      result_size: 50,
      sort_by: "tvl_usd",
      sort_order: false
    }],
    id: 1,
  };
  const response = await axios.post<TopPoolsResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getPoolDetails(poolAddress: string, chain: string = "ethereum"): Promise<PoolSummary> {
  const endpoint = `${BASE_URL}/${chain}/cush/search`;
  const requestBody = { params: [poolAddress], id: 1 };
  const response = await axios.post<{ result: SearchResponse; id: number | string }>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result.pools[0];
}

// New function: getLastPoolTick uses the dedicated endpoint to fetch the current pool tick.
export async function getLastPoolTick(poolAddress: string, chain: string = "ethereum"): Promise<number> {
  const endpoint = `${BASE_URL}/${chain}/cush/lastPoolTick`;
  const requestBody = { params: [poolAddress], id: 1 };
  const response = await axios.post<LastPoolTickResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result;
}

// Get the pool tick state at a specific timestamp.
export async function getPoolTickStateAtTimestamp(
  poolAddress: string,
  timestamp: number,
  chain: string = "ethereum"
): Promise<number> {
  const endpoint = `${BASE_URL}/${chain}/cush/poolTickStateAtTimestamp`;
  const requestBody = { params: [poolAddress, timestamp], id: 1 };
  const response = await axios.post<PoolTickStateAtTimestampResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result.tick;
}

// Run a backtest using the backtestPosition endpoint.
export async function backtestPosition(
  poolAddress: string,
  tickLower: number,
  tickUpper: number,
  token0Amount: string,
  token1Amount: string,
  blockStart: number,
  blockEnd: number,
  chain: string = "ethereum"
): Promise<BacktestResponse> {
  const endpoint = `${BASE_URL}/${chain}/cush/backtestPosition`;
  const requestBody = {
    params: [
      poolAddress,
      tickLower,
      tickUpper,
      token0Amount,
      token1Amount,
      blockStart,
      blockEnd
    ],
    id: 1,
  };
  
  // Display the request body
  console.log("\n========== BACKTEST REQUEST BODY ==========");
  console.log("Endpoint: backtestPosition");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log("==========================================\n");
  
  const response = await axios.post<BacktestResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

// Run a backtest using the backtestPositionInTimeRange endpoint.
export async function backtestPositionInTimeRange(
  poolAddress: string,
  tickLower: number,
  tickUpper: number,
  token0Amount: string,
  token1Amount: string,
  timestampStart: number,
  timestampEnd: number,
  chain: string = "ethereum"
): Promise<BacktestResponse> {
  const endpoint = `${BASE_URL}/${chain}/cush/backtestPositionInTimeRange`;
  const requestBody = {
    params: [
      poolAddress,
      tickLower,
      tickUpper,
      token0Amount,
      token1Amount,
      timestampStart,
      timestampEnd
    ],
    id: 1,
  };
  
  // Display the request body
  console.log("\n========== BACKTEST REQUEST BODY ==========");
  console.log("Endpoint: backtestPositionInTimeRange");
  console.log(JSON.stringify(requestBody, null, 2));
  console.log("==========================================\n");
  
  const response = await axios.post<BacktestResponse>(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}