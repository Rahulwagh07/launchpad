import { BN } from "bn.js";
import { txVersion } from "../constant";
import {
  DEVNET_PROGRAM_ID,
  getCpmmPdaAmmConfigId
} from "@raydium-io/raydium-sdk-v2";
import { MintInfo, PoolCreationParams } from "@/types/raydium";
import { initRaydiumSDK } from "./init";
import {
  createAssociatedTokenAccountInstruction,
  createSyncNativeInstruction,
  getAssociatedTokenAddress,
  getMint,
  NATIVE_MINT_2022,
} from "@solana/spl-token";
import {
  Connection,
  PublicKey,
  SystemProgram,
  Transaction,
} from "@solana/web3.js";
import { WalletContextState } from "@solana/wallet-adapter-react";


export const createLiquidityPool = async ({
  connection,
  wallet,
  token1,
  token2,
  token1Amount,
  token2Amount,
  token1ProgramId,
  token2ProgramId,
}: PoolCreationParams) => {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  const raydium = await initRaydiumSDK(wallet);

  // wrap SOL if either token is SOL
  await wrapSolIfNativeToken(
    token1,
    token2,
    token1Amount,
    token2Amount,
    connection,
    wallet
  );

  const token1Decimals = await getTokenDecimals(
    token1,
    token1ProgramId,
    connection
  );
  const token2Decimals = await getTokenDecimals(
    token2,
    token2ProgramId,
    connection
  );

  const mintA = createMintInfo(token1, token1ProgramId, token1Decimals);
  const mintB = createMintInfo(token2, token2ProgramId, token2Decimals);

  const mintAAmount = new BN(token1Amount * 10 ** token1Decimals);
  const mintBAmount = new BN(token2Amount * 10 ** token2Decimals);

  const feeConfigs = await raydium.api.getCpmmConfigs();
  if (raydium.cluster === "devnet") {
    feeConfigs.forEach((config) => {
      config.id = getCpmmPdaAmmConfigId(
        DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
        config.index
      ).publicKey.toBase58();
    });
  }

  const { execute, extInfo } = await raydium.cpmm.createPool({
    programId: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_PROGRAM,
    poolFeeAccount: DEVNET_PROGRAM_ID.CREATE_CPMM_POOL_FEE_ACC,
    mintA,
    mintB,
    mintAAmount,
    mintBAmount,
    startTime: new BN(0),
    feeConfig: feeConfigs[0],
    associatedOnly: false,
    ownerInfo: { useSOLBalance: true },
    txVersion,
  });

  const { txId } = await execute({ sendAndConfirm: true });
  return { txId, extInfo };
};

export async function wrapSol(
  connection: Connection,
  wallet: WalletContextState,
  amountOfSol: number
): Promise<PublicKey> {
  if (!wallet.publicKey) {
    throw new Error("Wallet is not connected");
  }

  const associatedTokenAccount = await getAssociatedTokenAddress(
    NATIVE_MINT_2022,
    wallet.publicKey
  );

  try {
    const associatedTokenAccountBalance =
      await connection.getTokenAccountBalance(associatedTokenAccount);
    const isAccountEmpty = associatedTokenAccountBalance.value.uiAmount! <= 0;

    if (isAccountEmpty) {
      const wrapTransaction = new Transaction().add(
        createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          NATIVE_MINT_2022
        ),
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: associatedTokenAccount,
          lamports: Math.floor(amountOfSol * 1_000_000_000),
        }),
        createSyncNativeInstruction(associatedTokenAccount)
      );
      await wallet.sendTransaction(wrapTransaction, connection);
    } else {
      const transferTransaction = new Transaction().add(
        SystemProgram.transfer({
          fromPubkey: wallet.publicKey,
          toPubkey: associatedTokenAccount,
          lamports: Math.floor(amountOfSol * 1_000_000_000),
        })
      );

      await wallet.sendTransaction(transferTransaction, connection);
    }
    return associatedTokenAccount;
  } catch (error) {
    console.error("Error wrapping SOL:", error);
    throw error;
  }
}


const wrapSolIfNativeToken = async (
  token1: PublicKey,
  token2: PublicKey,
  token1Amount: number,
  token2Amount: number,
  connection: Connection,
  wallet: WalletContextState
) => {
  if (
    token1.toBase58() === NATIVE_MINT_2022.toBase58() ||
    token2.toBase58() === NATIVE_MINT_2022.toBase58()
  ) {
    const solAmount =
      token1.toBase58() === NATIVE_MINT_2022.toBase58()
        ? token1Amount
        : token2Amount;
    await wrapSol(connection, wallet, solAmount);
  }
};

const getTokenDecimals = async (
  token: PublicKey,
  programId: PublicKey,
  connection: Connection
) => {
  const mintInfo = await getMint(connection, token, "confirmed", programId);
  return mintInfo.decimals;
};

const createMintInfo = (
  token: PublicKey,
  programId: PublicKey,
  decimals: number
): MintInfo => ({
  address: token.toBase58(),
  programId: programId.toBase58(),
  decimals,
});

