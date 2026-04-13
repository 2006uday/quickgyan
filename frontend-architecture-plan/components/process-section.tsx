"use client"

import { UserPlus, BookOpen, GraduationCap } from "lucide-react"

const steps = [
  {
    icon: UserPlus,
    title: "Enroll",
    description: "Create your profile and select your current semester to personalize your dashboard.",
    color: "from-blue-400 to-indigo-500"
  },
  {
    icon: BookOpen,
    title: "Learn",
    description: "Engage with AI-curated notes, interactive labs, and instant doubt resolution.",
    color: "from-indigo-400 to-violet-500"
  },
  {
    icon: GraduationCap,
    title: "Succeed",
    description: "Master your exams with solved papers and dedicated mock assessments.",
    color: "from-violet-400 to-fuchsia-500"
  }
]

export function ProcessSection() {
  return (
    <section className="relative px-4 py-24 lg:py-40 bg-surface-low/50">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-24">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
            Our <span className="gradient-text">Process.</span>
          </h2>
          <p className="text-lg text-muted-foreground/70 leading-relaxed">
            A streamlined journey designed specifically for the modern BCA student.
          </p>
        </div>

        <div className="relative grid gap-12 md:grid-cols-3">
          {/* Connector Line (Desktop) */}
          <div className="absolute top-1/2 left-0 w-full h-[2px] bg-gradient-to-r from-primary/20 via-secondary/20 to-primary/20 hidden md:block -translate-y-1/2" />
          
          {steps.map((step, index) => (
            <div key={step.title} className="relative z-10 flex flex-col items-center text-center group">
              <div className="mb-8 relative">
                <div className={`flex h-20 w-20 items-center justify-center rounded-2xl bg-surface-default border border-white/5 shadow-2xl transition-all duration-300 group-hover:scale-110 group-hover:border-primary/50`}>
                  <step.icon className="h-10 w-10 text-primary" />
                </div>
                {/* Step Number Badge */}
                <div className="absolute -top-3 -right-3 h-8 w-8 rounded-full bg-surface-highest border border-white/10 flex items-center justify-center text-xs font-bold text-white shadow-lg">
                  {index + 1}
                </div>
              </div>
              
              <h3 className="text-2xl font-display font-bold text-foreground mb-4">{step.title}</h3>
              <p className="text-muted-foreground/70 leading-relaxed max-w-[280px]">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
