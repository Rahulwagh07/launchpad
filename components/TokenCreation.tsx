"use client";

import { Keypair, SystemProgram, Transaction} from "@solana/web3.js";
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import {
  TOKEN_2022_PROGRAM_ID, 
  ASSOCIATED_TOKEN_PROGRAM_ID,
  getMintLen, 
  createInitializeMetadataPointerInstruction, 
  createInitializeMintInstruction, 
  TYPE_SIZE, 
  LENGTH_SIZE,
  getAssociatedTokenAddress, 
  createAssociatedTokenAccountInstruction, 
  ExtensionType,
  createMintToInstruction
} from "@solana/spl-token";
import { createInitializeInstruction, pack } from '@solana/spl-token-metadata';
import { useForm, SubmitHandler } from 'react-hook-form';
import toast from 'react-hot-toast';
import { useState } from "react";
import axios from "axios";
import { Input } from "./ui/input";
import { LuUpload } from "react-icons/lu";
import Loader from "./common/Loader";
import { BiWallet } from "react-icons/bi";
import { FaRegImage } from "react-icons/fa6";
import { customToast } from "./common/CustomToast";
import { TbCurrencySolana } from "react-icons/tb";
import { BiSolidError } from "react-icons/bi";
import { GoCheckCircleFill } from "react-icons/go";
import { MdArrowOutward } from "react-icons/md";
import Image from "next/image";

type FormValues = {
  name: string;
  symbol: string;
  decimals: number;
  supply: number;
  description: string;
  image: FileList;
}

export function TokenLaunchpad() {
  const { register, handleSubmit, formState: { errors }, reset } = useForm<FormValues>();
  const { connection } = useConnection();
  const wallet = useWallet();
  const [showToken, setShowToken] = useState<boolean>(false);
  const [tokenAddress, setTokenAddress] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [imagePreview, setImagePreview] = useState<string>("");
  const [txState, setTxState] = useState<string>("Create Token");
  const [imageFile, setImageFile] = useState<File | null>(null);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const getMetadataUrl = async (formData: FormData): Promise<string> => {
    try {
      const response = await axios.post('/api/upload', formData);
      return response.data.metadataUrl;
    } catch (error) {
      console.error('Error creating metadata:', error);
      throw new Error('Failed to create metadata.');
    }
  };

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    if (!wallet.publicKey || !wallet.signTransaction) {
      toast(customToast("Please connect your wallet.", <BiWallet size={24} className="text-sky-500"/>));
      return;
    }

    if (!imageFile) {
      toast(customToast("Please select image.", <FaRegImage size={24} className="text-pink-500"/>));
      return;
    }
    setIsLoading(true);
    setTxState("Confirming Transactions...")

    try {
      const formData = new FormData();
      formData.append('file', imageFile);
      formData.append('name', data.name);
      formData.append('symbol', data.symbol);
      formData.append('description', data.description);
      
      const metadataUrl = await getMetadataUrl(formData);
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
        toast(customToast("Not enough Balance in your wallet!", <TbCurrencySolana size={24} className="text-red-500"/>));
        return;
      }

      const transaction1 = new Transaction().add(
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

      transaction1.feePayer = wallet.publicKey;
      const { blockhash } = await connection.getLatestBlockhash();
      transaction1.recentBlockhash = blockhash;
      transaction1.partialSign(mintKeypair);

      //transaction 1
      await wallet.sendTransaction(transaction1, connection);

      setTxState("Creating Associated Token account..")
      const initialSupply = data.supply;

      const associatedTokenAccount = await getAssociatedTokenAddress(
        mintKeypair.publicKey,
        wallet.publicKey,
        false,
        TOKEN_2022_PROGRAM_ID,
        ASSOCIATED_TOKEN_PROGRAM_ID
      );
  
      const accountInfo = await connection.getAccountInfo(associatedTokenAccount);
      if (accountInfo === null) {
        const tokenAccountCreationInstruction = createAssociatedTokenAccountInstruction(
          wallet.publicKey,
          associatedTokenAccount,
          wallet.publicKey,
          mintKeypair.publicKey,
          TOKEN_2022_PROGRAM_ID,
          ASSOCIATED_TOKEN_PROGRAM_ID
        );
        
        const tokenAccountCreationTransaction = new Transaction().add(tokenAccountCreationInstruction);
        const { blockhash } = await connection.getLatestBlockhash();
        tokenAccountCreationTransaction.recentBlockhash = blockhash;
        tokenAccountCreationTransaction.feePayer = wallet.publicKey;
  
        //transaction 2
        await wallet.sendTransaction(tokenAccountCreationTransaction, connection);
      } else {
        console.log("Associated token account already exists");
      }
  
      const mintToInstruction = createMintToInstruction(
        mintKeypair.publicKey,
        associatedTokenAccount,
        wallet.publicKey,
        BigInt(initialSupply) * BigInt(10 ** data.decimals),
        [],
        TOKEN_2022_PROGRAM_ID
      );
  
      const mintSupplyTransaction = new Transaction().add(mintToInstruction);
      const { blockhash: newBlockhash } = await connection.getLatestBlockhash();
      mintSupplyTransaction.recentBlockhash = newBlockhash;
      mintSupplyTransaction.feePayer = wallet.publicKey;

      setTxState("Creating Initial supply..")
      //transaction 3
      await wallet.sendTransaction(mintSupplyTransaction, connection);
  
      toast(customToast("Token Created", <GoCheckCircleFill size={24} className="text-green-500"/>));
      setShowToken(true);
      setTokenAddress(mintKeypair.publicKey.toBase58());
      reset();
      setImagePreview("");
      
    } catch (e) {
      console.error('Error creating token:', e);
      toast(customToast("Failed to create token.", <BiSolidError size={24} className="text-red-500"/>));
    } finally {
      setIsLoading(false);
      setTxState("Create Token")
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="p-3 sm:p-12 w-[60rem] mx-auto bg-zinc-900 rounded-xl shadow-md text-white"
    >
      <div className="space-y-8">
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Name</label>
            <Input
              {...register("name", { required: "Name is required" })}
              className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
              placeholder="Enter the name of your token"
            />
            {errors.name && (
              <span className="text-red-500 text-xs">{errors.name.message}</span>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium">Symbol</label>
            <Input
              {...register("symbol", { required: "Symbol is required" })}
              className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
              placeholder="Put the symbol of your token"
            />
            {errors.symbol && (
              <span className="text-red-500 text-xs">{errors.symbol.message}</span>
            )}
          </div>
        </div>
    
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Decimals</label>
            <Input
              type="number"
              {...register("decimals", { required: "Decimals are required",  
                min: {
                value: 0,
                message: "Decimals cannot be less than 0",
                },
                max: {
                  value: 18,
                  message: "Decimals cannot exceed 18",
                }, })}
                className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
               placeholder="Put the decimals quantity"
            />
            {errors.decimals && (
              <span className="text-red-500 text-xs">{errors.decimals.message}</span>
            )}
          </div>
    
          <div>
            <label className="block text-sm font-medium">Supply</label>
            <Input
              type="number"
              {...register("supply", { required: "Supply is required", min: 1 })}
              className="mt-1 block w-full h-12 rounded-md bg-blue-950 border-gray-600 text-white"
              placeholder="Pun the Supply of your Token"
            />
            {errors.supply && (
              <span className="text-red-500 text-xs">{errors.supply.message}</span>
            )}
          </div>
        </div>
    
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Image</label>
            <input
              id="image"
              type="file"
              hidden 
              accept=".jpeg,.jpg,.png"
              {...register("image", { required: "Image is required" })}
              onChange={handleImageChange}
              className="hidden"
            />
    
            <div className="flex justify-center h-28 bg-blue-950 mt-1 rounded-md border border-gray-600">
              {imagePreview ? (
                <Image
                  src={imagePreview}
                  width={160}
                  height={160}
                  alt="Preview"
                  className="object-cover p-1 cursor-pointer rounded-md"
                  onClick={() => document.getElementById("image")?.click()}
                />
              ) : (
                <div
                  className="flex flex-col items-center justify-center cursor-pointer w-32 h-28"
                  onClick={() => document.getElementById("image")?.click()}
                >
                  <LuUpload className="text-2xl" />
                  <span className="mt-2">Select Image</span>
                </div>
              )}
            </div>
            {errors.image && (
              <span className="text-red-500 text-xs">{errors.image.message}</span>
            )}
          </div>
    
          <div>
            <label className="block text-sm font-medium">Description</label>
            <textarea
              {...register("description", { required: "Description is required" })}
              className="mt-1 pl-3 text-sm pt-2 block w-full h-28 rounded-md bg-blue-950 border border-gray-600"
              placeholder="Provide a brief description for your SPL Token"
            />
            {errors.description && (
              <span className="text-red-500 text-xs">
                {errors.description.message}
              </span>
            )}
          </div>
        </div>
    
        <div className="flex justify-end items-center">
        {showToken && (
          <a
            className="bg-blue-500 flex items-center justify-center py-3 px-4 rounded-md mr-4"
            href={`https://explorer.solana.com/address/${tokenAddress}/?cluster=devnet`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="underline text-white-400 mr-2"> See Token</span> <MdArrowOutward color="#000"/>
          </a>
        )}
          <button
            type="submit"
            className={`py-3 flex items-center justify-center px-4 rounded-md text-white bg-blue-800 hover:bg-blue-700
              focus:outline-none focus:ring-2 focus:ring-offset-2 ${
              isLoading ? "cursor-wait opacity-50" : ""
            }`}
            disabled={isLoading}
          >
          {isLoading &&  <span className="mr-2"> <Loader/></span>}  {txState}
          </button>
        </div>
    
      </div>
    </form>
  );
}
