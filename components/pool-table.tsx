'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { PoolInfo } from './pool-info'
import type { PoolInfo as PoolInfoType } from '@/types/raydium'
import SwapIcon from './icons/swap'

interface PoolsTableProps {
  pools: PoolInfoType[]
}

export function PoolsTable({ pools }: PoolsTableProps) {
  return (
    <div className="relative">
      <table className="w-full text-left">
        <thead>
          <tr className="border-b border-zinc-800">
            <th className="sm:px-4 py-3 text-sm font-medium text-zinc-400">Pool</th>
            <th className="sm:px-4 py-3 text-sm font-medium text-zinc-400">
              Liquidity
            </th>
            <th className="sm:px-4 py-3 text-sm font-medium text-zinc-400"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-800">
          {pools.map((pool) => (
            <tr
              key={pool.poolId}
              className="bg-zinc-950/50 hover:bg-zinc-900/50 transition-colors "
            >
              <td className="sm:px-4 py-3">
                <PoolInfo
                  poolId={pool.poolId}
                  tokenA={pool.tokenA}
                  tokenB={pool.tokenB}
                />
              </td>
              <td className="sm:px-4 py-3">
                <div className="font-medium text-sm">
                  {(
                    Number(pool.poolInfo.lpAmount.toString()) /
                    10 ** pool.poolInfo.lpDecimals
                  ).toLocaleString(undefined, {
                    maximumFractionDigits: 2,
                  })}
                </div>
              </td>
              <td className="sm:px-4 py-3">
                <div className="flex items-center justify-end gap-2">
                  <Link href={`/swap/?inputMint=${pool.tokenA.mint}&outputMint=${pool.tokenB.mint}`}>
                    <Button
                      size="sm"
                      className="bg-cyan-500/10 text-cyan-500 hover:bg-cyan-500/20"
                    >
                      <SwapIcon color='#06b6d4' className='hidden sm:block'/>
                      Swap
                    </Button>
                  </Link>
                  {/* //to do */}
                  <Link href={`/deposit/${pool.poolId}`}>          
                    <Button
                      size="sm"
                      variant="outline"
                      className="border-cyan-500/20 text-cyan-500 hover:text-cyan-500/50 hover:bg-cyan-500/10"
                    >
                      Deposit
                    </Button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

