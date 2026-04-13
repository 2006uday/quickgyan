"use client"

// hero-section component
import Link from "next/link"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles, Play, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"

export function HeroSection() {
  const { user } = useAuth()
  return (
    <section className="relative overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 px-4">
      {/* Background decoration */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute left-1/2 top-0 h-[800px] w-[800px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[600px] w-[600px] translate-x-1/4 translate-y-1/4 rounded-full bg-secondary/10 blur-[100px]" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Text content */}
          <div className="flex flex-col items-start text-left lg:max-w-xl">
            <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/5 bg-white/5 px-4 py-2 backdrop-blur-md animate-in fade-in slide-in-from-bottom-4 duration-700">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-xs font-semibold uppercase tracking-widest text-primary/80">AI-Powered Learning</span>
            </div>

            <h1 className="font-display text-5xl font-extrabold tracking-tight text-foreground sm:text-6xl lg:text-7xl leading-[1.1] animate-in fade-in slide-in-from-bottom-6 duration-1000">
              Your IGNOU BCA Journey, <span className="gradient-text">Reimagined.</span>
            </h1>

            <p className="mt-8 text-lg leading-relaxed text-muted-foreground/80 animate-in fade-in slide-in-from-bottom-8 duration-1000">
              Centralized resources and 24/7 AI-powered support for modern learners. 
              The definitive companion for BCA students searching for excellence and clarity.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row animate-in fade-in slide-in-from-bottom-10 duration-1000">
              {user ? (
                <Button size="xl" asChild className="rounded-2xl bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-2xl shadow-primary/20 group h-14 px-8">
                  <Link href="/dashboard">
                    <LayoutDashboard className="mr-2 h-5 w-5" />
                    Go to Dashboard
                  </Link>
                </Button>
              ) : (
                <Button size="xl" asChild className="rounded-2xl bg-gradient-to-r from-primary to-secondary text-white border-0 shadow-2xl shadow-primary/20 group h-14 px-8">
                  <Link href="/signup">
                    Join the Future
                    <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                  </Link>
                </Button>
              )}
              <Button size="xl" variant="outline" asChild className="rounded-2xl border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 h-14 px-8 gap-2">
                <Link href="#features">
                  <Play className="h-4 w-4 fill-foreground" />
                  Watch Demo
                </Link>
              </Button>
            </div>

            {/* Stats */}
            <div className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-10 animate-in fade-in duration-1000">
              <div>
                <p className="font-display text-3xl font-bold text-foreground">6+</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Semesters</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">10k+</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">Students</p>
              </div>
              <div>
                <p className="font-display text-3xl font-bold text-foreground">24/7</p>
                <p className="mt-1 text-xs font-medium uppercase tracking-wider text-muted-foreground/60">AI Wisdom</p>
              </div>
            </div>
          </div>

          {/* Hero illustration */}
          <div className="relative animate-in fade-in zoom-in duration-1000 delay-300">
            <div className="relative overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 p-4 shadow-3xl backdrop-blur-sm">
              <div className="relative overflow-hidden rounded-[2rem]">
                <Image 
                  src="/hero.png" 
                  alt="QuickGyan AI Learning" 
                  width={1200} 
                  height={800} 
                  className="object-cover transition-transform duration-700 hover:scale-105"
                  priority
                />
              </div>
              
              {/* Floating UI Elements */}
              <div className="absolute -left-10 top-1/2 -translate-y-1/2 hidden xl:block">
                <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-2xl animate-bounce-slow">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">AI Doubt Solver</p>
                      <p className="text-[10px] text-muted-foreground">Ready to assist 24/7</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="absolute -right-10 bottom-20 hidden xl:block">
                <div className="glass-dark p-4 rounded-2xl border border-white/10 shadow-2xl animate-float">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-secondary/20 flex items-center justify-center">
                      <Play className="h-4 w-4 text-secondary fill-secondary" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">MCS-012 Lecture</p>
                      <p className="text-[10px] text-muted-foreground">Now streaming</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Background Glow */}
            <div className="absolute -inset-10 -z-10 bg-gradient-to-br from-primary/20 to-secondary/20 blur-[100px] opacity-50" />
          </div>
        </div>
      </div>
    </section>
  )
}
