"use client"

import { GraduationCap, Users, HeartHandshake } from "lucide-react"

export function AboutSection() {
  return (
    <section id="about" className="relative px-4 py-16 lg:py-24 bg-muted/20 border-t border-border">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-2 lg:gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 rounded-full bg-primary/10 px-4 py-1.5 mb-6">
              <span className="text-xs font-semibold text-primary">About quickGyan</span>
            </div>
            <h2 className="font-display text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl mb-6">
              Empowering Students with <span className="text-primary">Smarter Learning</span>
            </h2>
            <p className="text-muted-foreground leading-relaxed mb-6">
              quickGyan is an academic platform specifically built for IGNOU BCA students. We bridge the gap between traditional study materials and modern web learning by centralizing resources and providing 24/7 AI-powered support.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              Our mission is to simplify preparation by making high-quality notes, past year solved papers, and assignment guidance accessible to all. No more searching through scattered groups or waiting days to clear doubts.
            </p>
          </div>

          <div className="grid gap-6">
            {[
              {
                icon: GraduationCap,
                title: "Curated for IGNOU Syllabus",
                description: "Tailored to align perfectly with the IGNOU BCA curriculum, course codes, and exam formats."
              },
              {
                icon: Users,
                title: "Student Centric Experience",
                description: "Built to address the actual challenges students face, from assignments to exam stress."
              },
              {
                icon: HeartHandshake,
                title: "24/7 AI Support & Community",
                description: "Instant doubt resolution with AI, coupled with static guides, whenever you need help."
              }
            ].map((item, i) => (
              <div key={i} className="flex gap-4 p-5 rounded-2xl border border-border bg-card shadow-sm">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <item.icon className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-foreground mb-1">{item.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
