import SwapPage from "@/components/swap-page";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Swap Tokens",
};

function page() {
  return <SwapPage/>;
}

export default page;
