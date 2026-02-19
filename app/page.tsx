import Link from "next/link";
import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";

export default function Home() {
  return (
    <main className="min-h-screen bg-black text-white">
      {/* Top bar */}
      <header className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-6">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-white/10 ring-1 ring-white/15" />
          <div className="leading-tight">
            <div className="text-sm tracking-wide text-white/70">TruthRadeo</div>
            <div className="text-base font-semibold">Letting Music Soar</div>
          </div>
        </div>

        <nav className="hidden items-center gap-6 text-sm text-white/70 md:flex">
          <a href="#features" className="hover:text-white">
            Features
          </a>
          <a href="#how" className="hover:text-white">
            How it works
          </a>
          <a href="#creators" className="hover:text-white">
            Creators
          </a>
        </nav>

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
      </header>

      {/* Hero */}
      <section className="mx-auto w-full max-w-6xl px-6 pt-10">
        <div className="rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 md:p-12">
          <div className="max-w-2xl">
            <p className="text-sm text-white/70">
              Location-powered music discovery • creator hubs • live stages
            </p>

            <h1 className="mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
              Discover what’s{" "}
              <span className="text-white/80">actually playing</span> around you.
            </h1>

            <p className="mt-4 text-base leading-relaxed text-white/70">
              TruthRadeo turns cities into stages. Find creators, venues, and
              scenes by location — and follow the sound as it moves.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                    Start exploring
                  </button>
                </SignUpButton>
                <SignInButton mode="modal">
                  <button className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10">
                    I already have an account
                  </button>
                </SignInButton>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Go to Dashboard
                </Link>
                <Link
                  href="#features"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
                >
                  See how it works
                </Link>
              </SignedIn>
            </div>

            <div className="mt-8 flex flex-wrap gap-3 text-xs text-white/60">
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                No algorithm gimmicks — just signal
              </div>
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Built for artists & scenes
              </div>
              <div className="rounded-full border border-white/10 bg-black/30 px-3 py-1">
                Map-first discovery
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="mx-auto w-full max-w-6xl px-6 py-16">
        <h2 className="text-xl font-semibold">What you can do</h2>
        <p className="mt-2 max-w-2xl text-sm text-white/70">
          Start simple: explore what’s nearby, follow creators, and save places
          to revisit. Expand later into stages, events, and premium tools.
        </p>

        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <FeatureCard
            title="Discovery by location"
            desc="See what’s trending by city blocks, neighborhoods, and venues — not just global charts."
            badge="TruthMap"
          />
          <FeatureCard
            title="Creator hubs"
            desc="Profiles built for creators: links, highlights, releases, and where they’re active."
            badge="TruthPage"
          />
          <FeatureCard
            title="Live stages"
            desc="Drops, sessions, and events you can actually attend — with a clear map trail."
            badge="TruthStage"
          />
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h2 className="text-xl font-semibold">How it works</h2>
          <div className="mt-6 grid gap-6 md:grid-cols-3">
            <Step
              num="01"
              title="Pick a city"
              desc="Start where you are — or anywhere you’re curious about."
            />
            <Step
              num="02"
              title="Follow the signal"
              desc="Explore creators, venues, and scenes — save your favorites."
            />
            <Step
              num="03"
              title="Show up"
              desc="Use the map trail to find real experiences, not just scrolling."
            />
          </div>
        </div>
      </section>

      {/* Creators */}
      <section id="creators" className="mx-auto w-full max-w-6xl px-6 pb-16">
        <div className="grid gap-6 rounded-3xl border border-white/10 bg-gradient-to-b from-white/10 to-white/5 p-8 md:grid-cols-2 md:items-center">
          <div>
            <h2 className="text-xl font-semibold">Built for creators</h2>
            <p className="mt-2 text-sm text-white/70">
              Your page isn’t just a link hub — it’s your location-aware presence.
              Show where your sound lives, where you perform, and who you
              collaborate with.
            </p>

            <div className="mt-5 flex flex-wrap gap-3">
              <SignedOut>
                <SignUpButton mode="modal">
                  <button className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90">
                    Claim your creator page
                  </button>
                </SignUpButton>
                <Link
                  href="#features"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
                >
                  See features
                </Link>
              </SignedOut>

              <SignedIn>
                <Link
                  href="/dashboard"
                  className="rounded-xl bg-white px-5 py-3 text-sm font-semibold text-black hover:bg-white/90"
                >
                  Open creator tools
                </Link>
                <Link
                  href="#features"
                  className="rounded-xl border border-white/15 bg-white/5 px-5 py-3 text-sm hover:bg-white/10"
                >
                  See features
                </Link>
              </SignedIn>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/30 p-5">
            <div className="text-xs text-white/60">Preview (placeholder)</div>
            <div className="mt-3 space-y-3">
              <div className="h-10 w-40 rounded-lg bg-white/10" />
              <div className="h-4 w-full rounded bg-white/10" />
              <div className="h-4 w-5/6 rounded bg-white/10" />
              <div className="mt-5 grid grid-cols-3 gap-3">
                <div className="h-16 rounded-xl bg-white/10" />
                <div className="h-16 rounded-xl bg-white/10" />
                <div className="h-16 rounded-xl bg-white/10" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10 py-10">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 text-sm text-white/60 md:flex-row md:items-center md:justify-between">
          <div>© {new Date().getFullYear()} TruthRadeo</div>
          <div className="flex gap-4">
            <a className="hover:text-white" href="#features">
              Features
            </a>
            <a className="hover:text-white" href="#how">
              How it works
            </a>
            <a className="hover:text-white" href="#creators">
              Creators
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}

function FeatureCard({
  title,
  desc,
  badge,
}: {
  title: string;
  desc: string;
  badge: string;
}) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-6 hover:bg-white/10">
      <div className="inline-flex items-center rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs text-white/70">
        {badge}
      </div>
      <h3 className="mt-4 text-base font-semibold">{title}</h3>
      <p className="mt-2 text-sm text-white/70">{desc}</p>
    </div>
  );
}

function Step({ num, title, desc }: { num: string; title: string; desc: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="text-xs font-semibold text-white/60">{num}</div>
      <div className="mt-2 text-base font-semibold">{title}</div>
      <div className="mt-1 text-sm text-white/70">{desc}</div>
    </div>
  );
}
