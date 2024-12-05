import { TxVersion } from "@raydium-io/raydium-sdk-v2"
import { clusterApiUrl, Connection } from "@solana/web3.js"

export const txVersion = TxVersion.V0
export const connection = new Connection(clusterApiUrl('devnet'))
export const SOL_MINT = 'So11111111111111111111111111111111111111112'