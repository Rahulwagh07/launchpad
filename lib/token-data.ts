import { TokenTypes } from "@/types/token";
import { NATIVE_MINT } from "@solana/spl-token";
import { USDC_MINT, USDT_MINT } from "./constant";

export const POPULAR_TOKENS: TokenTypes[] = [
  {
    mint: NATIVE_MINT.toString(),
    balance: 0,
    symbol: "SOL",
    name: "Solana",
    image:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    mint: USDC_MINT,
    balance: 0,
    symbol: "USDC",
    name: "USDC",
    image:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
  {
    mint: USDT_MINT,
    balance: 0,
    symbol: "USDT",
    name: "USDT",
    image:
      "https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png",
  },
];
