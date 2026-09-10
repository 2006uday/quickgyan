import { Card, CardContent, CardHeader } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header skeleton */}
      <div className="space-y-2">
        <Skeleton className="h-8 w-48 rounded-md" />
        <Skeleton className="h-4 w-96 rounded-md max-w-full" />
      </div>

      {/* Filter bar skeleton */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-48 rounded-md" />
        <Skeleton className="h-10 w-36 rounded-md" />
        <Skeleton className="h-10 w-28 rounded-md" />
      </div>

      {/* Status indicator */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground animate-pulse py-1">
        <Loader2 className="h-4 w-4 animate-spin text-primary" />
        <span>Loading library resources...</span>
      </div>

      {/* Grid of Skeleton Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, idx) => (
          <Card key={idx} className="flex flex-col border-border/70 overflow-hidden bg-card/60 animate-pulse">
            <CardHeader className="pb-3 space-y-3">
              <div className="flex items-start justify-between gap-2">
                <Skeleton className="h-10 w-10 rounded-lg bg-primary/10" />
                <div className="flex items-center gap-1.5">
                  <Skeleton className="h-5 w-14 rounded-md bg-muted/80" />
                  <Skeleton className="h-5 w-16 rounded-md bg-muted/80" />
                </div>
              </div>
              <Skeleton className="h-5 w-4/5 rounded-md bg-muted/80 mt-2" />
              <Skeleton className="h-4 w-1/2 rounded-md bg-muted/60" />
            </CardHeader>
            <CardContent className="mt-auto pt-0 space-y-4">
              <div className="flex items-center gap-3">
                <Skeleton className="h-3.5 w-24 rounded-md bg-muted/60" />
                <Skeleton className="h-3.5 w-20 rounded-md bg-muted/60" />
              </div>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 flex-1 rounded-md bg-muted/70" />
                <Skeleton className="h-8 flex-1 rounded-md bg-muted/70" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
