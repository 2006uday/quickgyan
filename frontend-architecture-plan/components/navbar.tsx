"use client"

// navbar component — Digital Curator Design System (StitchMCP)
import Link from "next/link"
import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Menu, X, BookOpen, LogOut, User, Bell, Sparkles, ChevronRight, LayoutDashboard } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Features", href: "#features" },
  { label: "Process", href: "#process" },
  { label: "Library", href: "/courses" },
  { label: "Community", href: "#community" },
]

export function Navbar() {
  const { user, logout, getNotifications, markNotificationAsRead } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [notifications, setNotifications] = useState<any[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [scrolled, setScrolled] = useState(false)
  const [activeLink, setActiveLink] = useState("")

  const fetchNotifications = useCallback(async () => {
    try {
      const res = await getNotifications()
      if (res.success && res.data?.notifications) {
        const notifs = res.data.notifications
        setNotifications(notifs)
        setUnreadCount(notifs.filter((n: any) => !n.isRead).length)
      }
    } catch (error) {
      console.error("Fetch notifications error:", error)
    }
  }, [getNotifications])

  const handleMarkAsRead = async (id: string) => {
    try {
      const res = await markNotificationAsRead(id)
      if (res.success) {
        setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n))
        setUnreadCount(prev => Math.max(0, prev - 1))
      }
    } catch (error) {
      console.error("Mark as read error:", error)
    }
  }

  useEffect(() => {
    if (user) fetchNotifications()

    const handleScroll = () => {
      setScrolled(window.scrollY > 30)
    }
    window.addEventListener("scroll", handleScroll, { passive: true })
    return () => window.removeEventListener("scroll", handleScroll)
  }, [user, fetchNotifications])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-500 ease-in-out px-4",
        scrolled ? "pt-3" : "pt-5 sm:pt-6"
      )}
    >
      {/* ── Main Nav Container ── */}
      <nav
        className={cn(
          "mx-auto max-w-6xl rounded-2xl transition-all duration-500 ease-in-out",
          scrolled
            ? [
                "bg-[#0f1e38]/75 backdrop-blur-2xl",
                "shadow-[0_4px_30px_-4px_rgba(0,0,0,0.5),0_0_0_1px_rgba(159,167,255,0.1),inset_0_1px_0_rgba(255,255,255,0.06)]",
                "py-2 px-4 lg:px-6",
              ].join(" ")
            : [
                "bg-[#192540]/45 backdrop-blur-xl",
                "shadow-[0_0_0_1px_rgba(255,255,255,0.08),inset_0_1px_0_rgba(255,255,255,0.05)]",
                "py-3.5 px-4 lg:px-8",
              ].join(" ")
        )}
      >
        <div className="flex items-center justify-between gap-4">

          {/* ── Brand ── */}
          <Link href="/" className="flex items-center gap-2.5 group shrink-0">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[#9fa7ff] to-[#c180ff] p-px shadow-[0_0_16px_rgba(159,167,255,0.35)]">
              <div className="flex h-full w-full items-center justify-center rounded-[11px] bg-[#0f1930] transition-all duration-300 group-hover:bg-transparent">
                <BookOpen className="h-4.5 w-4.5 text-[#9fa7ff] transition-colors group-hover:text-white" />
              </div>
            </div>
            <span className="text-[1.1rem] font-display font-extrabold tracking-tight gradient-text drop-shadow-[0_0_12px_rgba(159,167,255,0.6)]">
              quickGyan
            </span>
          </Link>

          {/* ── Desktop Links ── */}
          <div className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map(({ label, href }) => (
              <Link
                key={label}
                href={href}
                onClick={() => setActiveLink(label)}
                className={cn(
                  "relative px-3.5 py-2 text-sm font-semibold rounded-xl transition-all duration-200",
                  "text-white/80 hover:text-white hover:bg-white/10",
                  activeLink === label && "text-white bg-white/10"
                )}
              >
                {label}
                {activeLink === label && (
                  <span className="absolute bottom-1 left-1/2 -translate-x-1/2 h-0.5 w-4 rounded-full bg-gradient-to-r from-[#9fa7ff] to-[#c180ff]" />
                )}
              </Link>
            ))}
          </div>

          {/* ── Desktop Actions ── */}
          <div className="hidden items-center gap-2 md:flex shrink-0">
            {user ? (
              <div className="flex items-center gap-2">
                {/* Notifications */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="relative flex h-9 w-9 items-center justify-center rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all duration-200 outline-none">
                      <Bell className="h-4.5 w-4.5" />
                      {unreadCount > 0 && (
                        <span className="absolute right-1.5 top-1.5 flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9fa7ff] opacity-60" />
                          <span className="relative inline-flex h-2 w-2 rounded-full bg-[#9fa7ff] shadow-[0_0_6px_rgba(159,167,255,0.8)]" />
                        </span>
                      )}
                      <span className="sr-only">Notifications</span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-80 p-0 overflow-hidden rounded-2xl border-0 bg-[#0a1428]/95 backdrop-blur-2xl shadow-[0_16px_60px_-8px_rgba(0,0,0,0.9),0_0_0_1px_rgba(159,167,255,0.1)]"
                  >
                    <div className="flex items-center justify-between px-4 py-3.5 border-b border-white/5">
                      <span className="text-sm font-display font-bold text-[#dee5ff]">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#9fa7ff]/15 text-[#9fa7ff] font-bold tracking-wide">
                          {unreadCount} NEW
                        </span>
                      )}
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {notifications.length > 0 ? (
                        notifications.slice(0, 5).map(n => (
                          <div
                            key={n._id}
                            className={cn(
                              "flex flex-col gap-1 px-4 py-3.5 cursor-pointer transition-colors",
                              "hover:bg-white/5",
                              !n.isRead && "bg-[#9fa7ff]/8"
                            )}
                            onClick={() => !n.isRead && handleMarkAsRead(n._id)}
                          >
                            <div className="flex items-start justify-between gap-3">
                              <span className="text-sm font-medium text-[#dee5ff] leading-snug">{n.title}</span>
                              {!n.isRead && (
                                <span className="mt-1 flex-none h-1.5 w-1.5 rounded-full bg-[#9fa7ff]" />
                              )}
                            </div>
                            <p className="text-xs text-[#a3aac4] line-clamp-2 leading-relaxed">{n.message}</p>
                            <span className="text-[10px] text-[#a3aac4]/50 mt-0.5 uppercase tracking-wider">
                              {new Date(n.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className="px-4 py-10 text-center">
                          <Bell className="h-8 w-8 text-[#a3aac4]/20 mx-auto mb-3" />
                          <p className="text-sm text-[#a3aac4]/60">You're all caught up</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 5 && (
                      <Link
                        href="/dashboard"
                        className="flex items-center justify-center gap-1 p-3 text-xs font-medium text-[#9fa7ff] hover:bg-white/5 transition-colors border-t border-white/5"
                      >
                        View all in dashboard
                        <ChevronRight className="h-3 w-3" />
                      </Link>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Profile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button className="flex items-center gap-2.5 rounded-xl px-2.5 py-1.5 hover:bg-white/5 transition-all duration-200 outline-none group">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[#9fa7ff] to-[#c180ff] text-[11px] font-bold text-white shadow-[0_0_12px_rgba(159,167,255,0.4)]">
                        {user.name?.charAt(0)?.toUpperCase() || "U"}
                      </div>
                      <span className="hidden text-sm font-medium text-[#dee5ff] lg:block">
                        {user.name?.split(" ")[0]}
                      </span>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    sideOffset={12}
                    className="w-56 p-2 rounded-2xl border-0 bg-[#0a1428]/95 backdrop-blur-2xl shadow-[0_16px_60px_-8px_rgba(0,0,0,0.9),0_0_0_1px_rgba(159,167,255,0.1)]"
                  >
                    <div className="px-3 py-2.5 mb-2 rounded-xl bg-white/5">
                      <p className="text-sm font-semibold text-[#dee5ff] truncate">{user.name}</p>
                      <p className="text-[11px] text-[#a3aac4]/60 truncate mt-0.5">{user.email}</p>
                    </div>
                    <DropdownMenuItem asChild className="rounded-xl focus:bg-white/8 cursor-pointer text-[#a3aac4] hover:text-[#dee5ff] gap-2.5 px-3 py-2.5">
                      <Link href="/dashboard">
                        <LayoutDashboard className="h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator className="my-1.5 bg-white/5" />
                    <DropdownMenuItem
                      onClick={logout}
                      className="rounded-xl focus:bg-[#ff6e84]/10 cursor-pointer text-[#ff6e84] gap-2.5 px-3 py-2.5"
                    >
                      <LogOut className="h-4 w-4" />
                      Sign out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="px-4 py-2 text-sm font-semibold text-white/80 hover:text-white rounded-xl hover:bg-white/10 transition-all duration-200"
                >
                  Log in
                </Link>
                <Link
                  href="/signup"
                  className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#9fa7ff] to-[#c180ff] px-4 py-2 text-sm font-semibold text-[#060e20] shadow-[0_0_20px_rgba(159,167,255,0.25)] transition-all duration-300 hover:shadow-[0_0_28px_rgba(159,167,255,0.45)] hover:scale-[1.02] active:scale-[0.98]"
                >
                  Get Started
                  <Sparkles className="h-3.5 w-3.5 transition-transform duration-300 group-hover:rotate-12 group-hover:scale-110" />
                </Link>
              </div>
            )}
          </div>

          {/* ── Mobile Toggle ── */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={mobileMenuOpen}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#a3aac4] hover:text-[#dee5ff] hover:bg-white/5 transition-all duration-200 md:hidden"
            onClick={() => setMobileMenuOpen(prev => !prev)}
          >
            {mobileMenuOpen
              ? <X className="h-5 w-5" />
              : <Menu className="h-5 w-5" />
            }
          </button>
        </div>
      </nav>

      {/* ── Mobile Menu ── */}
      <div
        className={cn(
          "mx-auto max-w-6xl mt-2 rounded-2xl overflow-hidden md:hidden",
          "bg-[#0f1e38]/85 backdrop-blur-2xl",
          "shadow-[0_8px_40px_-4px_rgba(0,0,0,0.6),0_0_0_1px_rgba(159,167,255,0.1)]",
          "transition-all duration-300 ease-in-out origin-top",
          mobileMenuOpen
            ? "max-h-screen opacity-100 scale-y-100 pointer-events-auto"
            : "max-h-0 opacity-0 scale-y-95 pointer-events-none"
        )}
      >
        <div className="space-y-1 px-3 py-4">
          {NAV_LINKS.map(({ label, href }) => (
            <Link
              key={label}
              href={href}
              className="flex items-center justify-between rounded-xl px-4 py-3 text-sm font-medium text-[#a3aac4] hover:bg-white/5 hover:text-[#dee5ff] transition-all"
              onClick={() => setMobileMenuOpen(false)}
            >
              {label}
              <ChevronRight className="h-4 w-4 opacity-40" />
            </Link>
          ))}
        </div>

        <div className="px-3 pb-4 border-t border-white/5 pt-4 space-y-3">
          {user ? (
            <>
              <div className="flex items-center justify-between px-4 py-3 rounded-xl bg-white/5">
                <div className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-[#9fa7ff] to-[#c180ff] text-xs font-bold text-white shadow-lg">
                    {user.name?.charAt(0)?.toUpperCase() || "U"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#dee5ff]">{user.name}</p>
                    <p className="text-[10px] text-[#a3aac4]/60">{user.email}</p>
                  </div>
                </div>
                {unreadCount > 0 && (
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#9fa7ff] text-[9px] font-bold text-[#060e20]">
                    {unreadCount}
                  </span>
                )}
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-[#a3aac4] hover:bg-white/5 hover:text-[#dee5ff] transition-all"
              >
                <LayoutDashboard className="h-4 w-4" />
                Dashboard
              </Link>
              <button
                onClick={() => { logout(); setMobileMenuOpen(false) }}
                className="flex items-center gap-3 w-full rounded-xl px-4 py-3 text-sm font-medium text-[#ff6e84] hover:bg-[#ff6e84]/10 transition-all"
              >
                <LogOut className="h-4 w-4" />
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex justify-center w-full rounded-xl border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-medium text-[#dee5ff] hover:bg-white/8 transition-all"
              >
                Log in
              </Link>
              <Link
                href="/signup"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 w-full rounded-xl bg-gradient-to-r from-[#9fa7ff] to-[#c180ff] px-4 py-2.5 text-sm font-semibold text-[#060e20] shadow-[0_0_20px_rgba(159,167,255,0.3)]"
              >
                Get Started
                <Sparkles className="h-3.5 w-3.5" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
