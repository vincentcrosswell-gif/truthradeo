import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import Link from "next/link";

export default function Home() {
  return (
    <main style={{ padding: 24, display: "grid", gap: 12 }}>
      <h1 style={{ fontSize: 32, fontWeight: 700 }}>TruthRadeo</h1>
      <p>Auth is live. Next step: protected dashboard + real pages.</p>

      <SignedOut>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <SignInButton mode="modal">
            <button style={{ padding: "10px 14px" }}>Sign in</button>
          </SignInButton>

          <Link href="/sign-up">Create account</Link>
        </div>
      </SignedOut>

      <SignedIn>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          <UserButton afterSignOutUrl="/" />
          <Link href="/dashboard">Go to dashboard</Link>
        </div>
      </SignedIn>
    </main>
  );
}
