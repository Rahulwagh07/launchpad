'use client'

import { motion } from 'framer-motion'
import { ExternalLink, ReplaceIcon as SwapIcon } from 'lucide-react'
import Link from 'next/link'

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from '@/components/ui/hover-card'
import { TokenTypes } from '@/types/token'
import { CopyButton } from './common/copy-button'

interface PoolCardProps {
  poolId: string,
  tokenA: TokenTypes,
  tokenB:TokenTypes,
  liquidity: number
}

export function PoolCard({ poolId, tokenA, tokenB, liquidity }: PoolCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
    >
      <Card className="relative overflow-hidden bg-gradient-to-br from-zinc-900 via-zinc-900 to-zinc-800 border-zinc-800 hover:border-zinc-700 transition-all duration-300">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-pink-500/10 via-purple-500/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <HoverCard>
              <HoverCardTrigger asChild>
                <div className="flex items-center gap-4 cursor-pointer">
                  <div className="relative">
                    <div className="flex -space-x-3">
                      <div className="z-10 bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full p-1 ring-1 ring-zinc-700">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tokenA.image} alt={tokenA.symbol} />
                          <AvatarFallback className="bg-zinc-900 text-zinc-400">
                            {tokenA.symbol.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div className="bg-gradient-to-br from-zinc-800 to-zinc-900 rounded-full p-1 ring-1 ring-zinc-700">
                        <Avatar className="h-12 w-12">
                          <AvatarImage src={tokenB.image} alt={tokenB.symbol} />
                          <AvatarFallback className="bg-zinc-900 text-zinc-400">
                            {tokenB.symbol.slice(0, 2)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                    </div>
                    <div className="absolute -bottom-1 -right-1 bg-gradient-to-r from-pink-500 to-purple-500 rounded-full p-1.5">
                      <SwapIcon className="h-4 w-4 text-white" />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <h3 className="text-xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                      {tokenA.symbol}-{tokenB.symbol}
                    </h3>
                    <div className="flex items-center gap-2">
                      <p className="text-sm text-zinc-400">Pool Balance:</p>
                      <p className="text-sm font-medium text-zinc-200">
                        {tokenA.balance.toLocaleString()} {tokenA.symbol}
                      </p>
                      <span className="text-zinc-600">•</span>
                      <p className="text-sm font-medium text-zinc-200">
                        {tokenB.balance.toLocaleString()} {tokenB.symbol}
                      </p>
                    </div>
                  </div>
                </div>
              </HoverCardTrigger>
              <HoverCardContent className="w-80 bg-zinc-900 border-zinc-800">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-zinc-400">Pool ID</span>
                      <div className="flex items-center gap-2">
                        <code className="text-xs bg-zinc-800 px-2 py-1 rounded">
                          {poolId.slice(0, 4)}...{poolId.slice(-4)}
                        </code>
                        <CopyButton value={poolId}/>
                      </div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={tokenA.image} alt={tokenA.symbol} />
                          </Avatar>
                          <span className="text-sm text-zinc-400">
                            {tokenA.symbol} Mint
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-zinc-800 px-2 py-1 rounded">
                            {tokenA.mint.slice(0, 4)}...{tokenA.mint.slice(-4)}
                          </code>
                          <CopyButton value={tokenA.mint}/>
                        </div>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Avatar className="h-6 w-6">
                            <AvatarImage src={tokenB.image} alt={tokenB.symbol} />
                          </Avatar>
                          <span className="text-sm text-zinc-400">
                            {tokenB.symbol} Mint
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <code className="text-xs bg-zinc-800 px-2 py-1 rounded">
                            {tokenB.mint.slice(0, 4)}...{tokenB.mint.slice(-4)}
                          </code>
                          <CopyButton value={tokenB.mint}/>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
            <div className="flex items-center gap-4">
              <div className="flex flex-col items-end">
                <p className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
                  {liquidity.toLocaleString(undefined, {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </p>
                <p className="text-sm text-zinc-400">Total Liquidity</p>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/swap/${poolId}`}>
                  <Button
                    size="sm"
                    className="w-[100px] bg-gradient-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600"
                  >
                    <SwapIcon className="mr-2 h-4 w-4" />
                    Swap
                  </Button>
                </Link>
                <Link href={`/deposit/${poolId}`}>
                  <Button
                    size="sm"
                    variant="outline"
                    className="w-[100px] border-pink-500/20 hover:bg-pink-500/10"
                  >
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Deposit
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </motion.div>
  )
}

