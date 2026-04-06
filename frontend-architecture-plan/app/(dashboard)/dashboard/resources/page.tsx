"use client"

import { useState, useMemo } from "react"
import { useSearchParams } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
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
  Loader2,
} from "lucide-react"
import { useEffect } from "react"

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
  const [selectedTypes, setSelectedTypes] = useState<string[]>(
    searchParams.get("type") ? [searchParams.get("type")!] : []
  )
  const [previewResource, setPreviewResource] = useState<any | null>(null)
  const [showFilters, setShowFilters] = useState(false)
  const [realResources, setRealResources] = useState<any[]>([])
  const [coursesFromDb, setCoursesFromDb] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 12 // Using 12 for better grid alignment (3x4 or 2x6)

  const { getResources, getCourses } = useAuth()

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [resResponse, courseResponse] = await Promise.all([
        getResources(),
        getCourses()
      ])

      if (resResponse.success) setRealResources(resResponse.data.resources || [])
      if (courseResponse.success) setCoursesFromDb(courseResponse.data || [])
    } catch (error) {
      console.error("Failed to fetch library data:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const type = searchParams.get("type")
    if (type) {
      setSelectedTypes([type])
    }
    const semester = searchParams.get("semester")
    if (semester) {
      setSelectedSemester(semester)
    }
  }, [searchParams])

  useEffect(() => {
    fetchAllData()
  }, [])

  const filteredResources = useMemo(() => {
    return realResources.filter((resource) => {
      // Course context (from URL)
      const urlCourse = searchParams.get("course")
      if (urlCourse && resource.course !== urlCourse) return false

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          resource.resourceTitle.toLowerCase().includes(query) ||
          resource.course.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Semester filter
      if (selectedSemester !== "all" && resource.semester.toString() !== selectedSemester) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(resource.resourceType)) {
        return false
      }

      return true
    })
  }, [realResources, searchQuery, selectedSemester, selectedTypes, searchParams])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedSemester, selectedTypes])

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

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
              {[1, 2, 3, 4, 5, 6].map((num) => (
                <SelectItem key={num} value={num.toString()}>
                  Semester {num}
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
        Showing {startIndex + 1}-{Math.min(startIndex + itemsPerPage, filteredResources.length)} of {filteredResources.length} resources
      </p>

      {/* Resource Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedResources.map((resource) => {
          const Icon = resourceTypeIcons[resource.resourceType as keyof typeof resourceTypeIcons] || FileText
          return (
            <Card key={resource._id} className="flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <Badge variant="secondary">
                    {resourceTypeLabels[resource.resourceType as keyof typeof resourceTypeLabels]}
                  </Badge>
                </div>
                <CardTitle className="line-clamp-2 text-base">{resource.resourceTitle}</CardTitle>
                <CardDescription>
                  <span className="font-mono">{resource.course}</span> • Semester{" "}
                  {resource.semester}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Cloud File
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="h-3 w-3" />
                    {new Date(resource.createdAt).toLocaleDateString("en-US", {
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
                    onClick={() => setPreviewResource(resource)}
                  >
                    <Eye className="h-3 w-3" />
                    Preview
                  </Button>
                  <Button asChild size="sm" className="flex-1 gap-1">
                    <a href={resource.fileUrl} target="_blank" rel="noopener noreferrer">
                      <Download className="h-3 w-3" />
                      View/Save
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center space-x-2 py-8">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
            disabled={currentPage === 1}
            className="bg-transparent"
          >
            Previous
          </Button>
          <div className="flex items-center gap-1">
            {/* Show page numbers with ellipsis logic if needed, but for now just list them */}
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="sm"
                className="h-8 w-8 p-0"
                onClick={() => setCurrentPage(page)}
              >
                {page}
              </Button>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
            disabled={currentPage === totalPages}
            className="bg-transparent"
          >
            Next
          </Button>
        </div>
      )}

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
        <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 overflow-hidden">
          <DialogHeader className="mb-4">
            <DialogTitle>
              {previewResource?.resourceTitle}
            </DialogTitle>
            <DialogDescription>
              {previewResource?.course} • {resourceTypeLabels[previewResource?.resourceType as keyof typeof resourceTypeLabels]}
            </DialogDescription>
          </DialogHeader>
          <div className="flex-1 w-full h-full rounded-lg border border-border overflow-hidden bg-black">
            <iframe
              src={previewResource?.fileUrl}
              className="w-full h-full"
              title="Resource Preview"
            />
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
