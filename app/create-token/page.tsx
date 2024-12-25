import { TokenLaunchpad } from "@/components/token-creation";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "Create Token",
};

function page() {
  return (
    <div className="flex items-center justify-center">
      <TokenLaunchpad />
    </div>
  );
}

export default page;
