
// hero-section component
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

export function HeroSection() {
  return (
    <section className="relative overflow-hidden px-4 py-20 lg:py-32">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] translate-x-1/4 translate-y-1/4 rounded-full bg-accent/10 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="flex flex-col items-start">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium text-primary">AI-Powered Learning</span>
            </div>

            <h1 className="text-balance text-4xl font-bold tracking-tight text-foreground sm:text-5xl lg:text-6xl">
              Master Your{" "}
              <span className="text-primary">BCA</span> with{" "}
              <span className="text-primary">quickGyan</span>
            </h1>

            <p className="mt-6 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground">
              The one-stop academic platform for IGNOU students. Get centralized notes, 
              previous year papers, and 24/7 AI-powered doubt solving - all organized 
              semester-wise for seamless learning.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row">
              <Button size="lg" asChild className="gap-2">
                <Link href="/signup">
                  Get Started Free
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-border pt-8">
              <div>
                <p className="text-2xl font-bold text-foreground">6+</p>
                <p className="text-sm text-muted-foreground">Semesters</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">500+</p>
                <p className="text-sm text-muted-foreground">Resources</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-foreground">24/7</p>
                <p className="text-sm text-muted-foreground">AI Support</p>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-2xl border border-border bg-card p-6 shadow-xl">
              {/* Mock dashboard preview */}
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-lg bg-primary/10" />
                  <div>
                    <div className="h-3 w-24 rounded bg-muted" />
                    <div className="mt-1.5 h-2 w-16 rounded bg-muted/60" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="rounded-lg border border-border bg-muted/30 p-4">
                      <div className="mb-2 h-2 w-12 rounded bg-primary/20" />
                      <div className="h-8 w-8 rounded bg-primary/10" />
                      <div className="mt-3 h-2 w-full rounded bg-muted" />
                    </div>
                  ))}
                </div>
                <div className="rounded-lg border border-primary/20 bg-primary/5 p-4">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <div className="h-2 w-20 rounded bg-primary/30" />
                  </div>
                  <div className="mt-2 space-y-1.5">
                    <div className="h-2 w-full rounded bg-muted" />
                    <div className="h-2 w-3/4 rounded bg-muted" />
                  </div>
                </div>
              </div>
            </div>
            {/* Floating cards */}
            <div className="absolute -left-8 -top-8 rounded-xl border border-border bg-card p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-full bg-accent/20" />
                <div>
                  <div className="h-2 w-16 rounded bg-muted" />
                  <div className="mt-1 h-2 w-10 rounded bg-accent/30" />
                </div>
              </div>
            </div>
            <div className="absolute -bottom-4 -right-4 rounded-xl border border-border bg-card p-4 shadow-lg">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded bg-primary/20" />
                <div>
                  <div className="h-2 w-20 rounded bg-muted" />
                  <div className="mt-1 h-2 w-12 rounded bg-primary/30" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
