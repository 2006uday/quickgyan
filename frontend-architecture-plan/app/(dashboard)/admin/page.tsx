// admin dashboard page
"use client"

import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import {
  Users,
  FileText,
  GraduationCap,
  TrendingUp,
  ArrowRight,
  Activity,
  Upload,
  AlertCircle,
} from "lucide-react"


export default function AdminDashboard() {
  const { getAdminStats, getAllUsers, getResources, getCourses, addAnnouncement } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalResources: 0,
    activeCourses: 0,
  })
  const [recentUploads, setRecentUploads] = useState<any[]>([])
  const [recentUsers, setRecentUsers] = useState<any[]>([])
  const [isAnnouncementOpen, setIsAnnouncementOpen] = useState(false)
  const [announcementTitle, setAnnouncementTitle] = useState("")
  const [announcementContent, setAnnouncementContent] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    const loadStats = async () => {
      const statsRes = await getAdminStats()
      if (statsRes.success && statsRes.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: statsRes.data.totalUsers,
          activeUsers: statsRes.data.activeUsers
        }))
      }

      const usersRes = await getAllUsers()
      if (usersRes.success && usersRes.data) {
        // Sort by createdAt desc and take top 5
        const sortedUsers = [...usersRes.data]
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
          .slice(0, 5)
        setRecentUsers(sortedUsers)
      }

      const resourcesRes = await getResources()
      if (resourcesRes.success && resourcesRes.data?.resources) {
        setRecentUploads(resourcesRes.data.resources.slice(0, 5))
        setStats(prev => ({
          ...prev,
          totalResources: resourcesRes.data.resources.length
        }))
      }

      const coursesRes = await getCourses()
      if (coursesRes.success && coursesRes.data) {
        setStats(prev => ({
          ...prev,
          activeCourses: coursesRes.data.length
        }))
      }
    }
    loadStats()
  }, [])

  const handleSendAnnouncement = async () => {
    if (!announcementTitle || !announcementContent) {
      toast.error("Title and message are required")
      return
    }

    try {
      setIsSubmitting(true)
      const res = await addAnnouncement(announcementTitle, announcementContent)
      if (res.success) {
        toast.success("Announcement broadcasted successfully")
        setAnnouncementTitle("")
        setAnnouncementContent("")
        setIsAnnouncementOpen(false)
      } else {
        toast.error(res.error || "Failed to send announcement")
      }
    } catch (error) {
      toast.error("An error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  const statCards = [
    {
      title: "Total Users",
      value: stats.totalUsers.toLocaleString(),
      change: "+12%",
      icon: Users,
      color: "bg-primary/10 text-primary",
    },
    {
      title: "Currently Active",
      value: stats.activeUsers.toLocaleString(),
      change: "Live",
      icon: Activity,
      color: "bg-green-100 text-green-700",
    },
    {
      title: "Active Courses",
      value: stats.activeCourses.toString(),
      change: "+2",
      icon: GraduationCap,
      color: "bg-blue-100 text-blue-700",
    },
    {
      title: "Total Resources",
      value: stats.totalResources.toString(),
      change: "+8%",
      icon: FileText,
      color: "bg-accent/20 text-accent-foreground",
    },
  ]

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            Manage courses, resources, and users
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/admin/courses">Manage Courses</Link>
          </Button>
          <Button asChild>
            <Link href="/admin/resources">
              <Upload className="mr-2 h-4 w-4" />
              Upload Resource
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {statCards.map((stat) => (
          <Card key={stat.title}>
            <CardContent className="flex items-center gap-4 p-4">
              <div className={`rounded-lg p-3 ${stat.color}`}>
                <stat.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm text-muted-foreground">{stat.title}</p>
                <div className="flex items-baseline gap-2">
                  <p className="text-2xl font-bold">{stat.value}</p>
                  <span className="text-xs text-green-600">{stat.change}</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* System Status */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Activity className="h-5 w-5 text-primary" />
            <CardTitle className="text-lg">System Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">API Server: Online</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">Database: Connected</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">AI Service: Active</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-green-500" />
              <span className="text-sm">File Storage: 45% used</span>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Uploads */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Uploads</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/resources">View all</Link>
              </Button>
            </div>
            <CardDescription>Latest resource uploads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUploads.length > 0 ? (
                recentUploads.map((upload, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded bg-primary/10 p-2">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">{upload.resourceTitle}</p>
                        <p className="text-xs text-muted-foreground">
                          {upload.course} • {new Date(upload.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">Published</Badge>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent uploads</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recent Users */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg">Recent Registrations</CardTitle>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/admin/users">View all</Link>
              </Button>
            </div>
            <CardDescription>Newly registered users</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentUsers.length > 0 ? (
                recentUsers.map((user, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                        {(user.username || user.name || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-medium">{user.username || user.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {user.enrollment_no || user.enrollmentNo || "N/A"}
                        </p>
                      </div>
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground py-4 text-center">No recent registrations</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Link href="/admin/resources">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                <Upload className="h-5 w-5 text-primary" />
                <span>Upload Resource</span>
              </Button>
            </Link>
            <Link href="/admin/courses">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                <GraduationCap className="h-5 w-5 text-primary" />
                <span>Add Course</span>
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
                <Users className="h-5 w-5 text-primary" />
                <span>Manage Users</span>
              </Button>
            </Link>
            <Button 
              variant="outline" 
              className="h-auto w-full flex-col gap-2 p-4 bg-transparent"
              onClick={() => setIsAnnouncementOpen(true)}
            >
              <AlertCircle className="h-5 w-5 text-primary" />
              <span>Send Announcement</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Announcement Dialog */}
      <Dialog open={isAnnouncementOpen} onOpenChange={setIsAnnouncementOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Broadcast Announcement</DialogTitle>
            <DialogDescription>
              This message will be visible to all students on their dashboard.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                placeholder="Important: Exam Dates Updated"
                value={announcementTitle}
                onChange={(e) => setAnnouncementTitle(e.target.value)}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                placeholder="Write your announcement details here..."
                className="min-h-[100px]"
                value={announcementContent}
                onChange={(e) => setAnnouncementContent(e.target.value)}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAnnouncementOpen(false)}>Cancel</Button>
            <Button onClick={handleSendAnnouncement} disabled={isSubmitting}>
              {isSubmitting ? "Sending..." : "Send Announcement"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
