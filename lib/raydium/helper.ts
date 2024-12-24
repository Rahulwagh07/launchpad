import { TokenTypes } from "@/types/token";
import { getTokenMetadata, NATIVE_MINT, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import axios from 'axios';
import { initRaydiumSDK } from "./init";
import { connection } from "../constant";
import { PoolInfo } from "@/types/raydium";

//get only TOKEN_2022 tokens
export const fetchUserTokens = async (wallet: WalletContextState, connection: Connection): Promise<TokenTypes[]> => {
  if (!wallet.publicKey) return [];

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      programId: TOKEN_2022_PROGRAM_ID,
    });

    const solToken = await fetchNativeToken(wallet);
    const tokens = await Promise.all(
      tokenAccounts.value.map(async (accountInfo) => {
        const mintAddress = accountInfo.account.data.parsed.info.mint;
        const balance: number | null = accountInfo.account.data.parsed.info.tokenAmount.uiAmount;

        if (balance === 0 || !balance) return null;

        const res = await fetchTokenMetadata(mintAddress, connection);
        if (!res?.tokenMetadata) return null;
        return {
          mint: res.tokenMetadata.mint.toBase58(),
          balance,
          symbol: res.tokenMetadata.symbol,
          name: res.tokenMetadata.name,
          image: res.image,
        }
      })
    );
    tokens.push(solToken)
    return tokens.filter((token): token is TokenTypes => token !== null);
  } catch (error) {
    console.error('Error fetching user tokens:', error);
    return [];
  }
}


const fetchTokenMetadata = async (mintAddress: string, connection: Connection) => {
  try {
    const tokenMetadata = await getTokenMetadata(connection, new PublicKey(mintAddress), 'confirmed', TOKEN_2022_PROGRAM_ID);
    if (!tokenMetadata) {
      return null;
    }
    const { data } = await axios.get(tokenMetadata.uri);
    return {
      tokenMetadata,
      image: data.image as string,
    };
  } catch (error) {
    console.error(`Error fetching metadata for ${mintAddress}:`, error);
    return null;
  }
}

export const fetchPoolInfoByIds = async (
  wallet: WalletContextState,
  poolIds: string[],
  connection: Connection
): Promise<PoolInfo[]> => {
  try {
    const raydium = await initRaydiumSDK(wallet);
    const poolInfo = await raydium.cpmm.getRpcPoolInfos(poolIds);
    const result: PoolInfo[] = [];

    for (const poolId of poolIds) {
      const info = poolInfo[poolId];

      const tokenA = NATIVE_MINT.toString() === info.mintA.toString()
        ? await fetchNativeToken(wallet)
        : await fetchTokenMetadata(info.mintA.toString(), connection).then(metadata => ({
          mint: info.mintA.toString(),
          balance: 0,
          symbol: metadata?.tokenMetadata.symbol as string,
          name: metadata?.tokenMetadata.name as string,
          image: metadata?.image as string
        }));

      const tokenB = NATIVE_MINT.toString() === info.mintB.toString()
        ? await fetchNativeToken(wallet)
        : await fetchTokenMetadata(info.mintB.toString(), connection).then(metadata => ({
          mint: info.mintB.toString(),
          balance: 0,
          symbol: metadata?.tokenMetadata.symbol as string,
          name: metadata?.tokenMetadata.name as string,
          image: metadata?.image as string
        }));
      result.push({ poolId, tokenA, tokenB, poolInfo: info });
    }

    return result;
  } catch (error) {
    console.error('Error fetching pool info:', error);
    return [];
  }
};

const fetchNativeToken = async (wallet: WalletContextState) => {
  const balance = wallet.publicKey ? await connection.getBalance(wallet.publicKey) : 0;
  return {
    mint: NATIVE_MINT.toString(),
    symbol: 'SOL',
    balance: balance / LAMPORTS_PER_SOL,
    name: 'Solana',
    image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
  };
};


