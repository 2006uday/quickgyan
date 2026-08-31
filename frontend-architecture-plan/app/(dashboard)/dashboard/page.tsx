// user dashboard page
"use client"

import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
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
  Layers,
  GraduationCap,
} from "lucide-react"
import { useEffect, useState, useMemo } from "react"

const quickAccessCards = [
  {
    title: "Resume Study",
    description: "Continue where you left off",
    icon: BookOpen,
    href: "/dashboard/resources",
    color: "bg-primary/10 text-primary",
  },
  {
    title: "Course Navigator",
    description: "Browse semester curriculum",
    icon: GraduationCap,
    href: "/dashboard/courses",
    color: "bg-blue-100 text-blue-700",
  },
  {
    title: "Ask AI",
    description: "Get instant doubt solving",
    icon: Brain,
    href: "/dashboard/ai-chat",
    color: "bg-accent/20 text-accent-foreground",
  },
]

export default function DashboardPage() {
  const { user, checkUser, getResources, getAnnouncements, getNotifications, programs, getPrograms, selectedProgram, setSelectedProgram } = useAuth()
  const [allResources, setAllResources] = useState<any[]>([])
  const [announcements, setAnnouncements] = useState<any[]>([])
  const [notifications, setNotifications] = useState<any[]>([])

  useEffect(() => {
    checkUser();
    getPrograms();

    const fetchResourcesData = async () => {
      const response = await getResources();
      if (response.success && response.data?.resources) {
        setAllResources(response.data.resources || []);
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

  // Find active program object
  const currentProgramObj = useMemo(() => {
    return programs.find(p => p.code.toUpperCase() === (selectedProgram || "BCA").toUpperCase()) || {
      code: selectedProgram || "BCA",
      name: selectedProgram === "BCA" ? "Bachelor of Computer Applications" : `${selectedProgram} Program`,
      totalSemesters: 6
    }
  }, [programs, selectedProgram])

  // Filter resources by selected program
  const programResources = useMemo(() => {
    return allResources.filter(r => (r.program || "BCA").toUpperCase() === (selectedProgram || "BCA").toUpperCase())
  }, [allResources, selectedProgram])

  const stats = useMemo(() => {
    const books = programResources.filter((r: any) => r.resourceType === 'book').length;
    const notes = programResources.filter((r: any) => r.resourceType === 'notes').length;
    const papers = programResources.filter((r: any) => r.resourceType === 'paper').length;
    return { books, notes, papers };
  }, [programResources])

  const recentResources = useMemo(() => {
    return [...programResources].sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    ).slice(0, 4);
  }, [programResources])

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Welcome Section & Program Switcher */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            Welcome back, {user?.name?.split(" ")[0]}!
          </h1>
          <p className="text-muted-foreground">
            Enrollment: {user?.enrollmentNo || "Student"} • Current Program: <span className="font-semibold text-foreground">{currentProgramObj.code}</span>
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Program Switcher */}
          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-1.5 shadow-sm">
            <Layers className="h-4 w-4 text-primary" />
            <span className="text-xs font-medium text-muted-foreground">Program:</span>
            <Select value={selectedProgram} onValueChange={setSelectedProgram}>
              <SelectTrigger className="h-7 w-[130px] border-none bg-transparent p-0 text-sm font-semibold shadow-none focus:ring-0">
                <SelectValue placeholder="Select Program" />
              </SelectTrigger>
              <SelectContent>
                {programs.map((prog) => (
                  <SelectItem key={prog.code} value={prog.code}>
                    {prog.code} ({prog.totalSemesters} Sem)
                  </SelectItem>
                ))}
                {programs.length === 0 && (
                  <SelectItem value="BCA">BCA (6 Sem)</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 shadow-sm">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <span className="text-xs">
              {new Date().toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Program Header Banner */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 via-card to-background">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="rounded-md bg-primary/10 p-2 text-primary">
                <GraduationCap className="h-5 w-5" />
              </div>
              <div>
                <CardTitle className="text-lg">{currentProgramObj.name}</CardTitle>
                <CardDescription>
                  Curriculum structured across {currentProgramObj.totalSemesters} semesters
                </CardDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="font-mono text-xs">
                {currentProgramObj.code}
              </Badge>
              <Badge variant="outline" className="text-xs">
                {programResources.length} Total Materials
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="rounded-lg bg-card/60 border border-border/50 p-3 shadow-xs">
              <p className="text-2xl font-bold text-primary">{stats.books}</p>
              <p className="text-xs font-medium text-muted-foreground">Textbooks</p>
            </div>
            <div className="rounded-lg bg-card/60 border border-border/50 p-3 shadow-xs">
              <p className="text-2xl font-bold text-primary">{stats.notes}</p>
              <p className="text-xs font-medium text-muted-foreground">Study Notes</p>
            </div>
            <div className="rounded-lg bg-card/60 border border-border/50 p-3 shadow-xs">
              <p className="text-2xl font-bold text-primary">{stats.papers}</p>
              <p className="text-xs font-medium text-muted-foreground">Question Papers</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Cards */}
      {user?.role !== 'admin' && (
        <div className="grid gap-4 sm:grid-cols-3">
          {quickAccessCards.map((card) => (
            <Link key={card.title} href={card.href}>
              <Card className="transition-all hover:border-primary/30 hover:shadow-md h-full">
                <CardContent className="flex items-center gap-4 p-4">
                  <div className={`rounded-lg p-3 ${card.color}`}>
                    <card.icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium">{card.title}</h3>
                    <p className="text-sm text-muted-foreground truncate">{card.description}</p>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground shrink-0" />
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Resources ({currentProgramObj.code})</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href={`/dashboard/resources?program=${currentProgramObj.code}`}>View all</Link>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentResources.length > 0 ? (
                recentResources.map((resource, i) => (
                  <div
                    key={i}
                    className="flex items-start gap-3 rounded-lg p-2.5 transition-colors hover:bg-muted/50 border border-border/40"
                  >
                    <div className="rounded bg-primary/10 p-2 text-primary">
                      <FileText className="h-4 w-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="truncate font-medium text-sm">{resource.resourceTitle}</p>
                      <p className="text-xs text-muted-foreground">
                        <span className="capitalize">{resource.resourceType}</span> • Semester {resource.semester} • <span className="font-mono">{resource.course}</span>
                      </p>
                    </div>
                    <div className="flex items-center gap-1 text-[11px] text-muted-foreground whitespace-nowrap">
                      <Clock className="h-3 w-3" />
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <FileText className="h-8 w-8 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">No resources uploaded for {currentProgramObj.code} yet.</p>
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
                          {new Date(announcement.date || announcement.createdAt).toLocaleDateString()}
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
