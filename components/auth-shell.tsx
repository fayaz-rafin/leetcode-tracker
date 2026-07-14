import Link from "next/link";
import { Braces, Check } from "lucide-react";

import { DEV_AUTH_BYPASS } from "@/lib/dev-mode";
import { Button } from "@/components/ui/button";

export function AuthShell({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <main className="grid min-h-screen lg:grid-cols-[0.9fr_1.1fr]">
      <section className="flex flex-col justify-between border-b-2 border-foreground bg-card p-6 md:p-10 lg:border-b-0 lg:border-r-2">
        <Link href="/" className="flex w-fit items-center gap-3 font-mono text-sm font-black uppercase">
          <span className="grid h-10 w-10 place-items-center border-2 border-foreground bg-accent shadow-[3px_3px_0_0_var(--ink)]"><Braces /></span>
          Leet<span className="-ml-3 text-destructive">Track</span>
        </Link>

        <div className="mx-auto my-14 w-full max-w-md">
          <div className="retro-kicker">{eyebrow}</div>
          <h1 className="text-4xl font-black leading-none md:text-6xl">{title}</h1>
          <p className="mt-4 leading-7 text-muted-foreground">{description}</p>
          {DEV_AUTH_BYPASS && (
            <div className="mt-6 border-2 border-foreground bg-accent p-4 shadow-[3px_3px_0_0_var(--ink)]">
              <p className="font-mono text-xs font-black uppercase tracking-widest">Local demo is unlocked</p>
              <Button asChild className="mt-3 w-full bg-destructive text-destructive-foreground"><Link href="/dashboard">Skip login → open dashboard</Link></Button>
            </div>
          )}
          <div className="mt-8">{children}</div>
        </div>

        <p className="font-mono text-[10px] font-bold uppercase tracking-widest text-muted-foreground">Secure save file / Supabase auth</p>
      </section>

      <aside className="retro-scanlines hidden bg-primary p-10 text-primary-foreground lg:flex lg:items-center lg:justify-center">
        <div className="w-full max-w-xl border-2 border-[var(--paper)]/60 bg-[var(--ink)] shadow-[9px_9px_0_0_var(--coral)]">
          <div className="flex justify-between border-b border-white/25 p-4 font-mono text-xs uppercase tracking-widest"><span>new_session.sh</span><span className="text-[var(--lime)]">● online</span></div>
          <div className="p-8 font-mono">
            <p className="text-sm text-[var(--cyan)]">$ ./build-a-better-streak</p>
            <h2 className="mt-6 text-4xl font-black leading-tight text-white">One focused session at a time.</h2>
            <div className="mt-8 space-y-4 text-sm text-[var(--paper)]/75">
              {["Log the problems you actually solved", "Spot weak patterns before interviews", "Keep your momentum visible"].map((line) => <p key={line} className="flex items-center gap-3"><Check className="h-4 w-4 text-[var(--lime)]" /> {line}</p>)}
            </div>
            <p className="mt-10 animate-pulse text-sm text-[var(--lime)]">▮ waiting for player one</p>
          </div>
        </div>
      </aside>
    </main>
  );
}
