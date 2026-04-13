import Link from "next/link"
import { BookOpen, Github, Twitter, Linkedin } from "lucide-react"

const footerLinks = {
  product: [
    { name: "Features", href: "#features" },
    { name: "Resources", href: "/courses" },
    { name: "AI Assistant", href: "/dashboard/ai-chat" },
  ],
  support: [
    { name: "Help Center", href: "/help-support" },
    { name: "Contact Us", href: "/contact-us" },
    { name: "FAQs", href: "/help-support" },
  ],
  legal: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms of Service", href: "#" },
  ],
}

export function Footer() {
  return (
    <footer id="contact" className="relative border-t border-white/5 bg-surface-low pt-24 pb-12 overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 lg:px-8">
        <div className="grid gap-16 lg:grid-cols-2">
          {/* Brand & Mission */}
          <div className="flex flex-col items-start gap-8">
            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white shadow-lg">
                <BookOpen className="h-5 w-5" />
              </div>
              <span className="text-2xl font-display font-bold gradient-text">quickGyan</span>
            </Link>
            <p className="max-w-md text-lg leading-relaxed text-muted-foreground/70 italic">
              "The definitive companion for BCA students searching for excellence and clarity through curated intelligence."
            </p>
            <div className="flex gap-6">
              {[
                { icon: Twitter, label: "Twitter" },
                { icon: Github, label: "GitHub" },
                { icon: Linkedin, label: "LinkedIn" }
              ].map((social) => (
                <a 
                  key={social.label} 
                  href="#" 
                  className="h-10 w-10 flex items-center justify-center rounded-full bg-surface-default border border-white/5 text-muted-foreground transition-all hover:text-primary hover:border-primary/30"
                >
                  <span className="sr-only">{social.label}</span>
                  <social.icon className="h-5 w-5" />
                </a>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-12">
            <div>
              <h3 className="font-display font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Product</h3>
              <ul className="space-y-4">
                {footerLinks.product.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Support</h3>
              <ul className="space-y-4">
                {footerLinks.support.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="font-display font-bold text-foreground mb-6 uppercase tracking-wider text-xs">Legal</h3>
              <ul className="space-y-4">
                {footerLinks.legal.map((link) => (
                  <li key={link.name}>
                    <Link href={link.href} className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-24 pt-8 border-t border-white/5 flex flex-col items-center justify-between gap-6 md:flex-row">
          <p className="text-sm text-muted-foreground/60">
            &copy; {new Date().getFullYear()} quickGyan. All rights reserved.
          </p>
          <div className="flex items-center gap-2">
            <div className="h-1 w-1 rounded-full bg-primary" />
            <span className="text-xs font-medium text-muted-foreground/70 tracking-widest uppercase">
              The Digital Curator
            </span>
          </div>
          <p className="text-sm text-muted-foreground/60">
            Handcrafted with excellence.
          </p>
        </div>
      </div>
      
      {/* Footer Ambient Glow */}
      <div className="absolute bottom-0 right-0 w-64 h-64 bg-primary/5 blur-[100px] rounded-full -mb-32 -mr-32" />
    </footer>
  )
}
