import type { Metadata } from "next";
import { ClerkProvider } from "@clerk/nextjs";
import {
  Bangers,
  Space_Grotesk,
  JetBrains_Mono,
  Rubik_Glitch,
  Orbitron,
  Playfair_Display,
  Black_Ops_One,
  Permanent_Marker,
} from "next/font/google";
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

/** Genre-reskin fonts */
const edm = Orbitron({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--tr-font-orbitron",
  display: "swap",
});

const rnb = Playfair_Display({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--tr-font-playfair",
  display: "swap",
});

const rock = Black_Ops_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--tr-font-blackops",
  display: "swap",
});

const indie = Permanent_Marker({
  subsets: ["latin"],
  weight: "400",
  variable: "--tr-font-marker",
  display: "swap",
});

export const metadata: Metadata = {
  title: "TruthRadeo",
  description: "TruthRadeo Chicago Stage",
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
          className={[
            sans.variable,
            graffiti.variable,
            mono.variable,
            glitch.variable,
            edm.variable,
            rnb.variable,
            rock.variable,
            indie.variable,
          ].join(" ")}
        >
          {children}
        </body>
      </html>
    </ClerkProvider>
  );
}