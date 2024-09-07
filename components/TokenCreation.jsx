"use client";
import { Keypair, SystemProgram, Transaction } from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  TOKEN_2022_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMintLen, 
  createInitializeMetadataPointerInstruction, 
  createInitializeMintInstruction, 
  mintTo,
  TYPE_SIZE, 
  LENGTH_SIZE,
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  ExtensionType
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from "react";
import axios from "axios";


export function TokenLaunchpad() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [showTx, setShowTx] = useState(false);
  const [tx, setTx] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMetadataUrl = async (formData) => {
  try {
    const response = await axios.post('/api/upload', formData);
    return response.data.metadataUrl;
  } catch (error) {
    console.error('Error creating metadata:', error);
    throw new Error('Failed to create metadata.');
  }
  };

  const onSubmit = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast.error("Please connect your wallet.");
      return;
  }

  setIsLoading(true);

  try {
    const formData = new FormData();
    formData.append('file', data.image[0]);
    formData.append('name', data.name);
    formData.append('symbol', data.symbol);
    formData.append('description', data.description);

    const metadataUrl = await getMetadataUrl(formData);
    console.log("Metadata URL:", metadataUrl);

    const mintKeypair = Keypair.generate();

    const metadata = {
      mint: mintKeypair.publicKey,
      name: data.name,
      symbol: data.symbol,
      uri: metadataUrl,
      additionalMetadata: [],
    };

    const mintLen = getMintLen([ExtensionType.MetadataPointer]);
    const metadataLen = TYPE_SIZE + LENGTH_SIZE + pack(metadata).length;

    const lamports = await connection.getMinimumBalanceForRentExemption(mintLen + metadataLen);
    const walletBalance = await connection.getBalance(wallet.publicKey);

    if (walletBalance < lamports) {
      toast.error("Not enough SOL in the wallet to create a new token.");
      return;
    }

    const transaction = new Transaction().add(
      SystemProgram.createAccount({
        fromPubkey: wallet.publicKey,
        newAccountPubkey: mintKeypair.publicKey,
        space: mintLen,
        lamports,
        programId: TOKEN_2022_PROGRAM_ID,
      }),
      createInitializeMetadataPointerInstruction(mintKeypair.publicKey, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID),
      createInitializeMintInstruction(mintKeypair.publicKey, data.decimals, wallet.publicKey, null, TOKEN_2022_PROGRAM_ID),
      createInitializeInstruction({
        programId: TOKEN_2022_PROGRAM_ID,
        mint: mintKeypair.publicKey,
        metadata: mintKeypair.publicKey,
        name: metadata.name,
        symbol: metadata.symbol,
        uri: metadata.uri,
        mintAuthority: wallet.publicKey,
        updateAuthority: wallet.publicKey,
      })
    );

    transaction.feePayer = wallet.publicKey;
    transaction.recentBlockhash = (await connection.getLatestBlockhash()).blockhash;
    transaction.partialSign(mintKeypair);

    const signature = await wallet.sendTransaction(transaction, connection);
    console.log("Mint created:", mintKeypair.publicKey.toBase58());
    console.log("tx signature:", signature);

    const initialSupply = data.supply;

    const associatedTokenAccount = await getAssociatedTokenAddress(mintKeypair.publicKey, wallet.publicKey);
    console.log("Associated TA:", associatedTokenAccount);

    const tokenAccountCreationTransaction = new Transaction().add(
      createAssociatedTokenAccountInstruction(wallet.publicKey, associatedTokenAccount, wallet.publicKey, mintKeypair.publicKey, TOKEN_2022_PROGRAM_ID, ASSOCIATED_TOKEN_PROGRAM_ID)
    );

    await wallet.sendTransaction(tokenAccountCreationTransaction, connection);
    console.log("TA:", associatedTokenAccount.toBase58());

    const mintSupplyTransaction = new Transaction().add(
      mintTo(connection, wallet.publicKey, mintKeypair.publicKey, associatedTokenAccount, wallet.publicKey, initialSupply * Math.pow(10, data.decimals))
    );

    await wallet.sendTransaction(mintSupplyTransaction, connection);
    console.log("Initial Supply:", initialSupply);

    toast.success("Token created successfully with initial supply!");
    setShowTx(true);
    setTx(signature);
    reset();
    setImagePreview(null);
  } catch (e) {
    console.error('Error creating token:', e);
    toast.error(`Error creating token: ${e}`);
  } finally {
    setIsLoading(false);
  }
  };


  return  (
    <form onSubmit={handleSubmit(onSubmit)} className="p-12 max-w-2xl mx-auto bg-gradient-to-r from-blue-900 to-purple-900 rounded-xl shadow-md text-white">
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Name</label>
          <input
            {...register("name", { required: "Name is required" })}
            className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
          />
          {errors.name && <span className="text-red-500 text-xs">{errors.name.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium">Symbol</label>
          <input
            {...register("symbol", { required: "Symbol is required" })}
            className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
          />
          {errors.symbol && <span className="text-red-500 text-xs">{errors.symbol.message}</span>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium">Decimals</label>
          <input
            type="number"
            {...register("decimals", { required: "Decimals are required", min: 0, max: 9 })}
            className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
          />
          {errors.decimals && <span className="text-red-500 text-xs">{errors.decimals.message}</span>}
        </div>
        <div>
          <label className="block text-sm font-medium">Image</label>
          <input
            type="file"
            accept=".jpeg,.jpg,.png"
            {...register("image", { required: "Image is required" })}
            onChange={handleImageChange}
            className="mt-1 block w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-950 file:text-white hover:file:bg-blue-900"
          />
          {errors.image && <span className="text-red-500 text-xs">{errors.image.message}</span>}
          {/* {imagePreview && <img src={imagePreview} alt="Preview" className="mt-2 w-full h-32 object-cover rounded" />} */}
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium">Supply</label>
        <input
          type="number"
          {...register("supply", { required: "Supply is required", min: 1 })}
          className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
        />
        {errors.supply && <span className="text-red-500 text-xs">{errors.supply.message}</span>}
      </div>
      <div>
        <label className="block text-sm font-medium">Description</label>
        <textarea
          {...register("description", { required: "Description is required" })}
          className="mt-1 block w-full h-24 rounded-md bg-blue-950 border-gray-600 text-white"
        />
        {errors.description && <span className="text-red-500 text-xs">{errors.description.message}</span>}
      </div>
      <button
        type="submit"
        className={`w-full py-2 px-4 rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
          isLoading ? 'cursor-wait opacity-50' : ''
        }`}
        disabled={isLoading}
      >
        {isLoading ? 'Creating Token...' : 'Create Token'}
      </button>
      {
        showTx && <a className='text-white text-lg ' href={`https://explorer.solana.com/tx/${tx}/?cluster=devnet`}
        target="_blank">
          See Transaction
        </a>
      }
    </div>
  </form>
  )
}