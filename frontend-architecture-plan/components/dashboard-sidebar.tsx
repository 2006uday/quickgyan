"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { useAuth } from "@/lib/auth-context"
import {
  BookOpen,
  LayoutDashboard,
  GraduationCap,
  FileText,
  Brain,
  Settings,
  LogOut,
  Shield,
  Activity,
  Layers,
  Sparkles,
} from "lucide-react"
import { Button } from "@/components/ui/button"

const studentNavItems = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Courses", href: "/dashboard/courses", icon: GraduationCap },
  { name: "Resources", href: "/dashboard/resources", icon: FileText },
  { name: "AI Assistant", href: "/dashboard/ai-chat", icon: Brain },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
]

const adminNavItems = [
  { name: "Dashboard", href: "/admin", icon: LayoutDashboard },
  { name: "Manage Programs", href: "/admin/programs", icon: Layers },
  { name: "Manage Courses", href: "/admin/courses", icon: GraduationCap },
  { name: "Manage Resources", href: "/admin/resources", icon: FileText },
  { name: "Users", href: "/admin/users", icon: Shield },
  { name: "System Health", href: "/admin/system-health", icon: Activity },
  { name: "Settings", href: "/admin/settings", icon: Settings },
]

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()

  const isAdmin = user?.role === "admin"
  const navItems = isAdmin ? adminNavItems : studentNavItems
  

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="fixed inset-y-0 left-0 z-50 hidden w-64 flex-col border-r border-border bg-card lg:flex">
        <div className="flex h-16 items-center gap-2 border-b border-border px-6">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <BookOpen className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="text-lg font-bold">quickGyan</span>
          {isAdmin && (
            <span className="ml-auto rounded bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Admin
            </span>
          )}
        </div>

        <nav className="flex-1 space-y-1 p-4">
          {navItems.map((item) => {
            const isActive = pathname === item.href
            const isAIAssistant = item.href === "/dashboard/ai-chat"
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary text-primary-foreground"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="flex-1">{item.name}</span>
                {!user && isAIAssistant && (
                  <span className="flex items-center gap-1 rounded bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-amber-600 dark:text-amber-400">
                    <Sparkles className="h-3 w-3" />
                    Login
                  </span>
                )}
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-4">
          {user ? (
            <>
              <div className="mb-4 flex items-center gap-3 px-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                  {user.name?.charAt(0) || "U"}
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.enrollmentNo}</p>
                </div>
              </div>
              <Button
                variant="ghost"
                className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground"
                onClick={logout}
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center gap-3 px-2">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted text-sm font-medium text-muted-foreground">
                  G
                </div>
                <div className="flex-1 truncate">
                  <p className="truncate text-sm font-medium">Guest Student</p>
                  <p className="truncate text-[11px] text-muted-foreground">Sign in to save history</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <Button asChild size="sm" variant="outline" className="w-full text-xs">
                  <Link href="/login">Log in</Link>
                </Button>
                <Button asChild size="sm" className="w-full text-xs">
                  <Link href="/signup">Sign up</Link>
                </Button>
              </div>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t border-border bg-card lg:hidden">
        <div className="flex items-center justify-around py-2">
          {navItems.slice(0, 5).map((item) => {
            const isActive = pathname === item.href
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-3 py-2",
                  isActive ? "text-primary" : "text-muted-foreground"
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="text-xs">{item.name}</span>
              </Link>
            )
          })}
        </div>
      </nav>
    </>
  )
}
