"use client"

import { Star, Quote } from "lucide-react"

const testimonials = [
  {
    name: "Rahul Sharma",
    role: "4th Semester BCA Student",
    content: "quickGyan has been a lifesaver for MCS-012. The AI tutor explained complex matrix operations in minutes, which used to take me hours to grasp from traditional textbooks.",
    avatar: "RS"
  },
  {
    name: "Priya Verma",
    role: "BCA Alumna, 2023",
    content: "The library is incredibly well-organized. Finding previous year papers with actual solutions instead of just questions saved me so much time during finals. Highly recommended!",
    avatar: "PV"
  },
  {
    name: "Anas Khan",
    role: "2nd Semester BCA Student",
    content: "The smart search feature is what sets this apart. I can find exactly the notes I need across all subjects in seconds. The AI doubt solver is just the icing on the cake.",
    avatar: "AK"
  }
]

export function TestimonialsSection() {
  return (
    <section className="relative px-4 py-24 lg:py-40 overflow-hidden">
      <div className="mx-auto max-w-7xl">
        <div className="mx-auto max-w-3xl text-center mb-24">
          <h2 className="font-display text-4xl font-extrabold tracking-tight text-foreground sm:text-5xl mb-6">
            Voices from the <span className="gradient-text">Community.</span>
          </h2>
          <p className="text-lg text-muted-foreground/70 leading-relaxed">
            Hear from BCA students who have transformed their learning experience with our AI-driven platform.
          </p>
        </div>

        <div className="grid gap-8 md:grid-cols-3">
          {testimonials.map((testimonial, index) => (
            <div 
              key={testimonial.name}
              className="relative p-8 rounded-[2rem] bg-surface-low border border-white/5 shadow-2xl transition-all duration-300 hover:bg-surface-default hover:-translate-y-2 group"
            >
              <div className="absolute top-6 right-8 text-primary/10 group-hover:text-primary/20 transition-colors">
                <Quote className="h-12 w-12" />
              </div>
              
              <div className="flex gap-1 mb-6">
                {[1, 2, 3, 4, 5].map((s) => (
                  <Star key={s} className="h-4 w-4 fill-primary text-primary" />
                ))}
              </div>

              <p className="text-muted-foreground/80 leading-relaxed mb-8 italic">
                "{testimonial.content}"
              </p>

              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-primary to-secondary text-sm font-bold text-white shadow-lg">
                  {testimonial.avatar}
                </div>
                <div className="text-left">
                  <p className="font-display font-bold text-foreground">{testimonial.name}</p>
                  <p className="text-xs text-muted-foreground opacity-60 uppercase tracking-widest">{testimonial.role}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
