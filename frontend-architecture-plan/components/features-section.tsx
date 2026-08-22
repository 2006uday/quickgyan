"use client"

// features-section component
import { BookOpen, Globe, FileText, Search, Shield, Clock } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Centralized Library",
    description: "All your semester books, notes, and study materials organized in one place. No more scattered resources.",
  },
  {
    icon: Globe,
    title: "AI Doubt Solver",
    description: "Get instant answers to your academic queries with our AI-powered learning assistant available 24/7.",
  },
  {
    icon: FileText,
    title: "Previous Papers",
    description: "Access 5+ years of organized question papers with solutions to ace your exams with confidence.",
  },
  {
    icon: Search,
    title: "Smart Search",
    description: "Find any resource instantly with our powerful search. Filter by semester, subject, or resource type.",
  },
  {
    icon: Shield,
    title: "Secure Access",
    description: "Your data is protected with industry-standard encryption, OTP verification, and JWT authentication.",
  },
  {
    icon: Clock,
    title: "Learn Anytime",
    description: "Access your personalized dashboard and study materials from anywhere, at any time on any device.",
  },
]

export function FeaturesSection() {
  return (
    <section id="features" className="px-4 py-16 lg:py-24">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center mb-10">
          <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-4">
            Everything You Need to Excel
          </h2>
          <p className="text-base text-muted-foreground leading-relaxed">
            quickGyan brings together all the tools and resources you need for academic success
            in one powerful platform.
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="rounded-2xl border border-border bg-card p-6 transition-all hover:shadow-md"
            >
              <div className="mb-4 inline-flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <feature.icon className="h-5 w-5" />
              </div>
              <h3 className="text-base font-display font-bold text-foreground mb-2">{feature.title}</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
