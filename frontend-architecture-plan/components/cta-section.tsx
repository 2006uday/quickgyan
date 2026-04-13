"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { ArrowRight, Sparkles, LayoutDashboard } from "lucide-react"

export function CtaSection() {
  const { user } = useAuth()

  return (
    <section className="relative px-4 py-24 lg:py-36 overflow-hidden">
      {/* Ambient background */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-primary/5 to-transparent" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[500px] w-[700px] bg-primary/8 blur-[120px] rounded-full" />
        <div className="absolute right-0 top-0 h-64 w-64 bg-secondary/8 blur-[100px] rounded-full" />
      </div>

      <div className="mx-auto max-w-4xl">
        {/* Card */}
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[#0f1930]/80 backdrop-blur-xl border border-white/8 p-12 lg:p-16 text-center shadow-[0_0_0_1px_rgba(159,167,255,0.08),0_32px_80px_-20px_rgba(0,0,0,0.6)]">
          {/* Inner top glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 h-px w-3/4 bg-gradient-to-r from-transparent via-[#9fa7ff]/40 to-transparent" />

          {/* Badge */}
          <div className="mb-8 inline-flex items-center gap-2 rounded-full bg-primary/10 border border-primary/20 px-4 py-1.5">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">Start for Free</span>
          </div>

          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl mb-6 leading-[1.1]">
            Ready to <span className="gradient-text">Ace</span> Your{" "}
            <span className="gradient-text">BCA?</span>
          </h2>

          <p className="mx-auto max-w-2xl text-lg text-muted-foreground/70 leading-relaxed mb-12">
            Join thousands of BCA students who have elevated their academic journey with
            AI-powered tools, curated resources, and 24/7 intelligent support.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            {user ? (
              <Link
                href="/dashboard"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#9fa7ff] to-[#c180ff] px-8 py-4 text-base font-bold text-[#060e20] shadow-[0_0_30px_rgba(159,167,255,0.35)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(159,167,255,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                <LayoutDashboard className="h-5 w-5" />
                Go to Dashboard
              </Link>
            ) : (
              <Link
                href="/signup"
                className="group inline-flex items-center gap-2.5 rounded-2xl bg-gradient-to-r from-[#9fa7ff] to-[#c180ff] px-8 py-4 text-base font-bold text-[#060e20] shadow-[0_0_30px_rgba(159,167,255,0.35)] transition-all duration-300 hover:shadow-[0_0_45px_rgba(159,167,255,0.55)] hover:scale-[1.02] active:scale-[0.98]"
              >
                Get Started — It&apos;s Free
                <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
              </Link>
            )}
            <Link
              href="#features"
              className="inline-flex items-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-8 py-4 text-base font-semibold text-white/80 hover:text-white hover:bg-white/10 transition-all duration-200"
            >
              Explore Features
            </Link>
          </div>

          {/* Trust badges */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-muted-foreground/50 font-medium uppercase tracking-widest">
            {["No credit card required", "Free forever plan", "IGNOU BCA focused"].map((badge) => (
              <div key={badge} className="flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary/50" />
                {badge}
              </div>
            ))}
          </div>

          {/* Inner bottom glow */}
          <div className="absolute bottom-0 left-1/2 -translate-x-1/2 h-px w-1/2 bg-gradient-to-r from-transparent via-[#c180ff]/30 to-transparent" />
        </div>
      </div>
    </section>
  )
}
