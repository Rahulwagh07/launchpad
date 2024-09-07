"use client"
import React from 'react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
 
 

function Appbar() {
  return (
    <div className='flex justify-between  p-2 w-10/12 mx-auto'>
      <div className='border bg-blue-600 rounded-md p-2'>
        LaunchPad
      </div>
      <WalletMultiButton/>
    </div>
  )
}

export default Appbar