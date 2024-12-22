import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import Provider from "@components/Provider";
import { Session } from "next-auth";
import { Inter } from "next/font/google";
import TopBar from "@components/TopBar";
import BottomBar from "@components/BottomBar";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Halo Chat App",
  description: "A chat app built with Next.js ",
};

const inter = Inter({ subsets: ["latin"] });

export default function RootLayout({
  children,
  session,
}: Readonly<{
  children: React.ReactNode;
  session: Session | null;
}>) {
  return (
    <html lang="en">
       <body className={`${inter.className} bg-blue-2`}>
        <Provider session={session}>
          <TopBar />
          {children}
          <BottomBar />
        </Provider>
      </body>
    </html>
  );
}
