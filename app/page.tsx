import { UserButton } from "@clerk/nextjs";

export default function Home() {
  return (
    <main style={{ padding: 24 }}>
      <h1>TruthRadeo</h1>
      <p>Clerk is installed.</p>
      <UserButton />
    </main>
  );
}
