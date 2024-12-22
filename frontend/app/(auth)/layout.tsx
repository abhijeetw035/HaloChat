import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import ToasterContext from "@components/ToasterContext";
import Provider from "@components/Provider";
import { Session } from "next-auth";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function RootLayout({
  children,
  session
}: Readonly<{
  children: React.ReactNode;
  session: Session | null | undefined;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-purple-1`}
      >
        <Provider session={session}>
          <ToasterContext />
          {children}
        </Provider>
      </body>
    </html>
  );
}
