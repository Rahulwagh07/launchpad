import PortfolioPage from "@/components/portfolio";
import { Metadata } from "next";
import React from "react";

export const metadata: Metadata = {
  title: "My Portfolio",
};

function page() {
  return <PortfolioPage/>;
}

export default page;
