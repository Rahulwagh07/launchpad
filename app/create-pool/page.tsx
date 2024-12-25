"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { TokenSelectModal } from "@/components/token-select-modal";
import { TokenTypes } from "@/types/token";
import { ChevronDown, Plus } from "lucide-react";
import { createLiquidityPool } from "@/lib/raydium/liquidity-pool";
import { fetchUserTokens } from "@/lib/raydium/helper";
import toast from "react-hot-toast";
import axios from "axios";

export default function LiquidityPool() {
  const { connection } = useConnection();
  const wallet = useWallet();

  const [isSelectingTokenA, setIsSelectingTokenA] = useState(false);
  const [isSelectingTokenB, setIsSelectingTokenB] = useState(false);
  const [selectedTokenA, setSelectedTokenA] = useState<TokenTypes | null>(null);
  const [selectedTokenB, setSelectedTokenB] = useState<TokenTypes | null>(null);
  const [amountA, setAmountA] = useState("");
  const [amountB, setAmountB] = useState("");
  const [loading, setLoading] = useState(false);
  const [userTokens, setUserTokens] = useState<TokenTypes[]>([]);

  useEffect(() => {
    const fetchTokens = async () => {
      if (wallet.publicKey) {
        const res = await fetchUserTokens(wallet, connection);
        setUserTokens(res);
      }
    };
    fetchTokens();
  }, [wallet.publicKey, connection]);

  const isBalanceSufficient = () => {
    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      return true;
    }
    const sufficientA = parseFloat(amountA) <= selectedTokenA.balance;
    const sufficientB = parseFloat(amountB) <= selectedTokenB.balance;
    return sufficientA && sufficientB;
  };

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      toast.error("Please connect your wallet first.");
      return;
    }
    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      toast.error("Please select tokens and enter amounts");
      return;
    }
    if (!isBalanceSufficient()) {
      toast.error("Insufficient balance");
      return;
    }

    setLoading(true);
    try {
      const result = await createLiquidityPool({
        connection,
        wallet: wallet,
        token1: new PublicKey(selectedTokenA.mint),
        token2: new PublicKey(selectedTokenB.mint),
        token1Amount: parseFloat(amountA),
        token2Amount: parseFloat(amountB),
      });

      if (!result) {
        toast.error("Transaction Failed");
        return;
      }
      const poolId = result.extInfo.address.poolId.toString();
      const response = await axios.get(`/api/check-pool?poolId=${poolId}`);
      console.log(response.data);
      if (response.data.isExist) {
        toast.error(`${poolId} alreaddy exist`);
        return;
      }
      await axios.post("/api/pool", {
        poolId: poolId,
        address: wallet.publicKey.toString(),
      });
      toast.success(
        `Liquidity pool created successfully! Transaction ID: ${result.txId}`
      );
      setAmountA("");
      setAmountB("");
      setSelectedTokenA(null);
      setSelectedTokenB(null);
    } catch (error) {
      console.error("Error creating liquidity pool:", error);
      toast.error(`Error creating liquidity pool: ${error}`);
    } finally {
      setLoading(false);
    }
  };

  const handleTokenSelect = (token: TokenTypes | null, isTokenA: boolean) => {
    if (isTokenA) {
      setSelectedTokenA(token);
      setIsSelectingTokenA(false);
    } else {
      setSelectedTokenB(token);
      setIsSelectingTokenB(false);
    }
  };

  const renderTokenInput = (
    isTokenA: boolean,
    token: TokenTypes | null,
    amount: string,
    setAmount: (value: string) => void
  ) => (
    <div className="space-y-2">
      <div className="text-sm text-white">
        {isTokenA ? "Base token" : "Quote token"}
      </div>
      <div className="bg-zinc-800 rounded-lg p-6">
        <div className="flex items-center justify-between gap-4">
          <Input
            type="number"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            className="bg-slate-900 border-none focus:outline-none text-white text-lg w-full"
          />
          <Button
            type="button"
            variant="custom"
            onClick={() =>
              isTokenA ? setIsSelectingTokenA(true) : setIsSelectingTokenB(true)
            }
            className="flex items-center gap-2 hover:bg-zinc-700 text-white"
          >
            {token ? (
              <>
                {typeof token.image === "string" ? (
                  <Image
                    src={token.image}
                    alt={token.symbol}
                    width={24}
                    height={24}
                    className="h-6 w-6 rounded-full"
                  />
                ) : (
                  token.image
                )}
                <span>{token.symbol}</span>
              </>
            ) : (
              <span>Select Token</span>
            )}
            <ChevronDown className="h-4 w-4" />
          </Button>
        </div>
        {token && (
          <div className="mt-2 text-sm text-gray-400">
            Balance: {token.balance.toFixed(6)}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="container max-w-lg mx-auto p-4">
      <Card className="w-full max-w-md mx-auto bg-zinc-900 border-zinc-700">
        <CardContent className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-semibold text-white">
              Create Liquidity Pool
            </h2>
          </div>
          <form onSubmit={handleCreatePool} className="space-y-6">
            {renderTokenInput(true, selectedTokenA, amountA, setAmountA)}

            <div className="flex justify-center">
              <div className="bg-zinc-800 rounded-full p-2">
                <Plus className="w-6 h-6 text-gray-400" />
              </div>
            </div>

            {renderTokenInput(false, selectedTokenB, amountB, setAmountB)}

            <Button
              type="submit"
              className="w-full bg-pink-600 hover:bg-pink-700 text-white font-medium py-6 rounded-xl"
              disabled={
                !selectedTokenA ||
                !selectedTokenB ||
                !amountA ||
                !amountB ||
                loading ||
                !isBalanceSufficient()
              }
            >
              {loading
                ? "Creating Pool"
                : !selectedTokenA || !selectedTokenB || !amountA || !amountB
                ? "Select Tokens and Amounts"
                : isBalanceSufficient()
                ? "Initialize Liquidity Pool"
                : "Insufficient Balance"}
            </Button>
          </form>

          <TokenSelectModal
            isOpen={isSelectingTokenA}
            onClose={() => setIsSelectingTokenA(false)}
            onSelect={(token) => handleTokenSelect(token, true)}
            tokens={userTokens}
            selectedToken2={selectedTokenB}
          />

          <TokenSelectModal
            isOpen={isSelectingTokenB}
            onClose={() => setIsSelectingTokenB(false)}
            onSelect={(token) => handleTokenSelect(token, false)}
            tokens={userTokens}
            selectedToken2={selectedTokenA}
          />
        </CardContent>
      </Card>
    </div>
  );
}
