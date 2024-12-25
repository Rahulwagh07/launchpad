"use client";

import { connection } from "@/lib/constant";
import { fetchPoolInfoByIds } from "@/lib/raydium/helper";
import { calculateUsdtValue, getTokenBalance } from "@/lib/raydium/utils";
import { withdraw } from "@/lib/raydium/withdraw";
import { PoolInfo } from "@/types/raydium";
import { TOKEN_PROGRAM_ID } from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import React, { use, useEffect, useState } from "react";
import toast from "react-hot-toast";
import { Wallet } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CopyButton } from "@/components/common/copy-button";

export default function WithdrawPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const [tokenBalance, setTokenBalance] = useState<number>(0);
  const wallet = useWallet();
  const { poolId } = use(params);
  const [pool, setPool] = useState<PoolInfo | null>(null);
  const [amount, setAmount] = useState<string>("");
  const [isLoading, setIsLoading] = useState(false);

  const fetchPoolInfo = async () => {
    try {
      const res = await fetchPoolInfoByIds(wallet, [poolId], connection);
      setPool(res[0]);
      if (wallet.publicKey) {
        const balance = await getTokenBalance(
          wallet.publicKey,
          res[0].poolInfo.mintLp,
          TOKEN_PROGRAM_ID
        );
        setTokenBalance(balance);
      }
    } catch (error) {
      console.log("Error fetching pool info", error);
      toast.error("Failed to fetch pool information");
    }
  };

  useEffect(() => {
    fetchPoolInfo();
  }, [poolId, wallet.connected]);

  const handleWithdrawLiquidity = async () => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet");
      return;
    }

    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Please enter a valid amount");
      return;
    }

    if (parseFloat(amount) > tokenBalance) {
      toast.error("Insufficient LP token balance");
      return;
    }

    try {
      setIsLoading(true);
      const lpAmount =
        parseFloat(amount) * 10 ** (pool?.poolInfo.lpDecimals || 0);
      await withdraw(wallet, poolId, lpAmount);
      toast.success("Withdraw successful");
      fetchPoolInfo();
    } catch (error) {
      console.log("Error in withdraw liquidity", error);
      toast.error("Failed to withdraw liquidity");
    } finally {
      setIsLoading(false);
    }
  };

  const handleMax = () => {
    setAmount(tokenBalance.toString() || "0");
  };

  const getButtonText = () => {
    if (!wallet.connected) return "Connect Wallet";
    if (!amount) return "Enter Amount";
    if (parseFloat(amount) > tokenBalance) {
      return "Insufficient Balance";
    }
    if (isLoading) return "Confirming...";
    return "Withdraw";
  };

  return (
    <div className="container max-w-lg mx-auto p-4">
      <Card className="bg-zinc-900 border-zinc-700 text-white rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Withdraw Liquidity
          </h2>
        </div>

        <div className="bg-zinc-800 border-zinc-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              LP Token:
              <p className="px-1 text-sm text-gray-400">
                {pool?.poolInfo.mintLp.toString().slice(0, 6)}...
                {pool?.poolInfo.mintLp.toString().slice(-4)}
              </p>
              <CopyButton
                value={pool?.poolInfo.mintLp.toString() || ""}
                label="Token Mint"
              />
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {tokenBalance.toFixed(4) || "0"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-slate-900 border-none text-white text-lg w-full focus:border-none focus:outline-none"
              placeholder="0"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={() => handleMax()}
                className="text-pink-500 text-xs bg-transparent hover:bg-transparent focus:bg-transparent shadow-none"
              >
                Max
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            ~${calculateUsdtValue("C", amount).toFixed(2)}
          </div>
        </div>
        <Button
          onClick={handleWithdrawLiquidity}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-6 px-4 rounded-xl"
          disabled={
            !wallet.connected ||
            !amount ||
            parseFloat(amount) <= 0 ||
            parseFloat(amount) > tokenBalance
          }
        >
          {getButtonText()}
        </Button>
      </Card>
    </div>
  );
}
