import { CREATE_CPMM_POOL_PROGRAM, DEV_CREATE_CPMM_POOL_PROGRAM } from '@raydium-io/raydium-sdk-v2'
import axios from 'axios';
import { PublicKey } from '@solana/web3.js';
import { connection } from '../constant';
import { PoolInfo } from '@/types/raydium';

const VALID_PROGRAM_ID = new Set([CREATE_CPMM_POOL_PROGRAM.toBase58(), DEV_CREATE_CPMM_POOL_PROGRAM.toBase58()]);
export const isValidCpmm = (id: string) => VALID_PROGRAM_ID.has(id);

export const getCurrentSolanPrice = async () => {
  try {
    const response = await axios.get('https://sandbox-api.coinmarketcap.com/v1/cryptocurrency/listings/latest', {
      headers: {
        'X-CMC_PRO_API_KEY': process.env.COINMARKET_API_KEY,
      },
    });
    console.log("coinmarket res", response)
  } catch (error) {
    console.log("Error getting coinmarket data", error)
  }
}

export const getTokenBalance = async (walletAddress: PublicKey, tokenAccountAddress: PublicKey, programId: PublicKey) => {
  try {
    const tokenAccounts = await connection.getParsedTokenAccountsByOwner(walletAddress, {
      programId: programId,
    });

    const tokenAccountInfo = tokenAccounts.value.find(account => {
      return account.account.data.parsed.info.mint === tokenAccountAddress.toString();
    });

    if (tokenAccountInfo) {
      const balance = tokenAccountInfo.account.data.parsed.info.tokenAmount.uiAmount;
      return balance || 0;
    } else {
      console.log("Token account not found");
      return 0;
    }
  } catch (error) {
    console.log("Error fetching token balance:", error);
    return 0;
  }
}

export const calculateDepositRatioAndLpTokenToMint = (
  poolInfo: PoolInfo,
  tokenAAmount: number,
  tokenBAmount: number
) => {
  const {
    vaultAAmount,
    vaultBAmount,
    lpAmount,
    mintDecimalA,
    mintDecimalB,
    lpDecimals
  } = poolInfo.poolInfo;

  const currentTokenA = Number(vaultAAmount) / Math.pow(10, mintDecimalA);
  const currentTokenB = Number(vaultBAmount) / Math.pow(10, mintDecimalB);
  const currentLPSupply = Number(lpAmount) / Math.pow(10, lpDecimals);

  if (currentLPSupply === 0) {
    return Math.sqrt(tokenAAmount * tokenBAmount) * Math.pow(10, lpDecimals);
  }

  const shareRatio = Math.min(
    tokenAAmount / currentTokenA,
    tokenBAmount / currentTokenB
  );

  const lpTokensToMint = shareRatio * currentLPSupply;
  const totalSupply = currentLPSupply + lpTokensToMint;
  const depositRatio = (lpTokensToMint / totalSupply) * 100;
  return depositRatio
};

export const calculatePoolValueRatio = (
  tokenAValue: number,
  tokenBValue: number
) => {
  const tokenAAmount = tokenAValue * 200; //converting sol to usdt
  const totalPoolValue = tokenAAmount + tokenBValue;
  const tokenAPercentage = (tokenAAmount / totalPoolValue) * 100;
  const tokenBPercentage = (tokenBValue / totalPoolValue) * 100;
  return {
    tokenAPercentage,
    tokenBPercentage
  };
};

export const calculateUsdtValue = (tokenType: "A" | "B" | "C", amount: string) => {
  if (!amount) return 0;
  const value = parseFloat(amount);
  if (isNaN(value)) return 0;
  if (tokenType === "A") {
    return value * 200;
  } else if (tokenType === "B") {
    return value * 0.98;
  } else if (tokenType === "C") {
    return value * 200.98;
  }
  return 0;
};
