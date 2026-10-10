import { ClerkProvider } from "@clerk/nextjs";
import "./globals.css";
import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import Provider from "./provider";

const outfit = Outfit({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Kinetix - AI Agent Platform",
  description: "Autonomous AI agent platform built with Next.js",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {


  const content = (
    <html lang="en">
      <body
        suppressHydrationWarning
        style={{ margin: 0, padding: 0 }}
        className={outfit.className}
      >
        <Provider>{children}</Provider>
      </body>
    </html>
  );

  return <ClerkProvider>{content}</ClerkProvider>;
}
