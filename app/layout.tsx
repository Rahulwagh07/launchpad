import type { Metadata } from "next";
import localFont from "next/font/local";
import "@/styles/globals.css"
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
  title: "dex",
  description: "Decentralized exchange",
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
          
          toastOptions={{
            style: {
              borderRadius: '2px',
              background: '#1f2937',
              color: '#9ca3af',
              padding: '12px',
            },
          }}
          />
          <Appbar/>
          {children}
        </AppWalletProvider>
      </body>
    </html>
  );
}
 
