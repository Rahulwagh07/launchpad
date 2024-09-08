"use client"
import React from 'react'
import Link from 'next/link'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Card } from './ui/card'
import { MdToken } from "react-icons/md";

function Appbar() {
  return (
    <div className='flex items-center justify-between sm:justify-center'>
     <Card  className="flex bg-zinc-900 z-50 items-center justify-between align-baseline px-2 sm:px-12 gap-2 shadow-lg 
        mb-4 py-1.5 mt-4 rounded-2xl w-full sm:w-8/12 h-16 text-white border border-slate-800">
      <Link href="/" className='font-semibold flex gap-1 items-center justify-center'>
       <MdToken  size={32} className='text-sky-500'/>     
       <span className='text-lg'> TokenNx</span>
      </Link>
      <WalletMultiButton/>
   </Card>
   </div>
  )
}

export default Appbar