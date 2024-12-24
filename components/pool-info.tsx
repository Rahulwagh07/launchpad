'use client'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { CopyButton } from './common/copy-button'
import { TokenTypes } from '@/types/token';
 
interface PoolInfoProps {
  poolId: string;
  tokenA: TokenTypes;
  tokenB: TokenTypes;
}


export function PoolInfo({ poolId, tokenA, tokenB }: PoolInfoProps) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex items-center gap-3 cursor-pointer">
          <div className="flex -space-x-2">
            <Avatar className="h-8 w-8 border-2 border-zinc-950">
              <AvatarImage src={tokenA.image} alt={tokenA.symbol} />
              <AvatarFallback>{tokenA.symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
            <Avatar className="h-8 w-8 border-2 border-zinc-950">
              <AvatarImage src={tokenB.image} alt={tokenB.symbol} />
              <AvatarFallback>{tokenB.symbol.slice(0, 2)}</AvatarFallback>
            </Avatar>
          </div>
          <div className="font-medium text-sm">
            {tokenA.symbol}-{tokenB.symbol}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="w-52 bg-slate-900 border-slate-800/50">
        <div className="space-y-3 text-white text-xs">
          <div className="flex items-center">
            <span>Pool id</span>
            <div className="flex items-center gap-2">
              <p className="px-2 py-1">
                {poolId.slice(0, 6)}...{poolId.slice(-4)}
              </p>
              <CopyButton value={poolId} label="Pool ID" />
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={tokenA.image} alt={tokenA.symbol} />
                </Avatar>
              </div>
              <div className="flex items-center gap-2">
                <p className="px-2 py-1">
                  {tokenA.mint.slice(0, 6)}...{tokenA.mint.slice(-4)}
                </p>
                <CopyButton value={tokenA.mint} label={`${tokenA.symbol} Mint`} />
              </div>
            </div>
            <div className="flex items-center">
              <div className="flex items-center gap-2">
                <Avatar className="h-6 w-6">
                  <AvatarImage src={tokenB.image} alt={tokenB.symbol} />
                </Avatar>
              </div>
              <div className="flex items-center gap-2">
                <p className="px-2 py-1">
                  {tokenB.mint.slice(0, 6)}...{tokenB.mint.slice(-4)}
                </p>
                <CopyButton value={tokenB.mint} label={`${tokenB.symbol} Mint`} />
              </div>
            </div>
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

