"use client";

import Link from "next/link";
import { useState } from "react";
import {
  ArrowRight,
  Braces,
  Check,
  Flame,
  Menu,
  Target,
  Trophy,
  X,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { DEV_AUTH_BYPASS } from "@/lib/dev-mode";

const proofPoints = [
  {
    command: "track --daily",
    title: "Keep the streak visible",
    copy: "See today, this week, and your longest run without digging through spreadsheets.",
    icon: Flame,
    colour: "bg-[var(--coral)]",
  },
  {
    command: "review --weak-spots",
    title: "Know what to practise next",
    copy: "Filter your solve history by difficulty and pattern before your next interview session.",
    icon: Target,
    colour: "bg-[var(--cyan)]",
  },
  {
    command: "rank --friends",
    title: "Make progress social",
    copy: "A lightweight leaderboard turns consistent practice into a friendly campus challenge.",
    icon: Trophy,
    colour: "bg-[var(--sun)]",
  },
];

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);
  const primaryHref = DEV_AUTH_BYPASS ? "/dashboard" : "/auth/signup";

  return (
    <div className="min-h-screen overflow-hidden">
      <header className="border-b-2 border-foreground bg-card">
        <div className="mx-auto flex h-18 max-w-7xl items-center justify-between px-4 md:px-8">
          <Link href="/" className="flex items-center gap-3" aria-label="LeetCode Tracker home">
            <span className="grid h-10 w-10 place-items-center border-2 border-foreground bg-accent shadow-[3px_3px_0_0_var(--ink)]">
              <Braces className="h-5 w-5" />
            </span>
            <span className="font-mono text-sm font-black uppercase tracking-tight md:text-base">
              Leet<span className="text-destructive">Track</span>
            </span>
          </Link>

          <nav className="hidden items-center gap-7 md:flex" aria-label="Main navigation">
            <Link href="#features" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-destructive">
              Features
            </Link>
            <Link href="#about" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-destructive">
              About
            </Link>
            <Link href="/auth/login" className="font-mono text-xs font-bold uppercase tracking-widest hover:text-destructive">
              Log in
            </Link>
            <Button asChild size="sm">
              <Link href={primaryHref}>{DEV_AUTH_BYPASS ? "Open local demo" : "Start tracking"}</Link>
            </Button>
          </nav>

          <Button
            className="md:hidden"
            variant="ghost"
            size="icon"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close navigation" : "Open navigation"}
            aria-expanded={menuOpen}
          >
            {menuOpen ? <X /> : <Menu />}
          </Button>
        </div>

        {menuOpen && (
          <nav className="grid gap-2 border-t-2 border-foreground bg-card p-4 md:hidden" aria-label="Mobile navigation">
            <Link href="#features" className="border-b border-foreground/20 py-3 font-mono font-bold" onClick={() => setMenuOpen(false)}>
              01 / Features
            </Link>
            <Link href="#about" className="border-b border-foreground/20 py-3 font-mono font-bold" onClick={() => setMenuOpen(false)}>
              02 / About
            </Link>
            <Button asChild className="mt-2">
              <Link href={primaryHref}>{DEV_AUTH_BYPASS ? "Open local demo" : "Start tracking"}</Link>
            </Button>
          </nav>
        )}
      </header>

      {DEV_AUTH_BYPASS && (
        <div className="border-b-2 border-foreground bg-accent px-4 py-2 text-center font-mono text-xs font-bold uppercase tracking-widest">
          Local demo mode / authentication bypassed
        </div>
      )}

      <main>
        <section className="relative border-b-2 border-foreground px-4 py-16 md:px-8 md:py-24 lg:py-30">
          <div className="retro-dot-grid absolute -right-10 top-8 h-48 w-48 opacity-20 md:h-72 md:w-72" aria-hidden="true" />
          <div className="mx-auto grid max-w-7xl items-center gap-14 lg:grid-cols-[1.08fr_0.92fr]">
            <div className="relative z-10">
              <div className="retro-kicker">Interview prep, without the chaos</div>
              <h1 className="max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.07em] sm:text-6xl md:text-7xl lg:text-[5.6rem]">
                Make every <span className="relative inline-block px-2"><span className="absolute inset-x-0 bottom-1 h-[38%] -rotate-1 bg-accent" aria-hidden="true" /><span className="relative">solve</span></span> count.
              </h1>
              <p className="mt-8 max-w-xl text-lg leading-8 text-muted-foreground md:text-xl">
                A focused practice log for developers who want stronger habits, clearer weak spots, and one less spreadsheet.
              </p>
              <div className="mt-10 flex flex-col gap-4 sm:flex-row">
                <Button asChild size="lg" className="bg-destructive text-destructive-foreground">
                  <Link href={primaryHref}>
                    {DEV_AUTH_BYPASS ? "Enter demo run" : "Start your run"}
                    <ArrowRight />
                  </Link>
                </Button>
                <Button asChild size="lg" variant="outline">
                  <Link href="/auth/login">I already track</Link>
                </Button>
              </div>
              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 font-mono text-xs font-bold uppercase tracking-wide">
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1f7a55]" /> Progress history</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1f7a55]" /> Streaks</span>
                <span className="flex items-center gap-2"><Check className="h-4 w-4 text-[#1f7a55]" /> Friendly ranks</span>
              </div>
            </div>

            <div className="relative mx-auto w-full max-w-xl lg:rotate-1">
              <div className="absolute -left-5 -top-5 h-full w-full border-2 border-foreground bg-[var(--cyan)]" aria-hidden="true" />
              <div className="retro-panel relative overflow-hidden bg-[var(--ink)] text-[var(--paper)]">
                <div className="flex items-center justify-between border-b-2 border-[var(--paper)]/30 px-4 py-3 font-mono text-xs uppercase tracking-widest">
                  <span>session_0713.log</span>
                  <span className="flex gap-1.5" aria-hidden="true"><i className="h-2.5 w-2.5 bg-[var(--coral)]" /><i className="h-2.5 w-2.5 bg-[var(--sun)]" /><i className="h-2.5 w-2.5 bg-[var(--lime)]" /></span>
                </div>
                <div className="retro-scanlines p-5 md:p-7">
                  <p className="font-mono text-xs text-[var(--lime)]">$ leettrack status --today</p>
                  <div className="mt-6 grid grid-cols-3 gap-3">
                    {[['147', 'solved'], ['12', 'day streak'], ['11', 'this week']].map(([value, label]) => (
                      <div key={label} className="border border-[var(--paper)]/30 p-3">
                        <div className="font-mono text-2xl font-black text-white md:text-3xl">{value}</div>
                        <div className="mt-1 text-[10px] uppercase tracking-widest text-[var(--paper)]/60">{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 border-l-4 border-[var(--coral)] bg-white/6 p-4">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="font-mono text-xs text-[var(--paper)]/55">TODAY&apos;S QUEST</p>
                        <p className="mt-1 font-bold text-white">Solve one graph problem</p>
                      </div>
                      <span className="font-mono text-xl font-black text-[var(--lime)]">2/3</span>
                    </div>
                    <div className="mt-4 h-3 border border-[var(--paper)]/50 p-0.5"><div className="h-full w-2/3 bg-[var(--lime)]" /></div>
                  </div>
                  <div className="mt-6 space-y-2 font-mono text-xs">
                    <p><span className="text-[var(--cyan)]">#0146</span> LRU Cache <span className="float-right text-[var(--sun)]">▲ medium</span></p>
                    <p><span className="text-[var(--cyan)]">#0042</span> Trapping Rain Water <span className="float-right text-[var(--coral)]">■ hard</span></p>
                    <p className="animate-pulse text-[var(--lime)]">▮ ready for next solve</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="retro-marquee" aria-hidden="true">
          <div className="retro-marquee-track">
            {[0, 1].map((copy) => (
              <div key={copy} className="flex">
                <span>solve consistently</span><span>◆ spot patterns</span><span>▲ build momentum</span><span>■ interview ready</span>
              </div>
            ))}
          </div>
        </div>

        <section id="features" className="px-4 py-20 md:px-8 md:py-28">
          <div className="mx-auto max-w-7xl">
            <div className="grid gap-8 border-b-2 border-foreground pb-10 md:grid-cols-[0.8fr_1.2fr] md:items-end">
              <div>
                <div className="retro-kicker">The essential loop</div>
                <h2 className="retro-heading">Log. Learn. Level up.</h2>
              </div>
              <p className="retro-subhead md:justify-self-end">
                Built around the three things that actually improve interview prep: recall, repetition, and consistency.
              </p>
            </div>
            <div className="divide-y-2 divide-foreground border-b-2 border-foreground">
              {proofPoints.map((item, index) => {
                const Icon = item.icon;
                return (
                  <article key={item.title} className="grid gap-5 py-8 md:grid-cols-[5rem_1fr_1.2fr] md:items-center md:py-10">
                    <div className={`grid h-14 w-14 place-items-center border-2 border-foreground ${item.colour} shadow-[3px_3px_0_0_var(--ink)]`}>
                      <Icon className="h-6 w-6" />
                    </div>
                    <div>
                      <span className="font-mono text-xs font-bold text-muted-foreground">0{index + 1} / {item.command}</span>
                      <h3 className="mt-1 text-2xl font-black">{item.title}</h3>
                    </div>
                    <p className="max-w-xl leading-7 text-muted-foreground">{item.copy}</p>
                  </article>
                );
              })}
            </div>
          </div>
        </section>

        <section id="about" className="border-y-2 border-foreground bg-secondary px-4 py-16 md:px-8 md:py-20">
          <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-[1fr_auto] md:items-center">
            <div>
              <div className="retro-kicker">Built for the long game</div>
              <h2 className="max-w-4xl text-4xl font-black leading-tight md:text-6xl">Your practice history should motivate you—not become another project to maintain.</h2>
            </div>
            <Button asChild size="lg" className="bg-accent text-accent-foreground md:-rotate-2">
              <Link href={primaryHref}>Start at problem #1 <ArrowRight /></Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="bg-[var(--ink)] px-4 py-8 text-[var(--paper)] md:px-8">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 font-mono text-xs uppercase tracking-wider sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 LeetTrack / Built for consistent coders.</p>
          <div className="flex gap-5"><Link href="/auth/login" className="hover:text-[var(--lime)]">Log in</Link><Link href="/leaderboard" className="hover:text-[var(--lime)]">Leaderboard</Link></div>
        </div>
      </footer>
    </div>
  );
}
