"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import {
  BookOpen,
  Brain,
  FileText,
  ArrowRight,
  Clock,
  TrendingUp,
  Calendar,
  Bell,
} from "lucide-react"
import { useEffect } from "react"



const quickAccessCards = [
  {
    title: "Resume Study",
    description: "Continue where you left off",
    icon: BookOpen,
    href: "/dashboard/resources",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Ask AI",
    description: "Get instant doubt solving",
    icon: Brain,
    href: "/dashboard/ai-chat",
    color: "bg-accent/20 text-accent-foreground",
  },
  {
    title: "Sample Papers",
    description: "Practice previous years",
    icon: FileText,
    href: "/dashboard/resources?type=papers",
    color: "bg-green-100 text-green-700",
  },
]

const recentResources = [
  {
    title: "Introduction to C Programming",
    type: "Book",
    semester: "Semester 1",
    lastAccessed: "2 hours ago",
  },
  {
    title: "BCS-011 June 2023 Question Paper",
    type: "Sample Paper",
    semester: "Semester 1",
    lastAccessed: "Yesterday",
  },
  {
    title: "Data Structures Notes",
    type: "Notes",
    semester: "Semester 2",
    lastAccessed: "3 days ago",
  },
]

const announcements = [
  {
    title: "New Exam Dates Released",
    date: "Jan 25, 2026",
    content: "TEE December 2025 results have been announced.",
  },
  {
    title: "Semester 4 Notes Added",
    date: "Jan 20, 2026",
    content: "Complete notes for MCS-041 and MCS-042 are now available.",
  },
]

export default function DashboardPage() {
  const { user, checkUser } = useAuth()

  useEffect(() => {
    checkUser();
  }, [])

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Welcome Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Enrollment: {user?.enrollmentNo}
          </p>
        </div>
        <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-4 py-2">
          <Calendar className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>
      </div>

      {/* Progress Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Current Semester Progress</CardTitle>
            </div>
            <span className="text-2xl font-bold text-primary">65%</span>
          </div>
          <CardDescription>Semester 3 - BCA Program</CardDescription>
        </CardHeader>
        <CardContent>
          <Progress value={65} className="h-2" />
          <div className="mt-4 grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold">12</p>
              <p className="text-xs text-muted-foreground">Books Read</p>
            </div>
            <div>
              <p className="text-2xl font-bold">8</p>
              <p className="text-xs text-muted-foreground">Papers Solved</p>
            </div>
            <div>
              <p className="text-2xl font-bold">24</p>
              <p className="text-xs text-muted-foreground">AI Questions</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {quickAccessCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className="transition-all hover:border-primary/30 hover:shadow-md">
              <CardContent className="flex items-center gap-4 p-4">
                <div className={`rounded-lg p-3 ${card.color}`}>
                  <card.icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium">{card.title}</h3>
                  <p className="text-sm text-muted-foreground">{card.description}</p>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground" />
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Resources</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/dashboard/resources">View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentResources.map((resource, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="rounded bg-primary/10 p-2">
                    <FileText className="h-4 w-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate font-medium">{resource.title}</p>
                    <p className="text-xs text-muted-foreground">
                      {resource.type} • {resource.semester}
                    </p>
                  </div>
                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    {resource.lastAccessed}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Announcements */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                <CardTitle className="text-lg">Announcements</CardTitle>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {announcements.map((announcement, i) => (
                <div
                  key={i}
                  className="rounded-lg border border-border p-3"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="font-medium">{announcement.title}</h4>
                    <span className="text-xs text-muted-foreground">{announcement.date}</span>
                  </div>
                  <p className="mt-1 text-sm text-muted-foreground">{announcement.content}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
