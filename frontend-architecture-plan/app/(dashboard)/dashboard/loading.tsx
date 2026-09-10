import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Program Selector Pills Skeleton */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <Skeleton className="h-4 w-32 rounded-md" />
          <Skeleton className="h-3 w-40 rounded-md" />
        </div>
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Program Header & Stats Card Skeleton */}
      <Card className="border-border/80">
        <CardHeader className="pb-3">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="flex items-center gap-2">
              <Skeleton className="h-9 w-9 rounded-md bg-primary/10" />
              <div className="space-y-2">
                <Skeleton className="h-5 w-48 rounded-md" />
                <Skeleton className="h-4 w-64 rounded-md" />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-6 w-20 rounded-md" />
              <Skeleton className="h-6 w-28 rounded-md" />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4 text-center">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg bg-card/60 border border-border/50 p-3 space-y-2">
                <Skeleton className="h-7 w-12 mx-auto rounded-md" />
                <Skeleton className="h-3 w-16 mx-auto rounded-md" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Access Skeleton Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="h-full">
            <CardContent className="flex items-center gap-4 p-4">
              <Skeleton className="h-11 w-11 rounded-lg shrink-0" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-28 rounded-md" />
                <Skeleton className="h-3 w-40 rounded-md" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 2-Column Grid */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Resources Skeleton */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <Skeleton className="h-5 w-40 rounded-md" />
              <Skeleton className="h-4 w-16 rounded-md" />
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3 rounded-lg p-2.5 border border-border/40 animate-pulse">
                <Skeleton className="h-9 w-9 rounded-lg bg-primary/10 shrink-0" />
                <div className="flex-1 space-y-2 min-w-0">
                  <Skeleton className="h-4 w-3/4 rounded-md" />
                  <Skeleton className="h-3 w-1/2 rounded-md" />
                </div>
                <Skeleton className="h-3 w-16 rounded-md shrink-0" />
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Announcements & Notifications Skeleton */}
        <Card>
          <CardHeader>
            <Skeleton className="h-8 w-60 rounded-md" />
          </CardHeader>
          <CardContent className="space-y-3 pt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="p-3 rounded-lg border border-border space-y-2 animate-pulse">
                <div className="flex items-center justify-between">
                  <Skeleton className="h-4 w-40 rounded-md" />
                  <Skeleton className="h-3 w-16 rounded-md" />
                </div>
                <Skeleton className="h-3 w-full rounded-md" />
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
