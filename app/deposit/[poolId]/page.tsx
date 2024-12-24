"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { deposit } from "@/lib/raydium/deposit";
import toast from "react-hot-toast";
import { Wallet, Plus } from "lucide-react";
import { fetchPoolInfoByIds } from "@/lib/raydium/helper";
import { connection } from "@/lib/constant";
import { PoolInfo } from "@/types/raydium";
import { PublicKey } from "@solana/web3.js";
import { use } from "react";
import {
  calculatePoolValueRatio,
  calculateUsdtValue,
  getTokenBalance,
} from "@/lib/raydium/utils";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function DepositPage({
  params,
}: {
  params: Promise<{ poolId: string }>;
}) {
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pool, setPool] = useState<PoolInfo | null>(null);
  const [tokenBBalance, setTokenBBalance] = useState<number>(0);
  const wallet = useWallet();
  const { poolId } = use(params);
  const [depositRatio, setDepositRatio] = useState<{ a: number; b: number }>({
    a: 0,
    b: 0,
  });

  const fetchPoolInfo = async () => {
    try {
      const res = await fetchPoolInfoByIds(wallet, [poolId], connection);
      setPool(res[0]);
      if (res[0]?.tokenB.mint) {
        const tokenBMint = new PublicKey(res[0].tokenB.mint);
        if (wallet.publicKey) {
          const balance = await getTokenBalance(wallet.publicKey, tokenBMint);
          setTokenBBalance(balance);
        }
      }
    } catch (error) {
      console.log("Error fetching pool Info", error);
      toast.error("Failed to fetch pool information");
    }
  };

  useEffect(() => {
    fetchPoolInfo();
  }, [wallet.connected]);

  const handleMax = (token: "A" | "B") => {
    if (!pool) return;
    const balance = token === "A" ? pool.tokenA.balance : tokenBBalance;
    if (token === "A") {
      setAmountA(balance.toString());
      updateOtherTokenAmount("A", balance.toString());
    } else {
      setAmountB(balance.toString());
      updateOtherTokenAmount("B", balance.toString());
    }
  };

  const updateOtherTokenAmount = (changedToken: "A" | "B", value: string) => {
    if (!pool || !value) {
      setAmountA(changedToken === "A" ? value : "");
      setAmountB(changedToken === "B" ? value : "");
      setDepositRatio({ a: 0, b: 0 });
      return;
    }
    const poolPrice = pool.poolInfo.poolPrice.toNumber();
    const amount = parseFloat(value);
    if (isNaN(amount)) {
      setAmountA(changedToken === "A" ? value : "");
      setAmountB(changedToken === "B" ? value : "");
      setDepositRatio({ a: 0, b: 0 });
      return;
    }

    let newAmountA: number, newAmountB: number;

    if (changedToken === "A") {
      newAmountA = amount;
      newAmountB = amount * poolPrice;
      setAmountA(value);
      setAmountB(newAmountB.toFixed(6));
    } else {
      newAmountB = amount;
      newAmountA = amount / poolPrice;
      setAmountB(value);
      setAmountA(newAmountA.toFixed(6));
    }
    updateDepositRatio(newAmountA, newAmountB);
  };

  const updateDepositRatio = (amountA: number, amountB: number) => {
    if (amountA && amountB) {
      const ratio = calculatePoolValueRatio(amountA, amountB);
      setDepositRatio({
        a: ratio.tokenAPercentage,
        b: ratio.tokenBPercentage,
      });
    } else {
      setDepositRatio({ a: 0, b: 0 });
    }
  };

  const handleDeposit = async () => {
    if (!wallet.connected) {
      toast.error("Please connect your wallet first");
      return;
    }
    if (!amountA || !amountB) {
      toast.error("Please enter token amounts");
      return;
    }
    if (!pool) {
      toast.error("Pool information not available");
      return;
    }
    const tokenABalance = pool.tokenA.balance;

    if (
      parseFloat(amountA) > tokenABalance ||
      parseFloat(amountB) > tokenBBalance
    ) {
      toast.error("Insufficient balance");
      return;
    }

    setIsLoading(true);
    try {
      await deposit(wallet, poolId, parseFloat(amountA));
      toast.success("Deposit successful!");
      setAmountA("");
      setAmountB("");
      fetchPoolInfo();
    } catch (error) {
      toast.error("Deposit failed!");
      console.error("Deposit failed:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const getButtonText = () => {
    if (!wallet.connected) return "Connect Wallet";
    if (!amountA || !amountB) return "Enter Token Amount";
    if (
      pool &&
      (parseFloat(amountA) > pool.tokenA.balance ||
        parseFloat(amountB) > tokenBBalance)
    ) {
      return "Insufficient Balance";
    }
    if (isLoading) return "Confirming...";
    return "Deposit";
  };

  return (
    <div className="container max-w-lg mx-auto p-4">
      <Card className="bg-zinc-900 border-zinc-700 text-white rounded-xl p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">
            Add Deposit Amount
          </h2>
          <div className="bg-zinc-800 rounded-lg px-3 py-1 text-sm text-white">
            1%
          </div>
        </div>

        <div className="bg-zinc-800 border-zinc-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pool?.tokenA.image && (
                <Image
                  src={pool.tokenA.image}
                  alt={pool.tokenA.symbol}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-lg font-medium text-white">
                {pool?.tokenA.symbol || "---"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {pool?.tokenA.balance.toFixed(4) || "0"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amountA}
              onChange={(e) => updateOtherTokenAmount("A", e.target.value)}
              className="bg-slate-900 border-none text-white text-lg w-full focus:border-none focus:outline-none"
              placeholder="0"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={() => handleMax("A")}
                className="text-pink-500 text-xs bg-transparent hover:bg-transparent focus:bg-transparent shadow-none"
              >
                Max
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            ~${calculateUsdtValue("A", amountA).toFixed(2)}
          </div>
        </div>

        <div className="flex justify-center">
          <div className="p-2.5 bg-zinc-800 border border-zinc-700 rounded-full text-white hover:bg-zinc-700">
            <Plus className="h-5 w-5 text-white" />
          </div>
        </div>

        <div className="bg-zinc-800 border-zinc-700 rounded-xl p-4 space-y-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {pool?.tokenB.image && (
                <Image
                  src={pool.tokenB.image}
                  alt={pool.tokenB.symbol}
                  className="w-8 h-8 rounded-full"
                />
              )}
              <span className="text-lg font-medium text-white">
                {pool?.tokenB.symbol || "---"}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Wallet className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">
                {tokenBBalance.toFixed(4) || "0"}
              </span>
            </div>
          </div>
          <div className="flex gap-2">
            <Input
              type="number"
              value={amountB}
              onChange={(e) => updateOtherTokenAmount("B", e.target.value)}
              className="bg-slate-900 border-none text-white text-lg w-full focus:border-none focus:outline-none"
              placeholder="0"
            />
            <div className="flex gap-1">
              <Button
                type="button"
                onClick={() => handleMax("B")}
                className="text-pink-500 text-xs bg-transparent hover:bg-transparent focus:bg-transparent shadow-none"
              >
                Max
              </Button>
            </div>
          </div>
          <div className="text-sm text-gray-400">
            ~${calculateUsdtValue("B", amountB).toFixed(2)}
          </div>
        </div>

        <div className="bg-zinc-800 border-zinc-700 rounded-xl p-4 space-y-2">
          <div className="flex justify-between">
            <span>Total Deposit</span>
            <span className="text-sm">
              {amountA && amountB
                ? `~$${(
                    calculateUsdtValue("A", amountA) +
                    calculateUsdtValue("B", amountB)
                  ).toFixed(2)}`
                : "--"}
            </span>
          </div>
          <div className="flex justify-between">
            <span>Deposit Ratio</span>
            <div className="flex items-center gap-1 text-xs">
              <span>{depositRatio.a.toFixed(2)}%</span>
              <span>/</span>
              <span>{depositRatio.b.toFixed(2)}%</span>
              {pool?.tokenA.image && (
                <Image
                  src={pool.tokenA.image}
                  alt={pool.tokenA.symbol}
                  className="w-5 h-5 rounded-full"
                />
              )}
              {pool?.tokenB.image && (
                <Image
                  src={pool.tokenB.image}
                  alt={pool.tokenB.symbol}
                  className="w-5 h-5 rounded-full -ml-2"
                />
              )}
            </div>
          </div>
        </div>

        <Button
          onClick={handleDeposit}
          disabled={!wallet.connected || !amountA || !amountB || isLoading}
          className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-6"
        >
          {getButtonText()}
        </Button>
      </Card>
    </div>
  );
}
