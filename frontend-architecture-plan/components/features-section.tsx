import { BookOpen, Clock, FileText, Brain, Shield, Search } from "lucide-react"

const features = [
  {
    icon: BookOpen,
    title: "Centralized Library",
    description: "All your semester books, notes, and study materials organized in one place. No more scattered resources.",
  },
  {
    icon: Brain,
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
    <section id="features" className="px-4 py-20 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-balance text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Everything You Need to Excel
          </h2>
          <p className="mt-4 text-pretty text-lg text-muted-foreground">
            quickGyan brings together all the tools and resources you need for academic success in one powerful platform.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-5xl gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group relative rounded-2xl border border-border bg-card p-6 transition-all hover:border-primary/30 hover:shadow-lg"
            >
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">{feature.title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
