import { ApiV3Token, CpmmRpcData } from "@raydium-io/raydium-sdk-v2"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { Connection, PublicKey } from "@solana/web3.js"

export interface MintInfo extends Pick<ApiV3Token, 'address' | 'decimals' | 'programId'> {
  address: string
  programId: string
  decimals: number
}

export interface PoolCreationParams {
  connection: Connection
  wallet: WalletContextState
  token1: PublicKey
  token2: PublicKey
  token1Amount: number
  token2Amount: number
  // token1ProgramId: PublicKey
  // token2ProgramId: PublicKey
}

export interface PoolInfo {
  poolId: string
  tokenA: {
    mint: string
    symbol: string
    balance: number
    name: string
    image: string
  }
  tokenB: {
    mint: string
    symbol: string
    balance: number
    name: string
    image: string
  }
  poolInfo: CpmmRpcData
}