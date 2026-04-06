"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { Search, BookOpen, ChevronRight, GraduationCap, Loader2 } from "lucide-react"

export default function CoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null)
  const [courses, setCourses] = useState<any[]>([])
  const [resources, setResources] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const { getCourses, getResources } = useAuth()

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [coursesRes, resourcesRes] = await Promise.all([
          getCourses(),
          getResources()
        ])

        if (coursesRes.success) setCourses(coursesRes.data)
        if (resourcesRes.success) setResources(resourcesRes.data.resources || [])
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [getCourses, getResources])

  const getResourceCount = (courseCode: string) => {
    return resources.filter(r => r.course === courseCode).length
  }

  const getSemesterResourceCount = (semNum: number) => {
    const semCourses = courses.filter(c => c.Semester === semNum)
    const codes = semCourses.map(c => c["Course Code"])
    return resources.filter(r => codes.includes(r.course)).length
  }

  const filteredCourses = courses.filter((course) => {
    const semMatches = !selectedSemester || course.Semester === selectedSemester
    const searchMatches =
      course["Course Name"].toLowerCase().includes(searchQuery.toLowerCase()) ||
      course["Course Code"].toLowerCase().includes(searchQuery.toLowerCase())
    return semMatches && searchMatches
  })

  // Group by semester for the cards below
  const groupedSemesters = [1, 2, 3, 4, 5, 6].map(semNum => {
    return {
      id: semNum,
      name: `Semester ${semNum}`,
      courses: filteredCourses.filter(c => c.Semester === semNum)
    }
  }).filter(sem => sem.courses.length > 0)

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
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Course Navigator</h1>
        <p className="text-muted-foreground">
          Browse courses by semester and access study materials
        </p>
      </div>

      {/* Search and Filter */}
      <div className="flex flex-col gap-4 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search by course name or code (e.g., MCS-011)"
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Semester Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[1, 2, 3, 4, 5, 6].map((sem) => (
          <button
            key={sem}
            type="button"
            onClick={() => setSelectedSemester(selectedSemester === sem ? null : sem)}
            className={`flex items-center gap-4 rounded-xl border p-4 text-left transition-all hover:border-primary/50 hover:shadow-md ${selectedSemester === sem
              ? "border-primary bg-primary/5"
              : "border-border bg-card"
              }`}
          >
            <div
              className={`flex h-12 w-12 items-center justify-center rounded-lg ${selectedSemester === sem
                ? "bg-primary text-primary-foreground"
                : "bg-primary/10 text-primary"
                }`}
            >
              <span className="text-lg font-bold">{sem}</span>
            </div>
            <div>
              <h3 className="font-semibold">Semester {sem}</h3>
              <p className="text-sm text-muted-foreground leading-tight">
                {courses.filter(c => c.Semester === sem).length} courses • {getSemesterResourceCount(sem)} resources
              </p>
            </div>
          </button>
        ))}
      </div>

      {/* Course List */}
      <div className="space-y-6">
        {groupedSemesters.map((semester) => {
          return (
            <Card key={semester.id}>
              <CardHeader>
                <div className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  <CardTitle>{semester.name}</CardTitle>
                </div>
                <CardDescription>
                  {semester.courses.length} course{semester.courses.length !== 1 ? "s" : ""} available
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="divide-y divide-border">
                  {semester.courses.map((course: any) => (
                    <Link
                      key={course._id}
                      href={`/dashboard/resources?semester=${semester.id}&course=${course["Course Code"]}`}
                      className="flex items-center gap-4 py-4 transition-colors hover:bg-muted/50 -mx-4 px-4 first:pt-0 last:pb-0"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                        <BookOpen className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="font-mono">
                            {course["Course Code"]}
                          </Badge>
                          <Badge variant="outline">
                            {getResourceCount(course["Course Code"])} Resources
                          </Badge>
                        </div>
                        <p className="mt-1 truncate font-medium">{course["Course Name"]}</p>
                      </div>
                      <Button variant="ghost" size="icon">
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  ))}
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
            <h3 className="mt-4 text-lg font-medium">No courses found</h3>
            <p className="text-sm text-muted-foreground">
              Try adjusting your search or filter
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
