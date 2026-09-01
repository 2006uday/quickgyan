"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import {
  Search,
  BookOpen,
  ChevronRight,
  GraduationCap,
  Loader2,
  Layers,
  BookCheck,
  LayoutGrid,
  Sparkles,
  ArrowRight,
} from "lucide-react"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [viewMode, setViewMode] = useState<"program" | "all-programs">("program")

  const { getCourses, getResources, programs, getPrograms, selectedProgram, setSelectedProgram } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        const [coursesRes, resourcesRes, progRes] = await Promise.all([
          getCourses(),
          getResources(),
          getPrograms()
        ])

        if (coursesRes.success) setCourses(coursesRes.data || [])
        if (resourcesRes.success) setResources(resourcesRes.data.resources || [])
      } catch (error) {
        console.error("Failed to fetch courses data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  // Find active program object
  const currentProgramObj = useMemo(() => {
    if ((selectedProgram || "").toUpperCase() === "ALL") {
      return {
        code: "ALL",
        name: "All Academic Programs",
        description: "Comprehensive curriculum across all university degree programs",
        totalSemesters: 6,
        category: "All Programs"
      }
    }
    return programs.find(p => p.code.toUpperCase() === (selectedProgram || "BCA").toUpperCase()) || {
      code: selectedProgram || "BCA",
      name: selectedProgram === "BCA" ? "Bachelor of Computer Applications" : `${selectedProgram} Program`,
      description: "Academic Degree Program Curriculum",
      totalSemesters: 6,
      category: "Undergraduate"
    }
  }, [programs, selectedProgram])

  // Total semesters for the active program
  const totalSemesters = currentProgramObj.totalSemesters || 6

  const getResourceCount = (courseCode: string) => {
    return resources.filter(r => r.course === courseCode).length
  }

  const getSemesterResourceCount = (semNum: number) => {
    const semCourses = courses.filter(c => 
      (c.Program || c.program || "BCA").toUpperCase() === (selectedProgram || "BCA").toUpperCase() &&
      String(c.Semester || c.semester) === String(semNum)
    )
    const codes = semCourses.map(c => c["Course Code"] || c.code)
    return resources.filter(r => codes.includes(r.course)).length
  }

  // Filter courses for active program, semester, and search query
  const programCourses = useMemo(() => {
    if ((selectedProgram || "").toUpperCase() === "ALL") {
      return courses
    }
    return courses.filter(c => (c.Program || c.program || "BCA").toUpperCase() === (selectedProgram || "BCA").toUpperCase())
  }, [courses, selectedProgram])

  const filteredCourses = useMemo(() => {
    return programCourses.filter((course) => {
      const courseSem = course.Semester || course.semester
      const courseName = course["Course Name"] || course.name || ""
      const courseCode = course["Course Code"] || course.code || ""

      const semMatches = !selectedSemester || String(courseSem) === String(selectedSemester)
      const searchMatches =
        courseName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        courseCode.toLowerCase().includes(searchQuery.toLowerCase())
      return semMatches && searchMatches
    })
  }, [programCourses, selectedSemester, searchQuery])

  // Group by semester for the cards below
  const groupedSemesters = useMemo(() => {
    return Array.from({ length: totalSemesters }, (_, i) => i + 1).map(semNum => {
      return {
        id: semNum,
        name: `Semester ${semNum}`,
        courses: filteredCourses.filter(c => String(c.Semester || c.semester) === String(semNum))
      }
    }).filter(sem => sem.courses.length > 0)
  }, [totalSemesters, filteredCourses])

  if (loading) {
    return (
      <div className="flex h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Navigator</h1>
          <p className="text-muted-foreground">
            {viewMode === "all-programs"
              ? "Explore all registered academic degree programs and curriculums"
              : `Browse semester curriculum and course materials for ${currentProgramObj.name} (${currentProgramObj.code})`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "program" ? "default" : "outline"}
            size="sm"
            className="gap-1.5"
            onClick={() => setViewMode("program")}
          >
            <BookOpen className="h-4 w-4" />
            <span>{currentProgramObj.code} Curriculum</span>
          </Button>

          <Button
            variant={viewMode === "all-programs" ? "default" : "outline"}
            size="sm"
            className="gap-1.5 bg-transparent"
            onClick={() => setViewMode("all-programs")}
          >
            <LayoutGrid className="h-4 w-4" />
            <span>All Programs ({programs.length})</span>
          </Button>
        </div>
      </div>

      {/* Program Selector Pills - ALWAYS VISIBLE */}
      <div className="rounded-xl border border-border/80 bg-card p-4 space-y-2 shadow-xs">
        <div className="flex items-center justify-between">
          <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <Layers className="h-3.5 w-3.5 text-primary" />
            Academic Programs
          </Label>
          <span className="text-xs text-muted-foreground">
            Click any program to switch view
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-2 pt-1">
          <button
            type="button"
            onClick={() => {
              setSelectedProgram("ALL")
              setSelectedSemester(null)
              setViewMode("all-programs")
            }}
            className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-xs border text-left ${
              viewMode === "all-programs" || (selectedProgram || "").toUpperCase() === "ALL"
                ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/40"
            }`}
          >
            <div className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
              viewMode === "all-programs" || (selectedProgram || "").toUpperCase() === "ALL"
                ? "bg-primary-foreground/20 text-primary-foreground"
                : "bg-primary/10 text-primary"
            }`}>
              ALL
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className={`font-semibold ${viewMode === "all-programs" || (selectedProgram || "").toUpperCase() === "ALL" ? "text-primary-foreground" : "text-foreground"}`}>
                  All Programs
                </span>
                <Badge
                  variant={viewMode === "all-programs" || (selectedProgram || "").toUpperCase() === "ALL" ? "secondary" : "outline"}
                  className="text-[10px] px-1.5 py-0 font-normal"
                >
                  {programs.length}
                </Badge>
              </div>
              <p className={`text-[11px] truncate max-w-[160px] ${
                viewMode === "all-programs" || (selectedProgram || "").toUpperCase() === "ALL" ? "text-primary-foreground/80" : "text-muted-foreground"
              }`}>
                {courses.length} courses available
              </p>
            </div>
          </button>

          {programs.map((prog) => {
            const isSelected = viewMode === "program" && (selectedProgram || "BCA").toUpperCase() === prog.code.toUpperCase()
            const progCourseCount = courses.filter(c => (c.Program || c.program || "BCA").toUpperCase() === prog.code.toUpperCase()).length

            return (
              <button
                key={prog.code}
                type="button"
                onClick={() => {
                  setSelectedProgram(prog.code)
                  setSelectedSemester(null)
                  setViewMode("program")
                }}
                className={`group flex items-center gap-2.5 rounded-xl px-4 py-2.5 text-sm font-medium transition-all shadow-xs border text-left ${
                  isSelected
                    ? "border-primary bg-primary text-primary-foreground shadow-md ring-2 ring-primary/20"
                    : "border-border bg-background text-muted-foreground hover:border-primary/50 hover:text-foreground hover:bg-muted/40"
                }`}
              >
                <div className={`flex h-6 w-6 items-center justify-center rounded-md text-xs font-bold ${
                  isSelected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-primary/10 text-primary"
                }`}>
                  {prog.code.substring(0, 3)}
                </div>
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className={`font-semibold ${isSelected ? "text-primary-foreground" : "text-foreground"}`}>
                      {prog.code}
                    </span>
                    <Badge
                      variant={isSelected ? "secondary" : "outline"}
                      className="text-[10px] px-1.5 py-0 font-normal"
                    >
                      {prog.totalSemesters} Sem
                    </Badge>
                  </div>
                  <p className={`text-[11px] truncate max-w-[160px] ${
                    isSelected ? "text-primary-foreground/80" : "text-muted-foreground"
                  }`}>
                    {progCourseCount} courses available
                  </p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* VIEW MODE 1: ALL PROGRAMS CARD GRID */}
      {viewMode === "all-programs" && (
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {programs.map((prog) => {
              const progCourses = courses.filter(c => (c.Program || c.program || "BCA").toUpperCase() === prog.code.toUpperCase())
              const progRes = resources.filter(r => (r.program || "BCA").toUpperCase() === prog.code.toUpperCase())
              const isCurrent = (selectedProgram || "BCA").toUpperCase() === prog.code.toUpperCase()

              return (
                <Card key={prog.code} className={`flex flex-col transition-all hover:border-primary/50 hover:shadow-md ${
                  isCurrent ? "border-primary/60 ring-1 ring-primary/30 bg-primary/5" : ""
                }`}>
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary">
                        <GraduationCap className="h-6 w-6" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="font-mono text-xs">
                          {prog.code}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {prog.category || "Degree"}
                        </Badge>
                      </div>
                    </div>
                    <CardTitle className="text-lg mt-3">{prog.name}</CardTitle>
                    <CardDescription className="line-clamp-2 text-xs min-h-[32px]">
                      {prog.description || `${prog.totalSemesters}-semester curriculum in ${prog.name}`}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="mt-auto pt-0 space-y-4">
                    <div className="grid grid-cols-2 gap-2 rounded-lg bg-muted/50 p-2.5 text-center text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Duration</span>
                        <span className="font-semibold">{prog.totalSemesters} Semesters</span>
                      </div>
                      <div>
                        <span className="text-muted-foreground block text-[10px] uppercase">Curriculum</span>
                        <span className="font-semibold">{progCourses.length} Courses</span>
                      </div>
                    </div>

                    <Button
                      className="w-full gap-2"
                      variant={isCurrent ? "default" : "outline"}
                      onClick={() => {
                        setSelectedProgram(prog.code)
                        setSelectedSemester(null)
                        setViewMode("program")
                      }}
                    >
                      <span>Explore {prog.code} Courses</span>
                      <ArrowRight className="h-4 w-4" />
                    </Button>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      )}

      {/* VIEW MODE 2: PROGRAM COURSE NAVIGATOR */}
      {viewMode === "program" && (
        <div className="space-y-6">
          {/* Search and Filter Bar */}
          <div className="flex flex-col gap-4 sm:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={`Search ${currentProgramObj.code} courses by name or code (e.g., MCS-011)...`}
                className="pl-9"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          {/* Semester Grid */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: totalSemesters }, (_, i) => i + 1).map((sem) => {
              const semCoursesCount = programCourses.filter(c => String(c.Semester || c.semester) === String(sem)).length
              const semResCount = getSemesterResourceCount(sem)
              const isSelected = selectedSemester === sem

              return (
                <button
                  key={sem}
                  type="button"
                  onClick={() => setSelectedSemester(isSelected ? null : sem)}
                  className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md ${
                    isSelected
                      ? "border-primary bg-primary/5 shadow-xs ring-1 ring-primary/30"
                      : "border-border bg-card"
                  }`}
                >
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-lg ${
                      isSelected
                        ? "bg-primary text-primary-foreground"
                        : "bg-primary/10 text-primary"
                    }`}
                  >
                    <span className="text-lg font-bold">{sem}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">Semester {sem}</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {semCoursesCount} courses • {semResCount} resources
                    </p>
                  </div>
                </button>
              )
            })}
          </div>

          {/* Course List Grouped by Semester */}
          <div className="space-y-6">
            {groupedSemesters.map((semester) => {
              return (
                <Card key={semester.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-5 w-5 text-primary" />
                        <CardTitle>{currentProgramObj.code} - {semester.name}</CardTitle>
                      </div>
                      <Badge variant="outline" className="font-mono text-xs">
                        Semester {semester.id} of {totalSemesters}
                      </Badge>
                    </div>
                    <CardDescription>
                      {semester.courses.length} course{semester.courses.length !== 1 ? "s" : ""} available in this semester
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="divide-y divide-border">
                      {semester.courses.map((course: any) => {
                        const cCode = course["Course Code"] || course.code
                        const cName = course["Course Name"] || course.name
                        const cId = course._id || course.id
                        const resCount = getResourceCount(cCode)

                        return (
                          <Link
                            key={cId}
                            href={`/dashboard/resources?program=${currentProgramObj.code}&semester=${semester.id}&course=${cCode}`}
                            className="flex items-center gap-4 py-4 transition-colors hover:bg-muted/50 -mx-4 px-4 first:pt-0 last:pb-0"
                          >
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                              <BookOpen className="h-5 w-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2">
                                <Badge variant="secondary" className="font-mono">
                                  {cCode}
                                </Badge>
                                <Badge variant="outline">
                                  {resCount} Resources
                                </Badge>
                                {course.Credits && (
                                  <span className="text-xs text-muted-foreground">
                                    {course.Credits} Credits
                                  </span>
                                )}
                              </div>
                              <p className="mt-1 truncate font-medium">{cName}</p>
                            </div>
                            <Button variant="ghost" size="icon">
                              <ChevronRight className="h-4 w-4" />
                            </Button>
                          </Link>
                        )
                      })}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {groupedSemesters.length === 0 && (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Search className="h-12 w-12 text-muted-foreground/50" />
                <h3 className="mt-4 text-lg font-medium">No courses found for {currentProgramObj.code}</h3>
                <p className="text-sm text-muted-foreground text-center max-w-sm mt-1">
                  {searchQuery || selectedSemester
                    ? "Try adjusting your search query or semester selection"
                    : `No courses have been configured under ${currentProgramObj.name} yet.`}
                </p>
                {selectedSemester && (
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-4 bg-transparent"
                    onClick={() => setSelectedSemester(null)}
                  >
                    Clear Semester Filter
                  </Button>
                )}
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}
