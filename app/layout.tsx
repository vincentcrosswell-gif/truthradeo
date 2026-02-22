import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import { Bangers, Space_Grotesk, JetBrains_Mono, Rubik_Glitch } from "next/font/google";
import "./globals.css";

const sans = Space_Grotesk({
  subsets: ["latin"],
  variable: "--tr-font-sans",
  display: "swap",
});

const graffiti = Bangers({
  subsets: ["latin"],
  weight: "400",
  variable: "--tr-font-graffiti",
  display: "swap",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--tr-font-mono",
  display: "swap",
});

const glitch = Rubik_Glitch({
  subsets: ["latin"],
  weight: "400",
  variable: "--tr-font-glitch",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TruthRadeo",
  description: "TruthRadeo",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body
          className={`${sans.variable} ${graffiti.variable} ${mono.variable} ${glitch.variable}`}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}