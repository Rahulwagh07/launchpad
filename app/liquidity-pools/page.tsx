"use client";

import { useEffect, useState } from "react";
import { connection } from "@/lib/constant";
import { fetchAllPoolsCreated } from "@/lib/raydium/helper";
import { useWallet } from "@solana/wallet-adapter-react";
import { Card, CardContent} from "@/components/ui/card";
import { PoolInfo } from "@/types/raydium";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import toast from "react-hot-toast";
import Link from "next/link";

export default function Page() {
  const wallet = useWallet();
  const [pools, setPools] = useState<PoolInfo[]>([]);

  const handleFetchLiquidityInfo = async () => {
    if (!wallet.connected) {
      return;
    }

    try {
      const liquidityInfo = await fetchAllPoolsCreated(wallet, connection);
      setPools(liquidityInfo);
      console.log(liquidityInfo);
    } catch (error) {
      console.error("Failed to fetch liquidity info:", error);
      toast.error("Failed to fetch liquidity info. Please try again.");
    }
  };

  useEffect(() => {
    handleFetchLiquidityInfo();
  }, [wallet.publicKey]);

  return (
    <div className="p-8 mx-auto">
      <div className="flex justify-between mx-auto max-w-5xl">
        <h1 className="text-3xl font-bold mb-8 text-center">
          Your Liquidity Pools
        </h1>
        <Link href={"/create-pool"}>Create</Link>
      </div>
      {pools.length > 0 ? (
        <div className="grid grid-cols-1 gap-6 mx-auto max-w-5xl">
          {pools.map((pool) => (
            <Card
              key={pool.poolId}
              className="bg-zinc-900 border-zinc-700 text-white"
            >
              <CardContent>
                <div className="flex  gap-4">
                  <div className="flex">
                    <div className="bg-gray-700 rounded-full  p-1.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={pool.tokenA.image}
                          alt={pool.tokenA.symbol}
                        />
                        <AvatarFallback>{pool.tokenA.symbol}</AvatarFallback>
                      </Avatar>
                    </div>
                    <div className="bg-gray-700 rounded-full p-1.5">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={pool.tokenB.image}
                          alt={pool.tokenB.symbol}
                        />
                        <AvatarFallback>{pool.tokenB.symbol}</AvatarFallback>
                      </Avatar>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <span className="font-semibold text-lg">
                      {pool.tokenA.symbol} - {pool.tokenB.symbol}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-lg">
                      liquidity -{" "}
                      {Number(pool.poolInfo.lpAmount.toString()) /
                        10 ** pool.poolInfo.lpDecimals}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No liquidity pools found</p>
      )}
    </div>
  );
}
