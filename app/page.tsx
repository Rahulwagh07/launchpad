import { USDT_MINT } from "@/lib/constant";
import { redirect } from "next/navigation";

export default function Home() {
  redirect(`/swap/?inputMint=sol&outputMint=${USDT_MINT}`);
}
