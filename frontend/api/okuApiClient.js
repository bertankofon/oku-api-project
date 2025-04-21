import axios from 'axios';

const BASE_URL = "https://omni.icarus.tools";

// API response interfaces (included as comments)
/*
export interface LiveBlockResponse {
  result: number;
  id: number | string;
  jsonrpc?: string;
}

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

export interface BacktestResponse {
  result: PositionStatistics;
  id: number | string;
  jsonrpc?: string;
}
*/

export async function getLiveBlock(chain = "ethereum") {
  const endpoint = `${BASE_URL}/${chain}/cush/liveBlock`;
  const requestBody = { params: [], id: 1 };
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getActivePools(chain = "ethereum") {
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
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function getPoolDetails(poolAddress, chain = "ethereum") {
  const endpoint = `${BASE_URL}/${chain}/cush/search`;
  const requestBody = { params: [poolAddress], id: 1 };
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result.pools[0];
}

export async function getLastPoolTick(poolAddress, chain = "ethereum") {
  const endpoint = `${BASE_URL}/${chain}/cush/lastPoolTick`;
  const requestBody = { params: [poolAddress], id: 1 };
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result;
}

export async function getPoolTickStateAtTimestamp(
  poolAddress,
  timestamp,
  chain = "ethereum"
) {
  const endpoint = `${BASE_URL}/${chain}/cush/poolTickStateAtTimestamp`;
  const requestBody = { params: [poolAddress, timestamp], id: 1 };
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data.result.tick;
}

export async function backtestPosition(
  poolAddress,
  tickLower,
  tickUpper,
  token0Amount,
  token1Amount,
  blockStart,
  blockEnd,
  chain = "ethereum"
) {
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
  
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}

export async function backtestPositionInTimeRange(
  poolAddress,
  tickLower,
  tickUpper,
  token0Amount,
  token1Amount,
  timestampStart,
  timestampEnd,
  chain = "ethereum"
) {
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
  
  const response = await axios.post(endpoint, requestBody, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
}
