// user dashboard page
"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
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
import { useEffect, useState } from "react"

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
    href: "/dashboard/resources?type=paper",
    color: "bg-green-100 text-green-700",
  },
]

export default function DashboardPage() {
  const { user, checkUser, getResources, getAnnouncements, getNotifications } = useAuth()
  const [recentResources, setRecentResources] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState({
    books: 0,
    notes: 0,
    papers: 0
  })

  useEffect(() => {
    checkUser();
    const fetchResourcesData = async () => {
      const response = await getResources();
      if (response.success && response.data?.resources) {
        const resources = response.data.resources || [];
        
        // Calculate counts
        const books = resources.filter((r: any) => r.resourceType === 'book').length;
        const notes = resources.filter((r: any) => r.resourceType === 'notes').length;
        const papers = resources.filter((r: any) => r.resourceType === 'paper').length;
        
        setStats({ books, notes, papers });

        // Sort by createdAt descending and take top 4 for recent section
        const sorted = [...resources].sort((a: any, b: any) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        ).slice(0, 4);
        setRecentResources(sorted);
      }
    };

    const fetchAnnouncements = async () => {
      const response = await getAnnouncements();
      if (response.success && response.data) {
        setAnnouncements(response.data.slice(0, 5));
      }
    };

    const fetchNotifications = async () => {
      const response = await getNotifications();
      if (response.success && response.data?.notifications) {
        setNotifications(response.data.notifications.slice(0, 10));
      }
    };

    fetchResourcesData();
    fetchAnnouncements();
    fetchNotifications();
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

      {/* Resource Stats Card */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              <CardTitle className="text-lg">Resource Library Overview</CardTitle>
            </div>
            <span className="text-sm font-medium text-muted-foreground">BCA Program Resources</span>
          </div>
          <CardDescription>Available study materials for your semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-3xl font-bold text-primary">{stats.books}</p>
              <p className="text-sm font-medium">Textbooks</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-3xl font-bold text-primary">{stats.notes}</p>
              <p className="text-sm font-medium">Study Notes</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-3xl font-bold text-primary">{stats.papers}</p>
              <p className="text-sm font-medium">Question Papers</p>
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
              {recentResources.length > 0 ? (
                recentResources.map((resource, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="rounded bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium">{resource.resourceTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="capitalize">{resource.resourceType}</span> • Semester {resource.semester} • {resource.course}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-6 text-muted-foreground">
                  No recent resources found.
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Announcements & Notifications Section */}
        <Card className="overflow-hidden">
          <Tabs defaultValue="announcements" className="w-full">
            <CardHeader className="p-0">
              <div className="flex items-center justify-between px-6 py-4 border-b">
                <TabsList className="grid w-[300px] grid-cols-2">
                  <TabsTrigger value="announcements" className="flex items-center gap-2">
                    <Bell className="h-4 w-4" />
                    Announcements
                  </TabsTrigger>
                  <TabsTrigger value="notifications" className="flex items-center gap-2">
                    <Clock className="h-4 w-4" />
                    Notifications
                  </TabsTrigger>
                </TabsList>
              </div>
            </CardHeader>

            <CardContent className="pt-6">
              <TabsContent value="announcements" className="m-0 space-y-4">
                {announcements.length > 0 ? (
                  announcements.map((announcement, i) => (
                    <div
                      key={i}
                      className="rounded-lg border border-border p-3 hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">{announcement.title}</h4>
                        <span className="text-xs text-muted-foreground">
                          {new Date(announcement.date).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground line-clamp-2">{announcement.content}</p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Bell className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No announcements at this time.</p>
                  </div>
                )}
              </TabsContent>

              <TabsContent value="notifications" className="m-0 space-y-4">
                {notifications.length > 0 ? (
                  notifications.map((notification, i) => (
                    <div
                      key={i}
                      className={`flex flex-col gap-1 p-3 rounded-lg border border-border hover:bg-muted/50 transition-colors ${!notification.isRead ? 'bg-primary/5' : ''}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">{notification.title}</span>
                        <span className="text-[10px] text-muted-foreground">
                          {new Date(notification.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">
                        {notification.message}
                      </p>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-muted-foreground">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-20" />
                    <p className="text-sm">No recent notifications.</p>
                  </div>
                )}
              </TabsContent>
            </CardContent>
          </Tabs>
        </Card>
      </div>
    </div>
  )
}
