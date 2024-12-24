import { ApiV3PoolInfoStandardItemCpmm, Percent } from '@raydium-io/raydium-sdk-v2'
import BN from 'bn.js'
import { initRaydiumSDK } from './init'
import { WalletContextState } from '@solana/wallet-adapter-react'
import { isValidCpmm } from './utils'
import { txVersion } from '../constant'

export const withdraw = async (wallet: WalletContextState, poolId: string, amount: number) => {
  const raydium = await initRaydiumSDK(wallet)

  const res = await raydium.cpmm.getPoolInfoFromRpc(poolId)
  if (!isValidCpmm(res.poolInfo.programId)) {
    console.error("Pool is not a valid cpmm")
    return;
  }
  const poolInfo: ApiV3PoolInfoStandardItemCpmm = res.poolInfo
  const poolKeys = res.poolKeys
  const slippage = new Percent(1, 100) // 1%
  const lpAmount = new BN(amount)
  console.log("AMount", lpAmount.toString())

  const { execute } = await raydium.cpmm.withdrawLiquidity({
    poolInfo,
    poolKeys,
    lpAmount,
    slippage,
    txVersion,
  })

  const { txId } = await execute({ sendAndConfirm: true })
  console.log('pool withdraw:', txId)
}
