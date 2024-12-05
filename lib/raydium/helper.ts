import { TokenTypes } from "@/types/token";
import { DEVNET_PROGRAM_ID, getCpmmPdaAmmConfigId, getCpmmPdaPoolId, Raydium } from "@raydium-io/raydium-sdk-v2";
import { getTokenMetadata, TOKEN_2022_PROGRAM_ID } from "@solana/spl-token";
import { WalletContextState } from "@solana/wallet-adapter-react";
import { Connection, LAMPORTS_PER_SOL, PublicKey } from "@solana/web3.js";
import axios from 'axios';
import { initRaydiumSDK } from "./init";
import { SOL_MINT } from "../constant";

//get only TOKEN_2022 tokens
export const fetchUserTokens = async (wallet: WalletContextState, connection: Connection): Promise<TokenTypes[]> => {
  if (!wallet.publicKey) return [];

  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(wallet.publicKey, {
      programId: TOKEN_2022_PROGRAM_ID,
    });
    const balance = await connection.getBalance(wallet.publicKey);
    const solToken: TokenTypes = {
      mint: new PublicKey(SOL_MINT).toBase58(),
      balance: balance / LAMPORTS_PER_SOL,
      symbol: 'SOL',
      name: 'Solana',
      image: 'https://raw.githubusercontent.com/solana-labs/token-list/main/assets/mainnet/So11111111111111111111111111111111111111112/logo.png'
    };
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

export async function fetchAllPoolsCreated(wallet: WalletContextState, connection: Connection) {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }
  try {
    const raydium = await initRaydiumSDK(wallet)
    const userTokens = await fetchUserTokens(wallet, connection);
    console.log("userTokesn", userTokens.length)
    const cpmmConfigs = await raydium.api.getCpmmConfigs();

    if (raydium.cluster === "devnet") {
      cpmmConfigs.forEach((config) => {
        config.id = getCpmmPdaAmmConfigId(
          DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
          config.index
        ).publicKey.toBase58();
      });
    }
    //fetch pools for each pair of tokens
    const userPools = await fetchPoolsForTokenPairs(raydium, userTokens, cpmmConfigs[0].id);
    console.log("userpools", userPools.length)
    return userPools;
  } catch (error) {
    console.error("Error fetching user pools", error);
    return [];
  }
}


async function fetchPoolsForTokenPairs(raydium: Raydium, tokens: TokenTypes[], configId: string) {
  const pools = [];
  let count = 0;
  for (let i = 0; i < tokens.length; i++) {
    for (let j = 0; j < tokens.length; j++) {
      if (i === j) continue;
      count++;
      const tokenA = tokens[i];
      const tokenB = tokens[j];

      const poolInfo = await fetchPoolInfo(raydium, configId, new PublicKey(tokenA.mint), new PublicKey(tokenB.mint));

      if (poolInfo) {
        pools.push({
          poolId: poolInfo.poolId,
          tokenA: tokenA,
          tokenB: tokenB,
          poolInfo: poolInfo.info
        });
      }
    }
  }
  console.log("count", count)
  return pools;
}

export const fetchPoolInfo = async (
  raydium: Raydium,
  configId: string,
  tokenMintA: PublicKey,
  tokenMintB: PublicKey
) => {
  try {
    const { publicKey } = getCpmmPdaPoolId(
      DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
      new PublicKey(configId),
      tokenMintA,
      tokenMintB
    );
    const poolId = publicKey.toBase58();
    const poolInfo = await raydium.cpmm.getRpcPoolInfos([poolId]);
    return poolInfo ? { info: poolInfo[poolId], poolId } : null;
  } catch (error) {
    return null;
  }
};
