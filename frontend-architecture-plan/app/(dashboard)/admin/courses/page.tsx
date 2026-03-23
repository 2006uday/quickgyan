"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/lib/auth-context"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { semesters } from "@/lib/mock-data"
import {

  Search,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
} from "lucide-react"
import { toast } from "sonner"


export default function AdminCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: "",
    semester: "",
  })
  const { addCourses, getCourses, updateCourse, deleteCourse } = useAuth()
  const [courses, setCourses] = useState<any[]>([])

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadCourses = async () => {
    const response = await getCourses()
    console.log("courses data : ", response.data)
    if (response.success && response.data) {
      // Map database field names to UI format
      const dbCourses = response.data.map((c: any) => ({
        id: c._id || c.id,
        name: c["Course Name"] || c.name,
        code: c["Course Code"] || c.code,
        credits: c["Credits"] || c.credits,
        semester: c["Semester"] || c.semester
      }))
      setCourses(dbCourses)
    }
  }

  useEffect(() => {
    loadCourses()
  }, [])

  const filteredCourses = courses.filter(
    (course) =>
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage)

  const handleAddCourse = async () => {
    console.log("Adding course:", courseForm)

    const { success, error } = await addCourses(courseForm.name, courseForm.code, parseInt(courseForm.credits), parseInt(courseForm.semester))
    if (success) {
      toast.success("Course added successfully")
      setIsAddOpen(false)
      setCourseForm({ code: "", name: "", credits: "", semester: "" })
      loadCourses()
    } else {
      toast.error(error || "Failed to add course")
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return
    console.log("Updating course:", courseForm)

    const { success, error } = await updateCourse(
      courseForm.name,
      courseForm.code,
      parseInt(courseForm.credits),
      parseInt(courseForm.semester),
      editingCourse.id
    )

    if (success) {
      toast.success("Course updated successfully")
      setIsEditOpen(false)
      setEditingCourse(null)
      setCourseForm({ code: "", name: "", credits: "", semester: "" })
      loadCourses()
    } else {
      toast.error(error || "Failed to update course")
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return
    console.log("Deleting course:", id)

    const { success, error } = await deleteCourse(id)
    if (success) {
      toast.success("Course deleted successfully")
      loadCourses()
    } else {
      toast.error(error || "Failed to delete course")
    }
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Manage academic courses and semesters
          </p>
        </div>
        <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Add New Course</DialogTitle>
              <DialogDescription>
                Create a new course for the BCA program
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="code">Course Code</Label>
                <Input
                  id="code"
                  placeholder="e.g., MCS-011"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="name">Course Name</Label>
                <Input
                  id="name"
                  placeholder="Enter course name"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Select
                    value={courseForm.credits}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, credits: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((credit) => (
                        <SelectItem key={credit} value={credit.toString()}>
                          {credit} credits
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={courseForm.semester}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, semester: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.id.toString()}>
                          Semester {sem.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsAddOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleAddCourse}>Add Course</Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Course Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setEditingCourse(null)
            setCourseForm({ code: "", name: "", credits: "", semester: "" })
          }
        }}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update the course details for the BCA program
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Course Code</Label>
                <Input
                  id="edit-code"
                  placeholder="e.g., MCS-011"
                  value={courseForm.code}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, code: e.target.value }))
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-name">Course Name</Label>
                <Input
                  id="edit-name"
                  placeholder="Enter course name"
                  value={courseForm.name}
                  onChange={(e) =>
                    setCourseForm((prev) => ({ ...prev, name: e.target.value }))
                  }
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Credits</Label>
                  <Select
                    value={courseForm.credits}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, credits: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6].map((credit) => (
                        <SelectItem key={credit} value={credit.toString()}>
                          {credit} credits
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={courseForm.semester}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, semester: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {semesters.map((sem) => (
                        <SelectItem key={sem.id} value={sem.id.toString()}>
                          Semester {sem.id}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpdateCourse}>Update Course</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Semester Overview */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {semesters.map((sem) => (
          <Card key={sem.id}>
            <CardContent className="p-4 text-center">
              <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <span className="text-lg font-bold text-primary">{sem.id}</span>
              </div>
              <p className="text-sm font-medium">Semester {sem.id}</p>
              <p className="text-xs text-muted-foreground">
                {courses.filter(c => c.semester === sem.id).length} courses
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search courses..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""} in the BCA program
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedCourses.map((course) => (
                <TableRow key={course.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <GraduationCap className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[250px] truncate font-medium">
                        {course.name}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="font-mono">
                      {course.code}
                    </Badge>
                  </TableCell>
                  <TableCell>{course.credits} credits</TableCell>
                  <TableCell>Semester {course.semester}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setEditingCourse(course)
                          setCourseForm({
                            code: course.code,
                            name: course.name,
                            credits: course.credits.toString(),
                            semester: course.semester.toString()
                          })
                          setIsEditOpen(true)
                        }}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteCourse(course.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-2 py-4">
              <div className="text-sm text-muted-foreground">
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredCourses.length)} of {filteredCourses.length} courses
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                  disabled={currentPage === 1}
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
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
