import { WalletContextState } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { initRaydiumSDK } from "./init";
import { BN } from "bn.js";
import { NATIVE_MINT_2022 } from "@solana/spl-token";
import { wrapSol } from "./liquidity-pool";
import {
  ApiV3PoolInfoStandardItemCpmm,
  ApiV3Token,
  CpmmRpcData,
  CurveCalculator,
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId,
  getCpmmPdaPoolId,
  Raydium,
} from "@raydium-io/raydium-sdk-v2";


export const swapTokenAForTokenB = async (
  wallet: WalletContextState,
  tokenMintA: PublicKey,
  amountOfTokenA: number,
  poolId: string
) => {
  try {
    const raydium = await initRaydiumSDK(wallet);

    const { poolInfo, poolKeys, rpcData } = await fetchPoolData(raydium, poolId);
    if (!poolInfo || !rpcData || !rpcData.configInfo) {
      throw new Error("Failed to fetch pool data.");
    }

    //decide token mint order
    const baseIn = tokenMintA.toBase58() === poolInfo.mintA.address;
    const mintA = baseIn ? poolInfo.mintA : poolInfo.mintB;

    const { swapSourceAmount, swapDestinationAmount } = getSwapReserves(mintA, rpcData);

    console.log(`Source: ${swapSourceAmount}, Destination: ${swapDestinationAmount}`);

    const amountInLamports = new BN(amountOfTokenA * 10 ** mintA.decimals);

    const swapResult = CurveCalculator.swap(
      amountInLamports,
      swapSourceAmount,
      swapDestinationAmount,
      rpcData.configInfo.tradeFeeRate
    );

    console.log(`Swap result:`, swapResult);

    //wrap sol 
    if (tokenMintA.toBase58() === NATIVE_MINT_2022.toBase58()) {
      await wrapSol(raydium.connection, wallet, amountOfTokenA);
    }

    const { execute } = await raydium.cpmm.swap({
      poolInfo: poolInfo as ApiV3PoolInfoStandardItemCpmm,
      poolKeys,
      inputAmount: amountInLamports,
      swapResult,
      slippage: 0.01, // 1% 
      baseIn,
    });

    const { txId } = await execute({ sendAndConfirm: true });

    console.log(`Swapped ${poolInfo.mintA.symbol} to ${poolInfo.mintB.symbol}:`, {
      txId: `https://explorer.solana.com/tx/${txId}`,
    });

    return true;
  } catch (error) {
    console.error(`Error during swap:`, error);
    return false;
  }
};

export const getAmountOfTokenBForTokenA = async (
  wallet: WalletContextState,
  tokenMintA: PublicKey,
  tokenMintB: PublicKey,
  amountOfTokenA: number
) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  try {
    const raydium = await initRaydiumSDK(wallet);

    // fetch pool information
    const poolInfos = await fetchCPMMPoolInfo(wallet, tokenMintA, tokenMintB, amountOfTokenA);
    if (!poolInfos) {
      console.log("No pool information found");
      return null;
    }

    const { poolId } = poolInfos;

    const { poolInfo, rpcData } = await raydium.cpmm.getPoolInfoFromRpc(poolId);
    console.log("poolinfo", poolInfo)

    if (!rpcData || !rpcData.configInfo) {
      console.log("Missing rpc data");
      return null;
    }

    const isBaseIn = tokenMintA.toBase58() === poolInfo.mintA.address;

    const mintA = isBaseIn ? poolInfo.mintA : poolInfo.mintB;
    const mintB = isBaseIn ? poolInfo.mintB : poolInfo.mintA;

    const [swapSourceAmount, swapDestinationAmount] =
      mintA.address === rpcData.mintA.toBase58()
        ? [rpcData.baseReserve, rpcData.quoteReserve]
        : [rpcData.quoteReserve, rpcData.baseReserve];

    const amountOfTokenAInLamports = new BN(amountOfTokenA * 10 ** mintA.decimals);

    const swapResult = CurveCalculator.swap(
      amountOfTokenAInLamports,
      swapSourceAmount,
      swapDestinationAmount,
      rpcData.configInfo.tradeFeeRate
    );

    if (!swapResult) {
      console.log("Swap result is undefined.");
      return null;
    }

    const newAmountOfTokenB = Number(swapResult.destinationAmountSwapped.toString()) / 10 ** mintB.decimals
    return {
      newAmountOfTokenB,
      poolId,
    };

  } catch (error) {
    console.error("Error in getting amount of token B", error);
    return null;
  }
};

const fetchPoolData = async (raydium: Raydium, poolId: string) => {
  try {
    if (raydium.cluster === "mainnet") {
      const data = await raydium.api.fetchPoolById({ ids: poolId });
      const rpcData = await raydium.cpmm.getRpcPoolInfo(data[0].id, true);
      return { poolInfo: data[0], rpcData };
    } else {
      const { poolInfo, poolKeys, rpcData } = await raydium.cpmm.getPoolInfoFromRpc(poolId);
      return { poolInfo, poolKeys, rpcData };
    }
  } catch (error) {
    console.error("Error fetching pool data:", error);
    return { poolInfo: null, poolKeys: null, rpcData: null };
  }
};


//get the amount of  token held within the liquidity pool
const getSwapReserves = (mintA: ApiV3Token, rpcData: CpmmRpcData) => {
  const isMintAInBase = mintA.address === rpcData.mintA.toBase58();
  return {
    swapSourceAmount: isMintAInBase ? rpcData.baseReserve : rpcData.quoteReserve,
    swapDestinationAmount: isMintAInBase ? rpcData.quoteReserve : rpcData.baseReserve,
  };
};

const fetchCPMMPoolInfo = async (
  wallet: WalletContextState,
  tokenMintA: PublicKey,
  tokenMintB: PublicKey,
  amountOfTokenA: number
) => {
  try {
    const raydium = await initRaydiumSDK(wallet);
    const cpmmConfigs = await raydium.api.getCpmmConfigs();

    if (raydium.cluster === "devnet") {
      cpmmConfigs.forEach((config) => {
        config.id = getCpmmPdaAmmConfigId(
          DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
          config.index
        ).publicKey.toBase58();
      });
    }

    //(TokenMintA, TokenMintB) || (TokenMintB, TokenMintA) -> to check both orders
    let poolInfo = await fetchPoolInfo(
      raydium,
      cpmmConfigs[0].id,
      tokenMintA,
      tokenMintB
    );
    if (!poolInfo) {
      poolInfo = await fetchPoolInfo(
        raydium,
        cpmmConfigs[0].id,
        tokenMintB,
        tokenMintA
      );
    }

    if (!poolInfo) return null;

    const {
      vaultAAmount,
      vaultBAmount,
      mintA,
      poolPrice,
      mintDecimalA,
      mintDecimalB,
    } = poolInfo.info;
    const poolId = poolInfo.poolId;

    const isTokenAFirst = tokenMintA.toBase58() === mintA.toBase58();
    const tokenAInfo = {
      mint: isTokenAFirst ? tokenMintA.toBase58() : tokenMintB.toBase58(),
      amount: isTokenAFirst
        ? vaultAAmount.div(new BN(10 ** (isTokenAFirst ? mintDecimalA : mintDecimalB)))
        : vaultBAmount.div(new BN(10 ** (isTokenAFirst ? mintDecimalA : mintDecimalB)))
    };
    const tokenBInfo = {
      mint: isTokenAFirst ? tokenMintB.toBase58() : tokenMintA.toBase58(),
      amount:
        isTokenAFirst
          ? vaultBAmount.div(new BN(10 ** (isTokenAFirst ? mintDecimalB : mintDecimalA)))
          : vaultAAmount.div(new BN(10 ** (isTokenAFirst ? mintDecimalB : mintDecimalA)))
    };
    const exchangeRate = isTokenAFirst
      ? Number(poolPrice)
      : 1 / Number(poolPrice);

    //constant product algo to get token B amount
    const constantProduct = Number(tokenAInfo.amount.toString()) * Number(tokenBInfo.amount.toString());
    const newAmountOfTokenA = Number(tokenAInfo.amount.toString()) + amountOfTokenA;
    const newAmountOfTokenB =
      Number(tokenBInfo.amount.toString()) - constantProduct / newAmountOfTokenA;

    return {
      poolId,
      poolPrice: Number(poolPrice),
      tokenAInfo,
      tokenBInfo,
      exchangeRate,
      newAmountOfTokenB,
    };
  } catch (error) {
    console.error("Error in fetching CPMM Pool Info:", error);
    return null;
  }
};

const fetchPoolInfo = async (
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
  } catch (_) {
    return null;
  }
};