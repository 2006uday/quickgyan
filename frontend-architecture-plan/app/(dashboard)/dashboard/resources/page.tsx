"use client"

import { useState, useMemo, useEffect } from "react"
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
  Layers,
  GraduationCap,
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
  const { getResources, getCourses, programs, getPrograms, selectedProgram, setSelectedProgram } = useAuth()

  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgramFilter, setSelectedProgramFilter] = useState(
    searchParams.get("program") || selectedProgram || "all"
  )
  const [selectedSemester, setSelectedSemester] = useState(
    searchParams.get("semester") || "all"
  )
  const [selectedCourseFilter, setSelectedCourseFilter] = useState<string | null>(
    searchParams.get("course") || null
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
  const itemsPerPage = 12

  const fetchAllData = async () => {
    try {
      setLoading(true)
      const [resResponse, courseResponse] = await Promise.all([
        getResources(),
        getCourses(),
        getPrograms()
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
    if (type) setSelectedTypes([type])

    const semester = searchParams.get("semester")
    if (semester) setSelectedSemester(semester)

    const prog = searchParams.get("program")
    if (prog) setSelectedProgramFilter(prog.toUpperCase())

    const course = searchParams.get("course")
    if (course) setSelectedCourseFilter(course)
  }, [searchParams])

  useEffect(() => {
    fetchAllData()
  }, [])

  // Find max semesters for selected program filter
  const currentProgramObj = useMemo(() => {
    if (selectedProgramFilter === "all") return null
    return programs.find(p => p.code.toUpperCase() === selectedProgramFilter.toUpperCase())
  }, [programs, selectedProgramFilter])

  const maxSemesters = currentProgramObj ? currentProgramObj.totalSemesters : 6

  // Resources matching current Program and Semester filter scope
  const resourcesMatchingProgSem = useMemo(() => {
    return realResources.filter((r) => {
      const resProg = (r.program || "BCA").toUpperCase()
      const progMatch = selectedProgramFilter === "all" || resProg === selectedProgramFilter.toUpperCase()
      const semMatch = selectedSemester === "all" || String(r.semester) === String(selectedSemester)
      return progMatch && semMatch
    })
  }, [realResources, selectedProgramFilter, selectedSemester])

  // Distinct course codes matching the active program and semester filter
  const availableCourseCodes = useMemo(() => {
    const codesSet = new Set<string>()

    // From DB courses
    coursesFromDb.forEach((c: any) => {
      const cProg = (c.Program || c.program || "BCA").toUpperCase()
      const cSem = String(c.Semester || c.semester)
      const progMatch = selectedProgramFilter === "all" || cProg === selectedProgramFilter.toUpperCase()
      const semMatch = selectedSemester === "all" || cSem === String(selectedSemester)
      if (progMatch && semMatch) {
        const code = c["Course Code"] || c.code
        if (code) codesSet.add(code)
      }
    })

    // From actual resources in this program & semester scope
    resourcesMatchingProgSem.forEach((r) => {
      if (r.course) codesSet.add(r.course)
    })

    return Array.from(codesSet).sort()
  }, [coursesFromDb, resourcesMatchingProgSem, selectedProgramFilter, selectedSemester])

  // When available courses change, if active course filter is not valid in this scope, reset it
  useEffect(() => {
    if (selectedCourseFilter && availableCourseCodes.length > 0) {
      if (!availableCourseCodes.includes(selectedCourseFilter)) {
        setSelectedCourseFilter(null)
      }
    }
  }, [availableCourseCodes, selectedCourseFilter])

  // Filtered resources list
  const filteredResources = useMemo(() => {
    return realResources.filter((resource) => {
      // Program filter
      const resProg = (resource.program || "BCA").toUpperCase()
      if (selectedProgramFilter !== "all" && resProg !== selectedProgramFilter.toUpperCase()) {
        return false
      }

      // Course code filter
      if (selectedCourseFilter && resource.course !== selectedCourseFilter) {
        return false
      }

      // Fallback Course context (from URL when no pill selected)
      const urlCourse = searchParams.get("course")
      if (!selectedCourseFilter && urlCourse && resource.course !== urlCourse) {
        return false
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase()
        const matchesSearch =
          resource.resourceTitle.toLowerCase().includes(query) ||
          resource.course.toLowerCase().includes(query) ||
          resProg.toLowerCase().includes(query)
        if (!matchesSearch) return false
      }

      // Semester filter
      if (selectedSemester !== "all" && String(resource.semester) !== String(selectedSemester)) {
        return false
      }

      // Type filter
      if (selectedTypes.length > 0 && !selectedTypes.includes(resource.resourceType)) {
        return false
      }

      return true
    })
  }, [realResources, searchQuery, selectedProgramFilter, selectedSemester, selectedCourseFilter, selectedTypes, searchParams])

  // Reset to first page when filters change
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProgramFilter, selectedSemester, selectedCourseFilter, selectedTypes])

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
    setSelectedProgramFilter("all")
    setSelectedSemester("all")
    setSelectedCourseFilter(null)
    setSelectedTypes([])
    setSearchQuery("")
  }

  const hasActiveFilters =
    selectedProgramFilter !== "all" ||
    selectedSemester !== "all" ||
    selectedCourseFilter !== null ||
    selectedTypes.length > 0 ||
    searchQuery

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Resource Library</h1>
        <p className="text-muted-foreground">
          Access textbooks, lecture notes, and previous year exam question papers across academic programs
        </p>
      </div>

      {/* Search and Filters Bar */}
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search resources, topics, or course codes..."
              className="pl-9"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Program Filter */}
          <Select value={selectedProgramFilter} onValueChange={(val) => {
            setSelectedProgramFilter(val)
            setSelectedSemester("all")
            setSelectedCourseFilter(null)
          }}>
            <SelectTrigger className="w-full sm:w-[220px]">
              <Layers className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
              <SelectValue placeholder="Program" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Programs</SelectItem>
              {programs.map((p) => (
                <SelectItem key={p.code} value={p.code}>
                  {p.code} - {p.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Semester Filter */}
          <Select value={selectedSemester} onValueChange={(val) => {
            setSelectedSemester(val)
            setSelectedCourseFilter(null)
          }}>
            <SelectTrigger className="w-full sm:w-[160px]">
              <SelectValue placeholder="Semester" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Semesters</SelectItem>
              {Array.from({ length: maxSemesters }, (_, i) => i + 1).map((num) => (
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
            Type Filter
            {selectedTypes.length > 0 && (
              <Badge variant="secondary" className="ml-1">
                {selectedTypes.length}
              </Badge>
            )}
          </Button>
        </div>

        {/* Filter Panel for Resource Types */}
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
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="gap-1 text-muted-foreground hover:text-foreground">
                    <X className="h-3 w-3" />
                    Clear all filters
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Course Code Filter Chips Bar (Shown when Program or Semester filter is active and course codes are available) */}
        {availableCourseCodes.length > 0 && (selectedProgramFilter !== "all" || selectedSemester !== "all") && (
          <div className="flex flex-wrap items-center gap-2 p-3 rounded-xl bg-card border border-border/80 shadow-xs">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-muted-foreground mr-1 shrink-0">
              <GraduationCap className="h-4 w-4 text-primary" />
              <span>Filter by Course:</span>
            </div>

            {/* All Courses Button */}
            <Button
              type="button"
              variant={selectedCourseFilter === null ? "default" : "outline"}
              size="sm"
              className={`h-7 px-3 text-xs rounded-full transition-all shrink-0 ${
                selectedCourseFilter === null ? "font-semibold shadow-xs" : "bg-background text-muted-foreground hover:text-foreground"
              }`}
              onClick={() => setSelectedCourseFilter(null)}
            >
              All Courses ({resourcesMatchingProgSem.length})
            </Button>

            {/* Individual Course Code Pills */}
            {availableCourseCodes.map((code) => {
              const isSelected = selectedCourseFilter === code
              const resCount = resourcesMatchingProgSem.filter(r => r.course === code).length

              return (
                <Button
                  key={code}
                  type="button"
                  variant={isSelected ? "default" : "outline"}
                  size="sm"
                  className={`h-7 px-3 text-xs rounded-full transition-all shrink-0 gap-1.5 font-mono ${
                    isSelected
                      ? "font-bold shadow-xs ring-2 ring-primary/20"
                      : "bg-background text-muted-foreground hover:text-foreground hover:border-primary/40"
                  }`}
                  onClick={() => setSelectedCourseFilter(isSelected ? null : code)}
                >
                  <span>{code}</span>
                  <Badge
                    variant={isSelected ? "secondary" : "outline"}
                    className="text-[10px] px-1 py-0 h-4 font-sans font-normal"
                  >
                    {resCount}
                  </Badge>
                </Button>
              )
            })}
          </div>
        )}
      </div>

      {/* Results count & Active Badges */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Showing {filteredResources.length > 0 ? startIndex + 1 : 0}-{Math.min(startIndex + itemsPerPage, filteredResources.length)} of {filteredResources.length} resources
        </p>

        <div className="flex flex-wrap items-center gap-2">
          {selectedProgramFilter !== "all" && (
            <Badge variant="outline" className="font-mono text-xs">
              Program: {selectedProgramFilter}
            </Badge>
          )}

          {selectedSemester !== "all" && (
            <Badge variant="outline" className="text-xs">
              Semester {selectedSemester}
            </Badge>
          )}

          {selectedCourseFilter && (
            <Badge
              variant="secondary"
              className="font-mono text-xs gap-1 pr-1 cursor-pointer hover:bg-destructive/10 hover:text-destructive transition-colors"
              onClick={() => setSelectedCourseFilter(null)}
            >
              Course: {selectedCourseFilter}
              <X className="h-3 w-3" />
            </Badge>
          )}

          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="h-6 text-xs text-muted-foreground hover:text-foreground px-2"
            >
              Reset Filters
            </Button>
          )}
        </div>
      </div>

      {/* Resource Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {paginatedResources.map((resource) => {
          const Icon = resourceTypeIcons[resource.resourceType as keyof typeof resourceTypeIcons] || FileText
          const resProg = (resource.program || "BCA").toUpperCase()

          return (
            <Card key={resource._id} className="flex flex-col hover:border-primary/40 transition-all hover:shadow-md">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="h-5 w-5 text-primary" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant="outline" className="font-mono text-xs">
                      {resProg}
                    </Badge>
                    <Badge variant="secondary" className="text-xs capitalize">
                      {resourceTypeLabels[resource.resourceType as keyof typeof resourceTypeLabels] || resource.resourceType}
                    </Badge>
                  </div>
                </div>
                <CardTitle className="line-clamp-2 text-base mt-2">{resource.resourceTitle}</CardTitle>
                <CardDescription>
                  <span className="font-mono font-medium text-foreground">{resource.course}</span> • Semester {resource.semester}
                </CardDescription>
              </CardHeader>
              <CardContent className="mt-auto pt-0">
                <div className="mb-4 flex flex-wrap gap-3 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <HardDrive className="h-3 w-3" />
                    Cloud Document
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
            <p className="text-sm text-muted-foreground text-center max-w-sm">
              Try adjusting your program, semester, course, or search filters
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
              {(previewResource?.program || "BCA").toUpperCase()} • {previewResource?.course} • {resourceTypeLabels[previewResource?.resourceType as keyof typeof resourceTypeLabels]}
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
