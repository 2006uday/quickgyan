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

const recentUploads = [
  {
    title: "MCS-041 June 2024 Paper",
    uploader: "Admin",
    date: "2 hours ago",
    status: "published",
  },
  {
    title: "Operating Systems Notes",
    uploader: "Admin",
    date: "5 hours ago",
    status: "published",
  },
  {
    title: "BCS-031 Study Guide",
    uploader: "Admin",
    date: "Yesterday",
    status: "draft",
  },
]

const recentUsers = [
  {
    name: "Rahul Kumar",
    email: "rahul@example.com",
    enrollment: "2350539610",
    joinedAt: "2 hours ago",
  },
  {
    name: "Priya Sharma",
    email: "priya@example.com",
    enrollment: "2350539611",
    joinedAt: "5 hours ago",
  },
  {
    name: "Amit Singh",
    email: "amit@example.com",
    enrollment: "2350539612",
    joinedAt: "Yesterday",
  },
]

export default function AdminDashboard() {
  const { getAdminStats } = useAuth()
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalResources: 526,
    activeCourses: 24,
  })

  useEffect(() => {
    const loadStats = async () => {
      const response = await getAdminStats()
      if (response.success && response.data) {
        setStats(prev => ({
          ...prev,
          totalUsers: response.data.totalUsers,
          activeUsers: response.data.activeUsers
        }))
      }
    }
    loadStats()
  }, [])

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
              {recentUploads.map((upload, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="rounded bg-primary/10 p-2">
                      <FileText className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{upload.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {upload.uploader} • {upload.date}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={upload.status === "published" ? "default" : "secondary"}
                  >
                    {upload.status}
                  </Badge>
                </div>
              ))}
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
              {recentUsers.map((user, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between gap-4 rounded-lg p-2 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-medium text-primary">
                      {user.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {user.enrollment}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-muted-foreground">{user.joinedAt}</span>
                </div>
              ))}
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
            <Button variant="outline" className="h-auto w-full flex-col gap-2 p-4 bg-transparent">
              <AlertCircle className="h-5 w-5 text-primary" />
              <span>Send Announcement</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
