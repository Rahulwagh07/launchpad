import React from "react";
import { Metadata } from "next";
import LiquidityPoolCreator from "@/components/liquidity-pool-creator";

export const metadata: Metadata = {
  title: "Create Liquidity Pool",
};

function page() {
  return <LiquidityPoolCreator />;
}

export default page;
