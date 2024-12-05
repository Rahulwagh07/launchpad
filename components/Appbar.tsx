"use client"
import React from 'react'
import Link from 'next/link'

import { Card } from './ui/card'
import { MdToken } from "react-icons/md";
import { WalletMultiButton } from './common/WalletMultiButton';

function Appbar() {
  return (
    <div className='flex items-center justify-between sm:justify-center'>
     <Card  className="flex bg-zinc-900 z-50 items-center justify-between align-baseline px-2 sm:px-12 gap-2 shadow-lg 
        mb-4 py-1.5 mt-4 rounded-2xl w-full sm:w-8/12 h-16 text-white border border-slate-800">
      <Link href="/" className='font-semibold flex gap-1 items-center justify-center'>
       <MdToken  size={32} className='text-sky-500'/>     
       <span className='text-lg'> TokenNx</span>
      </Link>
      <div className='flex items-center justify-center gap-8'>
      <Link href={"/swap"}>
        Swap
      </Link>
      <Link href={"/liquidity-pools"}>
        Liquidity
      </Link>
      <Link href={"/create-token"}>
        Create Token
      </Link>
      <WalletMultiButton/>
      </div>
   </Card>
   </div>
  )
}

export default Appbar