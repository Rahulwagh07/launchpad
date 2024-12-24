import { ApiV3PoolInfoStandardItemCpmm, Percent } from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import Decimal from 'decimal.js'
import { initRaydiumSDK } from './init'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { isValidCpmm } from './utils'
import { txVersion } from '../constant'

export const deposit = async (wallet: WalletContextState, poolId: string, amount: number) => {
  const raydium = await initRaydiumSDK(wallet)
  console.log("Poolid", poolId)
  const res = await raydium.cpmm.getPoolInfoFromRpc(poolId)
  if(!isValidCpmm(res.poolInfo.programId)){
    console.log("Pool is not a valid cpmm")
    return;
  }
  const poolInfo: ApiV3PoolInfoStandardItemCpmm = res.poolInfo
  const poolKeys= res.poolKeys
  const inputAmount = new BN(new Decimal(amount).mul(10 ** poolInfo.mintA.decimals).toFixed(0))
  const slippage = new Percent(1, 100) // 1%
  const baseIn = true
  const { execute } = await raydium.cpmm.addLiquidity({
    poolInfo,
    poolKeys,
    inputAmount,
    slippage,
    baseIn,
    txVersion
  })
  await execute()
}

