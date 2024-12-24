import { Raydium } from "@raydium-io/raydium-sdk-v2"
import { WalletContextState } from "@solana/wallet-adapter-react"
import { connection } from "../constant"

export const initRaydiumSDK = async (wallet: WalletContextState) => {
  if (!wallet.publicKey) {
    const raydium = await Raydium.load({
      cluster: "devnet",
      connection: connection,
      disableLoadToken: false
    })
    return raydium
  } else {
    const raydium = await Raydium.load({
      cluster: "devnet",
      connection: connection,
      owner: wallet.publicKey,
      signAllTransactions: wallet.signAllTransactions,
      disableLoadToken: false
    })
    return raydium
  }
}