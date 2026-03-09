"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { resources, semesters } from "@/lib/mock-data"
import {
  Search,
  FileText,
  BookOpen,
  StickyNote,
  Download,
  Eye,
  Filter,
  Calendar,
  HardDrive,
  X,
} from "lucide-react"

const resourceTypeIcons = {
  book: BookOpen,
  notes: StickyNote,
  paper: FileText,
}

const resourceTypeLabels = {
  book: "Textbook",
  notes: "Notes",
  paper: "Question Paper",
}

export default function ResourcesPage() {
  const searchParams = useSearchParams()
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState(
    searchParams.get("semester") || "all"
  )
  const [selectedTypes, setSelectedTypes] = useState<string[]>([])
  const [previewResource, setPreviewResource] = useState<string | null>(null)
  const [showFilters, setShowFilters] = useState(false)

  const filteredResources = useMemo(() => {
    return resources.filter((resource) => {
      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          resource.title.toLowerCase().includes(query) ||
          resource.courseCode.toLowerCase().includes(query) ||
          resource.courseName.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Semester filter
      if (selectedSemester !== "all" && resource.semester !== parseInt(selectedSemester)) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(resource.type)) {
        return false
      }

      return true
    })
  }, [searchQuery, selectedSemester, selectedTypes])

  const handleTypeToggle = (type: string) => {
    setSelectedTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    )
  }

  const clearFilters = () => {
    setSelectedSemester("all")
    setSelectedTypes([])
    setSearchQuery("")
  }

  const hasActiveFilters = selectedSemester !== "all" || selectedTypes.length > 0 || searchQuery

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Access books, notes, and previous year question papers
        </p>
      </div>

      {/* Search and Filters */}
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-4 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <Select value={selectedSemester} onValueChange={setSelectedSemester}>
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {semesters.map((sem) => (
                <SelectItem key={sem.id} value={sem.id.toString()}>
                  Semester {sem.id}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => setShowFilters(!showFilters)}
          >
            <Filter className="h-4 w-4" />
            Filters
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel */}
        {showFilters && (
          <Card>
            <CardContent className="pt-4">
              <div className="flex flex-wrap items-center gap-6">
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium">Resource Type:</span>
                  {(["book", "notes", "paper"] as const).map((type) => (
                    <div key={type} className="flex items-center gap-2">
                      <Checkbox
                        id={type}
                        checked={selectedTypes.includes(type)}
                        onCheckedChange={() => handleTypeToggle(type)}
                      />
                      <Label htmlFor={type} className="text-sm cursor-pointer">
                        {resourceTypeLabels[type]}
                      </Label>
                    </div>
                  ))}
                </div>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1">
                    <X className="h-3 w-3" />
                    Clear filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Results count */}
      <p className="text-sm text-muted-foreground">
        Showing {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""}
      </p>

      {/* Resource Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {filteredResources.map((resource) => {
          const Icon = resourceTypeIcons[resource.type]
          return (
            <Card key={resource.id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">{resourceTypeLabels[resource.type]}</Badge>
                </div>
                <CardTitle className="line-clamp-2 text-base">{resource.title}</CardTitle>
                <CardDescription>
                  <span className="font-mono">{resource.courseCode}</span> • Semester{" "}
                  {resource.semester}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    {resource.fileSize}
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(resource.uploadDate).toLocaleDateString("en-US", {
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    className="flex-1 gap-1 bg-transparent"
                    onClick={() => setPreviewResource(resource.id)}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button size="sm" className="flex-1 gap-1">
                    <Download className="h-3 w-3" />
                    Download
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredResources.length === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/50" />
            <h3 className="mt-4 text-lg font-medium">No resources found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filters
            </p>
            {hasActiveFilters && (
              <Button variant="outline" size="sm" className="mt-4 bg-transparent" onClick={clearFilters}>
                Clear all filters
              </Button>
            )}
          </CardContent>
        </Card>
      )}

      {/* Preview Modal */}
      <Dialog open={!!previewResource} onOpenChange={() => setPreviewResource(null)}>
        <DialogContent className="max-w-4xl h-[80vh]">
          <DialogHeader>
            <DialogTitle>
              {resources.find((r) => r.id === previewResource)?.title}
            </DialogTitle>
            <DialogDescription>
              {resources.find((r) => r.id === previewResource)?.courseName}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 rounded-lg border border-border bg-muted/30 flex items-center justify-center">
            <div className="text-center">
              <FileText className="mx-auto h-16 w-16 text-muted-foreground/50" />
              <p className="mt-4 text-muted-foreground">
                PDF preview would be displayed here
              </p>
              <p className="text-sm text-muted-foreground">
                (In production, this would use a PDF viewer component)
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
