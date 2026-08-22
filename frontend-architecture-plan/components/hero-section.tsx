"use client"

// hero-section component
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, LayoutDashboard, BookOpen, FileText } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

const stats = [
  { value: "6+", label: "Semesters" },
  { value: "500+", label: "Resources" },
  { value: "24/7", label: "AI Support" },
]

export function HeroSection() {
  const { user } = useAuth()

  return (
    <section className="relative overflow-hidden px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          {/* Text content */}
          <div className="flex flex-col items-start text-left">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              <span className="text-xs font-semibold text-primary">AI-Powered Learning</span>
            </div>

            <h1 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl lg:text-6xl leading-tight">
              Master Your BCA <br className="hidden sm:block" />
              with <span className="text-primary">quickGyan</span>
            </h1>

            <p className="mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground">
              The one-stop academic platform for IGNOU students. Get centralized notes, previous
              year papers, and 24/7 AI-powered doubt solving — all organized semester-wise for
              seamless learning.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              {user ? (
                <Button size="lg" asChild className="gap-2">
                  <Link href="/dashboard">
                    <LayoutDashboard className="h-4 w-4" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="lg" asChild className="gap-2">
                  <Link href="/signup">
                    Get Started Free
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="#features">Explore Features</Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8">
              {stats.map((stat) => (
                <div key={stat.label}>
                  <p className="font-display text-3xl font-bold text-foreground">{stat.value}</p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative hidden lg:block">
            <div className="relative rounded-3xl border border-border bg-card p-6 shadow-xl">
              <div className="grid grid-cols-2 gap-4">
                {[
                  { Icon: BookOpen, title: "C Programming Notes", tag: "MCS-011" },
                  { Icon: FileText, title: "Solved Question Papers", tag: "2018-2023" },
                  { Icon: BookOpen, title: "DBMS Study Material", tag: "MCS-023" },
                  { Icon: FileText, title: "Solved Assignments", tag: "Sem 1-6" }
                ].map((item, i) => (
                  <div key={i} className="rounded-xl border border-border bg-muted/40 p-3 flex flex-col justify-between min-h-[85px]">
                    <div className="flex justify-between items-start">
                      <item.Icon className="h-4 w-4 text-primary" />
                      <span className="text-[9px] font-bold text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                        {item.tag}
                      </span>
                    </div>
                    <div className="mt-2">
                      <h4 className="text-[11px] font-semibold text-foreground line-clamp-1">{item.title}</h4>
                    </div>
                  </div>
                ))}
              </div>
              <div className="mt-3.5 flex items-center gap-2.5 rounded-xl border border-border bg-muted/40 p-3">
                <Sparkles className="h-4 w-4 text-primary shrink-0 animate-pulse" />
                <div className="flex-1 text-[11px] text-muted-foreground line-clamp-1">
                  Ask AI: <span className="text-foreground font-medium">Explain normalization...</span>
                </div>
              </div>
            </div>

            {/* Decorative accents */}
            <div className="absolute -top-3 -left-3 flex items-center gap-1.5 rounded-full bg-card px-2.5 py-1 shadow-md border border-border">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[9px] font-medium text-muted-foreground">AI Doubt solver active</span>
            </div>
            <div className="absolute -bottom-3 -right-3 flex h-8 w-8 items-center justify-center rounded-lg bg-primary shadow-lg hover:scale-105 transition-transform duration-200 cursor-pointer">
              <Sparkles className="h-3.5 w-3.5 text-primary-foreground" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
