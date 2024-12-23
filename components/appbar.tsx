"use client";

import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import { Card } from "./ui/card";
import { ConnectWalletButton } from "./common/wallet-button";
import { usePathname } from "next/navigation";
import { USDT_MINT } from "@/lib/constant";

function Appbar() {
  const pathname = usePathname();

  return (
    <div className="flex items-center justify-between sm:justify-center">
      <motion.div
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="w-full sm:w-8/12"
      >
        <Card className="flex bg-zinc-900/50 backdrop-blur-xl z-50 items-center justify-center align-baseline px-2 sm:px-12 gap-2 shadow-lg mb-4 py-1.5 mt-4 rounded-2xl h-16 text-white border border-slate-800">
          <div className="flex items-center justify-center gap-12">
            {[
              {
                href: `/swap/?inputMint=sol&outputMint=${USDT_MINT}`,
                label: "Swap",
              },
              { href: "/portfolio", label: "Portfolio" },
              { href: "/liquidity-pools", label: "Liquidity" },
              { href: "/create-token", label: "Create Token" },
            ].map((item) => (
              <motion.div
                key={item.href}
                whileHover={{ y: -2 }}
                whileTap={{ y: 0 }}
              >
                <Link
                  href={item.href}
                  className={`relative ${
                    pathname.startsWith("/swap") && item.href.includes("/swap")
                      ? "text-sky-500"
                      : pathname === item.href
                      ? "text-sky-500"
                      : "hover:text-sky-400"
                  }`}
                >
                  {item.label}
                  {(pathname.startsWith("/swap") &&
                    item.href.includes("/swap")) ||
                  pathname === item.href ? (
                    <motion.div
                      className="absolute -bottom-1 left-0 right-0 h-0.5 bg-sky-500"
                      layoutId="navbar-indicator"
                    />
                  ) : null}
                </Link>
              </motion.div>
            ))}
            <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
              <ConnectWalletButton />
            </motion.div>
          </div>
        </Card>
      </motion.div>
    </div>
  );
}

export default Appbar;
