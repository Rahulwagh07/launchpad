import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css"
import "@/styles/wallet-button.css"
import "@/styles/custom-toast.css"
import AppWalletProvider from "../lib/provider";
import Appbar from "@/components/appbar";
import { Toaster } from "react-hot-toast";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Launchpad",
  description: "Decentralized cryptocurrency exchange",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-zinc-800 via-zinc-900 to-black`}
      >
        <AppWalletProvider>

        <Toaster
          position="top-right"
          />
          <Appbar/>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
 
