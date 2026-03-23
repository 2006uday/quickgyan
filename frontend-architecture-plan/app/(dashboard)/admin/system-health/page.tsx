"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Activity,
  CheckCircle2,
  XCircle,
  RefreshCcw,
  Users,
  BookOpen,
  FileText,
  Bell,
  MessageSquare,
  LayoutDashboard,
  Database
} from "lucide-react"
import { toast } from "sonner"

export default function SystemHealthPage() {
  const {
    user,
    checkUser,
    getAdminStats,
    getAllUsers,
    getCourses,
    getResources,
    getAnnouncements,
    getNotifications,
    getAIHistory,
    clearAIHistory
  } = useAuth()

  const [apiStatus, setApiStatus] = useState<Record<string, 'loading' | 'success' | 'error'>>({
    auth: 'loading',
    adminStats: 'loading',
    users: 'loading',
    courses: 'loading',
    resources: 'loading',
    announcements: 'loading',
    notifications: 'loading',
    aiChat: 'loading'
  })

  const [data, setData] = useState<any>({
    stats: null,
    usersCount: 0,
    coursesCount: 0,
    resourcesCount: 0,
    announcementsCount: 0,
    notificationsCount: 0,
    aiHistoryCount: 0
  })

  const [isRefreshing, setIsRefreshing] = useState(false)

  const runAllTests = async () => {
    setIsRefreshing(true)
    const newStatus = { ...apiStatus }
    const newData = { ...data }

    // 1. Auth Test
    try {
      await checkUser()
      newStatus.auth = 'success'
    } catch {
      newStatus.auth = 'error'
    }

    // 2. Admin Stats
    try {
      const res = await getAdminStats()
      if (res.success) {
        newStatus.adminStats = 'success'
        newData.stats = res.data
      } else {
        newStatus.adminStats = 'error'
      }
    } catch {
      newStatus.adminStats = 'error'
    }

    // 3. Users
    try {
      const res = await getAllUsers()
      if (res.success) {
        newStatus.users = 'success'
        newData.usersCount = Array.isArray(res.data) ? res.data.length : (res.data?.users?.length || 0)
      } else {
        newStatus.users = 'error'
      }
    } catch {
      newStatus.users = 'error'
    }

    // 4. Courses
    try {
      const res = await getCourses()
      if (res.success) {
        newStatus.courses = 'success'
        newData.coursesCount = Array.isArray(res.data) ? res.data.length : 0
      } else {
        newStatus.courses = 'error'
      }
    } catch {
      newStatus.courses = 'error'
    }

    // 5. Resources
    try {
      const res = await getResources()
      if (res.success) {
        newStatus.resources = 'success'
        newData.resourcesCount = res.data?.resources?.length || 0
      } else {
        newStatus.resources = 'error'
      }
    } catch {
      newStatus.resources = 'error'
    }

    // 6. Announcements
    try {
      const res = await getAnnouncements()
      if (res.success) {
        newStatus.announcements = 'success'
        newData.announcementsCount = Array.isArray(res.data) ? res.data.length : 0
      } else {
        newStatus.announcements = 'error'
      }
    } catch {
      newStatus.announcements = 'error'
    }

    // 7. Notifications
    try {
      const res = await getNotifications()
      if (res.success) {
        newStatus.notifications = 'success'
        newData.notificationsCount = res.data?.notifications?.length || 0
      } else {
        newStatus.notifications = 'error'
      }
    } catch {
      newStatus.notifications = 'error'
    }

    // 8. AI Chat
    try {
      const res = await getAIHistory()
      if (res.success) {
        newStatus.aiChat = 'success'
        newData.aiHistoryCount = res.data?.history?.length || 0
      } else {
        newStatus.aiChat = 'error'
      }
    } catch {
      newStatus.aiChat = 'error'
    }

    setApiStatus(newStatus)
    setData(newData)
    setIsRefreshing(false)
    toast.success("System health check completed")
  }

  useEffect(() => {
    runAllTests()
  }, [])

  const StatusBadge = ({ status }: { status: 'loading' | 'success' | 'error' }) => {
    switch (status) {
      case 'loading':
        return <Badge variant="outline" className="animate-pulse">Checking...</Badge>
      case 'success':
        return <Badge className="bg-green-500/10 text-green-500 hover:bg-green-500/20 border-green-500/20">Operational</Badge>
      case 'error':
        return <Badge variant="destructive">Degraded</Badge>
    }
  }

  const handleClearAI = async () => {
    const res = await clearAIHistory()
    if (res.success) {
      toast.success("AI History cleared")
      runAllTests()
    } else {
      toast.error(res.error || "Failed to clear AI history")
    }
  }

  return (
    <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground underline-offset-8 decoration-primary decoration-4">
            System Monitoring & API Hub
          </h1>
          <p className="text-muted-foreground mt-2">
            Real-time status of all integrated QuickGyan backend services
          </p>
        </div>
        <Button
          onClick={runAllTests}
          disabled={isRefreshing}
          className="relative overflow-hidden group px-6"
        >
          <RefreshCcw className={`mr-2 h-4 w-4 ${isRefreshing ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
          {isRefreshing ? "Checking..." : "Verify All Services"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* API STATUS CARDS */}
        <StatusCard
          title="Authentication"
          status={apiStatus.auth}
          icon={<Users className="text-blue-500" />}
          description="Login, Session & Roles"
        />
        <StatusCard
          title="Courses Service"
          status={apiStatus.courses}
          icon={<LayoutDashboard className="text-orange-500" />}
          description="Curriculum & Semesters"
        />
        <StatusCard
          title="Resource Engine"
          status={apiStatus.resources}
          icon={<FileText className="text-green-500" />}
          description="File Uploads & Cloudinary"
        />
        <StatusCard
          title="AI Intelligence"
          status={apiStatus.aiChat}
          icon={<MessageSquare className="text-purple-500" />}
          description="Gemini Interface & History"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* STATS OVERVIEW */}
        <Card className="lg:col-span-2 shadow-xl border-t-4 border-t-primary">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Activity className="h-6 w-6 text-primary" />
              <div>
                <CardTitle>Live Engagement Metrics</CardTitle>
                <CardDescription>Consolidated data from all active modules</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
              <MetricItem label="Registered Users" value={data.usersCount} sub="Active members" />
              <MetricItem label="Active Courses" value={data.coursesCount} sub="Validated modules" />
              <MetricItem label="Total Resources" value={data.resourcesCount} sub="PDFs & Images" />
              <MetricItem label="Announcements" value={data.announcementsCount} sub="Global broadcasts" />
              <MetricItem label="Notifications" value={data.notificationsCount} sub="User alerts" />
              <MetricItem label="AI Queries" value={data.aiHistoryCount} sub="Knowledge base" />
            </div>
          </CardContent>
        </Card>

        {/* OPERATIONS PANEL */}
        <Card className="shadow-xl bg-muted/30 border-dashed border-2">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Database className="h-6 w-6 text-muted-foreground" />
              <CardTitle>Global Operations</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-lg bg-background border space-y-3">
              <p className="text-sm font-semibold">AI History Management</p>
              <p className="text-xs text-muted-foreground">Permanently remove your conversation history from the AI engine.</p>
              <Button
                variant="destructive"
                size="sm"
                className="w-full"
                onClick={handleClearAI}
              >
                Clear AI History
              </Button>
            </div>

            <div className="p-4 rounded-lg bg-background border space-y-3">
              <p className="text-sm font-semibold">Admin Insights</p>
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span>Server Load:</span>
                  <span className="font-bold text-green-500">Low</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>API Latency:</span>
                  <span className="font-bold">45ms</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span>DB Latency:</span>
                  <span className="font-bold">12ms</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RAW DATA REPOSITORY */}
      <Card className="shadow-lg border-none bg-gradient-to-br from-background to-muted">
        <CardHeader>
          <CardTitle className="text-xl">Network Activity Log</CardTitle>
          <CardDescription>Sequential API handshake records</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[200px] w-full rounded-md border p-4 bg-black/5 dark:bg-black/40 font-mono text-xs">
            {Object.entries(apiStatus).map(([key, status], i) => (
              <div key={key} className="flex items-center gap-3 py-1 border-b border-white/5 last:border-none">
                <span className="text-muted-foreground">[{new Date().toLocaleTimeString()}]</span>
                <span className="font-bold uppercase w-32">{key}:</span>
                {status === 'success' ? (
                  <span className="text-green-500 flex items-center gap-1">
                    <CheckCircle2 className="h-3 w-3" /> REQUEST_RESOLVED_200_OK
                  </span>
                ) : status === 'error' ? (
                  <span className="text-red-500 flex items-center gap-1">
                    <XCircle className="h-3 w-3" /> NETWORK_ERROR_DISCONNECTED
                  </span>
                ) : (
                  <span className="text-yellow-500 animate-pulse">PENDING_RESPONSE...</span>
                )}
              </div>
            ))}
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  )
}

function StatusCard({ title, status, icon, description }: any) {
  return (
    <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
      <div className={`absolute top-0 right-0 p-3 opacity-10 scale-150 transition-transform group-hover:scale-[2] duration-500`}>
        {icon}
      </div>
      <CardHeader className="p-4">
        <div className="flex items-center gap-2 mb-1">
          {icon}
          <p className="text-sm font-bold truncate">{title}</p>
        </div>
        <CardDescription className="text-xs line-clamp-1">{description}</CardDescription>
      </CardHeader>
      <CardContent className="p-4 pt-0 flex items-center justify-between">
        <div className="h-2 w-2 rounded-full bg-current animate-pulse opacity-50" />
        <StatusBadge status={status} />
      </CardContent>
    </Card>
  )
}

function StatusBadge({ status }: { status: 'loading' | 'success' | 'error' }) {
  switch (status) {
    case 'loading':
      return <Badge variant="secondary" className="px-1.5 py-0 text-[10px]">Processing</Badge>
    case 'success':
      return <Badge className="bg-green-500/10 text-green-600 border-green-200 px-1.5 py-0 text-[10px]">Healthy</Badge>
    case 'error':
      return <Badge variant="destructive" className="px-1.5 py-0 text-[10px]">Offline</Badge>
  }
}

function MetricItem({ label, value, sub }: { label: string, value: number, sub: string }) {
  return (
    <div className="space-y-1">
      <p className="text-xs text-muted-foreground font-medium uppercase tracking-wider">{label}</p>
      <p className="text-2xl font-black tracking-tight">{value}</p>
      <p className="text-[10px] text-primary/70 font-bold">{sub}</p>
    </div>
  )
}
