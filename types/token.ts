import { PublicKey } from "@solana/web3.js";

export interface TokenTypes {
  mint: string;
  balance: number;
  symbol: string;
  name: string;
  image: string;
}

export type TokenFormValues = {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  image: FileList;
  mintAuthority: PublicKey;
  upgradeAuthority: PublicKey;
  freezeAuthority: PublicKey;
  hasMintAuthority: boolean;
  hasUpgradeAuthority: boolean;
  hasFreezeAuthority: boolean;
};
