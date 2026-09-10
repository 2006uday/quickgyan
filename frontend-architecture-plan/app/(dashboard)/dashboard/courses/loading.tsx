import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header skeleton */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-2">
          <Skeleton className="h-8 w-56 rounded-md" />
          <Skeleton className="h-4 w-96 rounded-md max-w-full" />
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-md" />
          <Skeleton className="h-9 w-36 rounded-md" />
        </div>
      </div>

      {/* Program pills skeleton */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-3">
        <Skeleton className="h-4 w-32 rounded-md" />
        <div className="flex flex-wrap gap-2 pt-1">
          <Skeleton className="h-12 w-36 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
          <Skeleton className="h-12 w-32 rounded-xl" />
        </div>
      </div>

      {/* Search Bar skeleton */}
      <Skeleton className="h-10 w-full rounded-md" />

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-1">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading curriculum and courses...</span>
      </div>

      {/* Semester Grid Skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 rounded-xl border border-border/70 bg-card p-4 animate-pulse">
            <Skeleton className="h-12 w-12 rounded-lg bg-primary/10 shrink-0" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-5 w-24 rounded-md" />
              <Skeleton className="h-3 w-36 rounded-md" />
            </div>
          </div>
        ))}
      </div>

      {/* Course List Skeleton */}
      <div className="space-y-6">
        {[1, 2].map((n) => (
          <Card key={n} className="animate-pulse border-border/70">
            <CardHeader className="space-y-2">
              <div className="flex items-center justify-between">
                <Skeleton className="h-6 w-48 rounded-md" />
                <Skeleton className="h-5 w-28 rounded-md" />
              </div>
              <Skeleton className="h-4 w-36 rounded-md" />
            </CardHeader>
            <CardContent>
              <div className="divide-y divide-border/60">
                {[1, 2, 3].map((row) => (
                  <div key={row} className="flex items-center gap-4 py-4 -mx-4 px-4 first:pt-0 last:pb-0">
                    <Skeleton className="h-10 w-10 rounded-lg bg-primary/10 shrink-0" />
                    <div className="flex-1 space-y-2">
                      <div className="flex gap-2">
                        <Skeleton className="h-5 w-16 rounded-md" />
                        <Skeleton className="h-5 w-24 rounded-md" />
                      </div>
                      <Skeleton className="h-4 w-3/4 rounded-md" />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
