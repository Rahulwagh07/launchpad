"use client";

import React, { useState } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "./ui/card";
import { ConnectWalletButton } from "./common/wallet-button";
import { usePathname } from "next/navigation";
import { USDT_MINT } from "@/lib/constant";
import { Menu, X } from "lucide-react";

function Appbar() {
  const pathname = usePathname();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    {
      href: `/swap/?inputMint=sol&outputMint=${USDT_MINT}`,
      label: "Swap",
    },
    { href: "/portfolio", label: "Portfolio" },
    { href: "/liquidity-pools", label: "Liquidity" },
    { href: "/create-token", label: "Create Token" },
  ];

  const isActiveLink = (href: string) =>
    (pathname.startsWith("/swap") && href.includes("/swap")) ||
    pathname === href;

  return (
    <div className="flex items-center justify-between sm:justify-center">
      <div className="w-full md:w-full lg:w-8/12">
        <Card className="relative flex bg-zinc-900/50 backdrop-blur-xl z-50 items-center justify-between px-2 sm:px-12 shadow-lg mb-4 py-1.5 mt-4 rounded-2xl h-16 text-white border border-slate-800">
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>

          <div className="hidden lg:flex items-center justify-center gap-12">
            {navItems.map((item) => (
              <div key={item.href}>
                <Link
                  href={item.href}
                  className={`relative ${
                    isActiveLink(item.href)
                      ? "text-sky-500"
                      : "hover:text-sky-400"
                  }`}
                >
                  {item.label}
                  {isActiveLink(item.href) && (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-500"
                      layoutId="navbar-indicator"
                    />
                  )}
                </Link>
              </div>
            ))}
          </div>

          <AnimatePresence>
            {isMenuOpen && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2 }}
                className="absolute top-full  left-0 right-0 bg-zinc-900/95 backdrop-blur-xl mt-1 rounded-xl border border-slate-800 overflow-hidden lg:hidden"
              >
                <div className="flex flex-col py-2 items-center justify-center">
                  {navItems.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      className={`px-4 py-2 ${
                        isActiveLink(item.href)
                          ? "text-sky-500 bg-sky-500/10 rounded-lg"
                          : "hover:bg-sky-500/10"
                      }`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <ConnectWalletButton />
        </Card>
      </div>
    </div>
  );
}

export default Appbar;
