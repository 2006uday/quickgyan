"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react"

export function CtaSection() {
  const { user } = useAuth()

  return (
    <section className="relative px-4 pt-12 pb-24 lg:pt-16 lg:pb-32 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute right-0 top-0 h-64 w-64 bg-secondary/5 blur-[100px] rounded-full" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-card via-muted/50 to-card border border-border p-12 lg:p-16 text-center shadow-xl">
          {/* Inner top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {/* Badge */}
          <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Start for Free</span>
          </div>

          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-4 leading-[1.1]">
            Ready to <span className="text-primary">Ace</span> Your{" "}
            <span className="text-primary">BCA?</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground leading-relaxed mb-8">
            Join thousands of BCA students who have elevated their academic journey with
            AI-powered tools, curated resources, and 24/7 intelligent support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-base font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-4 text-base font-bold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl border border-border bg-card px-8 py-4 text-base font-semibold text-foreground hover:bg-muted transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground font-medium uppercase tracking-widest">
            {["No credit card required", "Free forever plan", "IGNOU BCA focused"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-primary/50" />
                {badge}
              </div>
            ))}
          </div>

          {/* Inner bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-primary/20 to-transparent" />
        </div>
      </div>
    </section>
  )
}
