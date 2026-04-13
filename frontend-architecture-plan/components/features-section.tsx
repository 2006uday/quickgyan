"use client"

// features-section component
import { BookOpen, Clock, FileText, Brain, Shield, Search, Zap } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Centralized Library",
    description: "Access all BCA study materials, elective notes, and curated external resources in one organized, distraction-free environment.",
  },
  {
    icon: Brain,
    title: "AI Doubt Solver",
    description: "Stuck on a complex algorithm or math problem? Our custom AI tutor is trained specifically on IGNOU syllabi to provide instant 24/7 clarity.",
  },
  {
    icon: FileText,
    title: "Solved Papers",
    description: "Stop hunting for solutions. Get the last 10 years of solved question papers with detailed step-by-step explanations.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find any resource instantly with our powerful search. Filter by semester, subject, or resource type with AI-driven suggestions.",
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Your academic progress is protected with industry-standard encryption, OTP verification, and secure cloud backups.",
  },
  {
    icon: Zap,
    title: "Real-time Updates",
    description: "Get notified about new sample papers, exam schedules, and curriculum changes the moment they are released.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="relative px-4 py-24 lg:py-40 overflow-hidden">
      {/* Subtle Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full -z-10">
        <div className="absolute top-0 left-0 w-96 h-96 bg-primary/5 blur-[120px] rounded-full" />
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-secondary/5 blur-[120px] rounded-full" />
      </div>

      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-24">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
            Everything You Need to <span className="gradient-text">Excel.</span>
          </h2>
          <p className="text-lg text-muted-foreground/70 leading-relaxed">
            quickGyan adopts the persona of a Digital Curator—a sophisticated and calm 
            experience that prioritizes your cognitive ease and visual prestige.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature, index) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl bg-surface-low p-8 transition-all duration-300 hover:bg-surface-default hover:-translate-y-1 animate-in fade-in slide-in-from-bottom-4 duration-700"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Glow effect on hover */}
              <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              
              <div className="relative z-10">
                <div className="mb-6 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-surface-default text-primary transition-all group-hover:bg-primary group-hover:text-white group-hover:scale-110 shadow-lg">
                  <feature.icon className="h-6 w-6" />
                </div>
                <h3 className="text-xl font-display font-bold text-foreground mb-3">{feature.title}</h3>
                <p className="text-sm leading-relaxed text-muted-foreground/80 group-hover:text-muted-foreground transition-colors">{feature.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
