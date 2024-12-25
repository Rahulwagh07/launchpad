import LiquidityPoolsPage from "@/components/liquidity-pools";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Liquidity Pools",
};

function page() {
  return <LiquidityPoolsPage/>;
}

export default page;
