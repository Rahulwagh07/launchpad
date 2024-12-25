import React from "react";
import type { Metadata } from "next";
import DepositPage from "@/components/deposit-liquidity";

type Props = {
  params: Promise<{ poolId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Add Liquidity`,
  };
}

const Page = async ({ params }: Props) => {
  return <DepositPage params={params} />;
};

export default Page;
