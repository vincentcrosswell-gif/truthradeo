import Link from "next/link";
import { SignedIn, SignedOut, SignInButton, SignUpButton, UserButton } from "@clerk/nextjs";

const FAQS: { q: string; a: string }[] = [
  {
    q: "What is Stage 1 (Chicago)?",
    a: "Chicago Stage is a Revenue Architecture Engine. It turns your creator situation into a monetization blueprint and generates launch-ready execution assets (copy, scripts, timeline, and a forecast).",
  },
  {
    q: "Is TruthRadeo a streaming platform?",
    a: "No. Chicago Stage does not host music or replace Spotify/YouTube. It’s the business engine that helps creators monetize what they already do.",
  },
  {
    q: "What do I do first after I sign up?",
    a: "You start with the Creator Snapshot. That’s the input layer Chicago uses to run diagnostics and build your offer + execution assets.",
  },
  {
    q: "Do I need Spotify/YouTube APIs connected?",
    a: "No. You can paste links to your pages, but Chicago doesn’t require API integrations to function.",
  },
  {
    q: "What happens after the Snapshot?",
    a: "Next comes Revenue Diagnostic (leaks + priorities), then Offer Architect (what to sell + pricing ladder), then Execution Assets (scripts, offer page copy, launch timeline).",
  },
  {
    q: "What does “lifetime” mean?",
    a: "Lifetime applies to Stage 1 (Chicago) access. Future stages are separate and will unlock later.",
  },
  {
    q: "Can I upgrade tiers later?",
    a: "Yes. Start with South Loop if you’re early, then move up when you want deeper diagnostics, scripts, planning, and forecasting.",
  },
  {
    q: "Is this for beginners or established artists?",
    a: "Both. Beginners get structure quickly. Established creators get a tighter offer ladder, better execution assets, and cleaner planning for launches and bookings.",
  },
];

export default function FAQPage() {
  return (
    <main className="min-h-screen bg-neutral-950 text-white">
      <Header />

      <section className="mx-auto w-full max-w-6xl px-6 pt-10 pb-16">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/12 to-white/5 p-8">
          <h1 className="text-3xl font-extrabold tracking-tight md:text-4xl">
            FAQ • Chicago Stage
          </h1>
          <p className="mt-3 max-w-2xl text-sm text-white/70 md:text-base">
            Clear answers so creators know exactly what Chicago is (and what it isn’t).
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pricing" className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
              View Pricing
            </Link>
            <Link href="/" className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
              Back to Home
            </Link>
          </div>
        </div>

        <div className="mt-8 grid gap-4">
          {FAQS.map((item) => (
            <Accordion key={item.q} q={item.q} a={item.a} />
          ))}
        </div>

        <div className="mt-10 rounded-3xl border border-white/10 bg-black/35 p-7">
          <h2 className="text-lg font-semibold">Still got questions?</h2>
          <p className="mt-2 text-sm text-white/70">
            If you want, we can add a “Contact / Request access” section next (email form),
            but for now Chicago Stage is built to be self-serve and fast.
          </p>
        </div>
      </section>

      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto w-full max-w-6xl px-6 text-sm text-white/60">
          © {new Date().getFullYear()} TruthRadeo
        </div>
      </footer>
    </main>
  );
}

function Header() {
  return (
    <header className="border-b border-white/10 bg-black/40 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-5">
        <Link href="/" className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-xs tracking-wide text-white/60">TruthRadeo</div>
            <div className="text-base font-semibold">FAQ • Chicago</div>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <SignedOut>
            <SignInButton mode="modal">
              <button className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10">
                Sign in
              </button>
            </SignInButton>
            <SignUpButton mode="modal">
              <button className="rounded-xl bg-white px-4 py-2 text-sm font-semibold text-black hover:bg-white/90">
                Create account
              </button>
            </SignUpButton>
          </SignedOut>

          <SignedIn>
            <Link
              href="/dashboard"
              className="rounded-xl border border-white/15 bg-white/5 px-4 py-2 text-sm hover:bg-white/10"
            >
              Dashboard
            </Link>
            <UserButton afterSignOutUrl="/" />
          </SignedIn>
        </div>
      </div>
    </header>
  );
}

function Accordion({ q, a }: { q: string; a: string }) {
  return (
    <details className="group rounded-3xl border border-white/10 bg-white/5 p-6 open:bg-white/10">
      <summary className="cursor-pointer list-none">
        <div className="flex items-start justify-between gap-4">
          <div className="text-base font-semibold">{q}</div>
          <div className="mt-1 text-white/50 group-open:rotate-45 transition-transform">
            +
          </div>
        </div>
      </summary>
      <div className="mt-3 text-sm leading-relaxed text-white/70">{a}</div>
    </details>
  );
}
