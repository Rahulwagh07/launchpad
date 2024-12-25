import React from "react";
import type { Metadata } from "next";
import WithdrawPage from "@/components/withdraw-page";

type Props = {
  params: Promise<{ poolId: string }>;
};

export async function generateMetadata(): Promise<Metadata> {
  return {
    title: `Withdraw Liquidity`,
  };
}

const Page = async ({ params }: Props) => {
  return <WithdrawPage params={params} />;
};

export default Page;
