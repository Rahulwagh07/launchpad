"use client";

import React, { useState } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { PublicKey } from "@solana/web3.js";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createLiquidityPool } from "@/lib/raydium/liquidity-pool";
import axios from "axios";

export default function LiquidityPoolCreator() {
  const { connection } = useConnection();
  const wallet = useWallet();
  const [token1, setToken1] = useState("");
  const [token2, setToken2] = useState("");
  const [token1Amount, setToken1Amount] = useState("");
  const [token2Amount, setToken2Amount] = useState("");
  const [token1ProgramId, setToken1ProgramId] = useState("");
  const [token2ProgramId, setToken2ProgramId] = useState("");
  const [status, setStatus] = useState("");

  const handleCreatePool = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!wallet.publicKey) {
      setStatus("Please connect your wallet first.");
      return;
    }
    try {
      setStatus("Creating liquidity pool...");
      const result = await createLiquidityPool({
        connection,
        wallet: wallet,
        token1: new PublicKey(token1),
        token2: new PublicKey(token2),
        token1Amount: parseFloat(token1Amount),
        token2Amount: parseFloat(token2Amount),
        token1ProgramId: new PublicKey(token1ProgramId),
        token2ProgramId: new PublicKey(token2ProgramId),
      });
      setStatus(
        `Liquidity pool created successfully! Transaction ID: ${result.txId}`
      );
      const poolId = result.extInfo.address.poolId.toString();
      await axios.post("/api/pool", {
        poolId: poolId,
        address: wallet.publicKey.toString(),
      });
    } catch (error) {
      console.error("Error creating liquidity pool:", error);
      setStatus(`Error creating liquidity pool: ${error}`);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto mt-10 bg-zinc-900 border-zinc-700 text-white">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center text-white">
          Create Liquidity Pool
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleCreatePool} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="token1" className="text-zinc-300">
              Token 1 Address
            </Label>
            <Input
              id="token1"
              value={token1}
              onChange={(e) => setToken1(e.target.value)}
              placeholder="Enter Token 1 Address"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token2" className="text-zinc-300">
              Token 2 Address
            </Label>
            <Input
              id="token2"
              value={token2}
              onChange={(e) => setToken2(e.target.value)}
              placeholder="Enter Token 2 Address"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token1Amount" className="text-zinc-300">
              Token 1 Amount
            </Label>
            <Input
              id="token1Amount"
              type="number"
              value={token1Amount}
              onChange={(e) => setToken1Amount(e.target.value)}
              placeholder="Enter Token 1 Amount"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token2Amount" className="text-zinc-300">
              Token 2 Amount
            </Label>
            <Input
              id="token2Amount"
              type="number"
              value={token2Amount}
              onChange={(e) => setToken2Amount(e.target.value)}
              placeholder="Enter Token 2 Amount"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token1ProgramId" className="text-zinc-300">
              Token 1 Program ID
            </Label>
            <Input
              id="token1ProgramId"
              value={token1ProgramId}
              onChange={(e) => setToken1ProgramId(e.target.value)}
              placeholder="Enter Token 1 Program ID"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="token2ProgramId" className="text-zinc-300">
              Token 2 Program ID
            </Label>
            <Input
              id="token2ProgramId"
              value={token2ProgramId}
              onChange={(e) => setToken2ProgramId(e.target.value)}
              placeholder="Enter Token 2 Program ID"
              required
              className="bg-zinc-800 border-zinc-700 text-white placeholder-zinc-500"
            />
          </div>
          <Button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Create Liquidity Pool
          </Button>
        </form>
        {status && (
          <div className="mt-4 p-3 rounded bg-zinc-800 text-zinc-300 border border-zinc-700">
            <p className="text-sm">{status}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
