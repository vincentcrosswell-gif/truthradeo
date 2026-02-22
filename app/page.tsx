import type { Metadata } from "next";
import LandingPage from "./LandingPage";

export const metadata: Metadata = {
  title: "TruthRadeo • Chicago Stage",
  description:
    "TruthRadeo Stage 1 (Chicago): turn your current creator reality into an offer + scripts + rollout plan + iteration loop.",
};

export default function Home() {
  return <LandingPage />;
}