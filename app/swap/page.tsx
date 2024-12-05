"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ChevronDown } from "lucide-react";
import { TokenTypes } from "@/types/token";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { fetchUserTokens } from "@/lib/raydium/helper";
import {
  getAmountOfTokenBForTokenA,
  swapTokenAForTokenB,
} from "@/lib/raydium/swap";
import { PublicKey } from "@solana/web3.js";
import toast from "react-hot-toast";
import { TokenSelectModal } from "@/components/token-select-modal";
import Image from "next/image";
import { SOL_MINT } from "@/lib/constant";
import swapSvg from "@/public/images/swap.svg";

export default function TokenSwap() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [userTokens, setUserTokens] = useState<TokenTypes[]>([]);
  const [selectedTokenA, setSelectedTokenA] = useState<TokenTypes | null>(null);
  const [selectedTokenB, setSelectedTokenB] = useState<TokenTypes | null>(null);
  const [amountA, setAmountA] = useState<string>("");
  const [amountB, setAmountB] = useState<number | null>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [calculatingAmountB, setCalculatingAmountB] = useState<boolean>(false);
  const [poolId, setPoolId] = useState<string | null>(null);
  const [isSelectingTokenA, setIsSelectingTokenA] = useState(false);
  const [isSelectingTokenB, setIsSelectingTokenB] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTokens = async () => {
      if (wallet.publicKey) {
        const res = await fetchUserTokens(wallet, connection);
        setUserTokens(res);
        const solToken = res.find((token) => token.mint === SOL_MINT);
        if (solToken) {
          setSelectedTokenA(solToken);
        }
      }
    };
    fetchTokens();
  }, [wallet.publicKey, connection]);

  const calculateAmountB = async () => {
    if (selectedTokenA && selectedTokenB && amountA) {
      setCalculatingAmountB(true);
      try {
        const result = await getAmountOfTokenBForTokenA(
          wallet,
          new PublicKey(selectedTokenA.mint),
          new PublicKey(selectedTokenB.mint),
          parseFloat(amountA)
        );
        if (result === null) {
          setAmountB(null);
          setError(`No Liquidity pool found for`);
          setTimeout(() => {
            setError(null);
          }, 2000);
        } else {
          setAmountB(result.newAmountOfTokenB);
          setPoolId(result.poolId);
        }
      } catch (error) {
        console.error("Error calculating amount B:", error);
        setAmountB(null);
      } finally {
        setCalculatingAmountB(false);
      }
    } else {
      setAmountB(0);
    }
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      calculateAmountB();
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [selectedTokenA, selectedTokenB, amountA]);

  const handleSwap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTokenA || !selectedTokenB || !amountA || !amountB) {
      toast.error(
        "Incomplete Information: Please select tokens and enter an amount to swap."
      );
      return;
    }
    setLoading(true);
    try {
      if (!poolId) {
        toast.error("Pool Id not found");
        return;
      }
      const swapResult = await swapTokenAForTokenB(
        wallet,
        new PublicKey(selectedTokenA.mint),
        parseFloat(amountA),
        poolId
      );
      if (swapResult) {
        toast.success("Swap Successful");
        setAmountA("");
        setAmountB(0);
      } else {
        toast.error("Swap failed");
      }
    } catch (error) {
      console.error("Error swapping tokens:", error);
      toast.error("Failed to swap tokens");
    } finally {
      setLoading(false);
    }
  };
  const handleSwapInputs = () => {
    setSelectedTokenA(selectedTokenB);
    setSelectedTokenB(selectedTokenA);
    setAmountA("");
    setAmountB(0);
  };
  const handleAmountAChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === "" || (Number(value) >= 0 && !isNaN(Number(value)))) {
      setAmountA(value);
    }
  };
  const handleMaxClick = () => {
    if (selectedTokenA) {
      setAmountA(selectedTokenA.balance.toString());
    }
  };

  const renderTokenButton = (token: TokenTypes | null, onClick: () => void) => (
    <Button
      type="button"
      variant="custom"
      onClick={onClick}
      className="flex items-center gap-2 bg-transparent hover:bg-zinc-800"
    >
      {token ? (
        <>
          {typeof token.image === "string" ? (
            <Image
              src={token.image}
              alt={token.name}
              width={24}
              height={24}
              className="rounded-full"
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
  );

  return (
    <Card className="w-full max-w-md p-6 mx-auto mt-10 bg-zinc-900 border-zinc-700 text-white">
      <CardContent>
        <form onSubmit={handleSwap} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sellToken" className="text-zinc-300">
              You pay
            </Label>
            <div className="bg-zinc-800 border-zinc-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <Input
                  id="sellAmount"
                  type="number"
                  value={amountA}
                  onChange={handleAmountAChange}
                  placeholder="0"
                  className="bg-slate-900 border-none focus:outline-none text-white text-lg w-full"
                />
                {renderTokenButton(selectedTokenA, () =>
                  setIsSelectingTokenA(true)
                )}
              </div>
              <div className="flex justify-between items-center text-sm text-gray-400">
                <span>Balance: {selectedTokenA?.balance.toFixed(4) || 0}</span>
                <Button
                  type="button"
                  onClick={handleMaxClick}
                  className="text-pink-500 bg-transparent hover:bg-transparent focus:bg-transparent shadow-none"
                >
                  Max
                </Button>
              </div>
            </div>
          </div>

          <div className=" text-center">
            <Button
              onClick={handleSwapInputs}
              type="button"
              className="p-2 bg-zinc-800 border border-zinc-700 rounded-full text-white hover:bg-zinc-700"
            >
              <Image
                src={swapSvg}
                alt="s"
                width={20}
                height={20}
                className="rotate-90"
              />
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="buyToken" className="text-zinc-300">
              You receive
            </Label>
            <div className="bg-zinc-800 border-zinc-700 rounded-md p-4">
              <div className="flex justify-between items-center mb-3">
                <Input
                  id="buyAmount"
                  type="number"
                  value={amountB !== null ? amountB.toFixed(6) : ""}
                  readOnly
                  placeholder="0"
                  className="bg-transparent border-none text-white text-lg w-full focus:border-none focus:outline-none"
                />
                {renderTokenButton(selectedTokenB, () =>
                  setIsSelectingTokenB(true)
                )}
              </div>
            </div>
          </div>
          <div className="text-red-400 text-sm">
            {error && (
              <>
                {error}
                <span className="font-semibold">
                  {" "}
                  {selectedTokenA?.symbol} / {selectedTokenB?.symbol}
                </span>
              </>
            )}
          </div>
          <Button
            type="submit"
            disabled={
              loading ||
              calculatingAmountB ||
              !selectedTokenA ||
              !selectedTokenB ||
              !amountA
            }
            className="w-full bg-pink-600 text-white hover:bg-pink-700 disabled:bg-pink-800 disabled:cursor-not-allowed"
          >
            {loading
              ? "Swapping..."
              : calculatingAmountB
              ? "Computing"
              : "Swap"}
          </Button>
        </form>

        <TokenSelectModal
          isOpen={isSelectingTokenA}
          onClose={() => setIsSelectingTokenA(false)}
          tokens={userTokens}
          onSelect={setSelectedTokenA}
          selectedToken2={selectedTokenB}
        />

        <TokenSelectModal
          isOpen={isSelectingTokenB}
          onClose={() => setIsSelectingTokenB(false)}
          tokens={userTokens}
          onSelect={setSelectedTokenB}
          selectedToken2={selectedTokenA}
        />
      </CardContent>
    </Card>
  );
}
