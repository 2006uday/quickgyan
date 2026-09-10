import { Card } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Loader2 } from "lucide-react"

export default function Loading() {
  return (
    <div className="flex h-[calc(100vh-10rem)] md:h-[calc(100vh-8rem)] flex-col pb-4 lg:pb-0 space-y-4">
      <div className="flex items-center justify-between pb-2">
        <div className="space-y-2">
          <Skeleton className="h-7 w-40 rounded-md" />
          <Skeleton className="h-4 w-72 rounded-md" />
        </div>
      </div>

      <Card className="flex flex-1 flex-col items-center justify-center border-border/50 shadow-sm p-6">
        <Loader2 className="h-8 w-8 animate-spin text-primary mb-3" />
        <p className="text-sm text-muted-foreground animate-pulse">Initializing AI Doubt Lab...</p>
      </Card>
    </div>
  )
}
