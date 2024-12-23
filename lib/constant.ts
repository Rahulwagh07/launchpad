import { TxVersion } from "@raydium-io/raydium-sdk-v2"
import { NATIVE_MINT } from "@solana/spl-token"
import { clusterApiUrl, Connection } from "@solana/web3.js"

export const txVersion = TxVersion.V0
export const connection = new Connection(clusterApiUrl('devnet'))
export const SOL_MINT = NATIVE_MINT.toString()
export const USDT_MINT = 'EhfAs5YgdqcR9SCEz3A8u5RGE4G7XvyGQy29kurT8zZV'
export const USDC_MINT = 'CdCSGsKhAybDu3325w3Yfv2jKVqebvhMuUtH4bPm2jSC'