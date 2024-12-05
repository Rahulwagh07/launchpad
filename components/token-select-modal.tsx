"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { TokenTypes } from "@/types/token";
import { Copy, ExternalLink, Search } from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import toast from "react-hot-toast";

interface TokenSelectModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokens: TokenTypes[];
  onSelect: (token: TokenTypes) => void;
  selectedToken2: TokenTypes | null;
}

export function TokenSelectModal({
  isOpen,
  onClose,
  tokens,
  onSelect,
  selectedToken2,
}: TokenSelectModalProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const popularTokens = tokens.filter((token) =>
    ["SOL", "USDC", "USDT"].includes(token.symbol)
  );

  const filteredTokens = tokens.filter(
    (token) =>
      (selectedToken2 ? token.mint !== selectedToken2.mint : true) &&
      (token.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.symbol.toLowerCase().includes(searchQuery.toLowerCase()) ||
        token.mint.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success("Token adress copied to clipboard");
    } catch (err) {
      toast.error("Failed to copy address");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[500px] bg-[#1a1b23] text-white border-zinc-800">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold text-white">
            Select a token
          </DialogTitle>
        </DialogHeader>
        <div className="relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-zinc-400" />
          <Input
            placeholder="Search by token or paste address"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 bg-[#131318] border-zinc-800 text-white focus:border-none focus:outline-none"
          />
        </div>
        {popularTokens.length > 0 && (
          <div className="space-y-2">
            <h3 className="text-sm font-medium text-zinc-400">
              Popular tokens
            </h3>
            <div className="flex gap-2 flex-wrap">
              {popularTokens.map((token) => (
                <Button
                  key={token.mint}
                  variant="outline"
                  className="bg-[#131318] border-zinc-800 hover:bg-zinc-800"
                  onClick={() => {
                    onSelect(token);
                    onClose();
                  }}
                >
                  {renderTokenImage(token)}
                  <span className="ml-2">{token.symbol}</span>
                </Button>
              ))}
            </div>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex justify-between text-sm text-zinc-400">
            <span>Token</span>
            <span>Balance/Address</span>
          </div>
          <div className="space-y-2  scrollable-container">
            {filteredTokens.map((token) => (
              <div
                key={token.mint}
                className="flex items-center justify-between p-2 rounded-lg hover:bg-[#131318] cursor-pointer"
                onClick={() => {
                  onSelect(token);
                  onClose();
                }}
              >
                <div className="flex items-center gap-2">
                  {renderTokenImage(token)}
                  <div>
                    <div className="font-medium">{token.symbol}</div>
                    <div className="text-sm text-zinc-400">{token.name}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-medium">{token.balance.toFixed(4)}</div>
                  <div className="flex items-center gap-1 text-sm text-zinc-400">
                    <span className="max-w-[100px]">
                      {token.mint.slice(0, 6)}...{token.mint.slice(-5)}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        copyToClipboard(token.mint);
                      }}
                      className="p-1 hover:text-white"
                    >
                      <Copy className="h-3 w-3" />
                    </button>
                    <a
                      href={`https://explorer.solana.com/address/${token.mint}?cluster=devnet`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="p-1 hover:text-white"
                    >
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function renderTokenImage(token: TokenTypes) {
  if (typeof token.image === "string") {
    return (
      <Image
        src={token.image}
        alt={token.name}
        width={24}
        height={24}
        className="rounded-full"
      />
    );
  }
  return token.image;
}
