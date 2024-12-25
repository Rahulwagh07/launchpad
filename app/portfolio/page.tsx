"use client";

import { useEffect, useState } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { motion } from "framer-motion";
import { PlusCircle } from "lucide-react";
import { PoolsTable } from "@/components/pool-table";
import { PoolsSkeleton } from "@/components/skelton/pool-skelton";
import { connection } from "@/lib/constant";
import { fetchPoolInfoByIds } from "@/lib/raydium/helper";
import type { PoolInfo } from "@/types/raydium";
import axios from "axios";
import { ConnectWalletButton } from "@/components/common/wallet-button";
import MainButton from "@/components/common/button";

export default function Page() {
  const wallet = useWallet();
  const [pools, setPools] = useState<PoolInfo[]>([]);
  const [loading, setLoading] = useState(true);

  const handleFetchLiquidityInfo = async () => {
    if (!wallet.connected) {
      setLoading(false);
      return;
    }

    try {
      const res = await axios.get(
        `/api/pool/?address=${wallet.publicKey?.toString()}`
      );
      const poolIds = res.data.data;
      const liquidityInfo = await fetchPoolInfoByIds(
        wallet,
        poolIds,
        connection
      );
      setPools(liquidityInfo);
    } catch (error) {
      console.error("Failed to fetch liquidity info:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleFetchLiquidityInfo();
  }, [wallet.publicKey]);

  return (
    <div className="p-2 md:py-8">
      <div className="mx-auto w-full sm:w-8/12">
        <div className="mb-8 flex items-center justify-between">
          <motion.h1
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="text-2xl font-bold md:text-3xl"
          >
            My Portfolio
          </motion.h1>
        </div>
        <div className="rounded-lg border border-zinc-800 bg-zinc-950/50 px-2">
           {
            wallet.connected ? 
             <>
             {loading ? (
              <div className="p-4">
                <PoolsSkeleton />
              </div>
            ) : pools.length > 0 ? (
              <PoolsTable pools={pools} />
            ) : (
              <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
                <p className="mb-4 text-zinc-400">No liquidity pools found! Creat your first liquidity pool.</p>
                <MainButton 
                  href="/create-pool"
                  icon={<PlusCircle />}
                  text="Create Pool" 
                />
              </div>
            )}</> :
            <>
            <div className="flex min-h-[400px] flex-col items-center justify-center p-4">
                <p className="mb-4 text-zinc-400">Connect your wallet</p>
                  <ConnectWalletButton/>
              </div>
            </>
           }
        </div>
      </div>
    </div>
  );
}
