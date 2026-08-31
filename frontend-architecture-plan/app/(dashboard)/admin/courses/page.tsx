"use client"

import { useState, useEffect, useMemo } from "react"
import Link from "next/link"
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
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  GraduationCap,
  Layers,
  Upload,
  CloudUpload,
  FileText,
  BookOpen,
  Loader2,
} from "lucide-react"
import { toast } from "sonner"

export default function AdminCoursesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all")
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  
  // Direct file upload modal state
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "book",
    program: "BCA",
    semester: "1",
    course: "",
  })
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [fileError, setFileError] = useState<string | null>(null)

  const { programs, getPrograms, addCourses, getCourses, updateCourse, deleteCourse, addResource } = useAuth()
  const [courses, setCourses] = useState<any[]>([])

  const [courseForm, setCourseForm] = useState({
    code: "",
    name: "",
    credits: "4",
    semester: "1",
    program: "BCA"
  })

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const loadCourses = async () => {
    const response = await getCourses()
    if (response.success && response.data) {
      const dbCourses = response.data.map((c: any) => ({
        id: c._id || c.id,
        name: c["Course Name"] || c.name,
        code: c["Course Code"] || c.code,
        credits: c["Credits"] || c.credits,
        semester: c["Semester"] || c.semester,
        program: (c["Program"] || c.program || "BCA").toUpperCase()
      }))
      setCourses(dbCourses)
    }
  }

  useEffect(() => {
    getPrograms()
    loadCourses()
  }, [])

  // Sync default program in course form once programs load
  useEffect(() => {
    if (programs.length > 0 && !courseForm.program) {
      setCourseForm(prev => ({ ...prev, program: programs[0].code }))
    }
  }, [programs])

  // Get total semesters for the current active program filter
  const currentProgramObj = useMemo(() => {
    if (selectedProgramFilter === "all") return null
    return programs.find(p => p.code.toUpperCase() === selectedProgramFilter.toUpperCase())
  }, [programs, selectedProgramFilter])

  const maxSemestersForFilter = currentProgramObj ? currentProgramObj.totalSemesters : 6

  // Form program object for dynamic semester options in modal
  const formProgramObj = useMemo(() => {
    return programs.find(p => p.code.toUpperCase() === (courseForm.program || "BCA").toUpperCase())
  }, [programs, courseForm.program])

  const maxSemestersInForm = formProgramObj ? formProgramObj.totalSemesters : 6

  const filteredCourses = courses.filter((course) => {
    const matchesProg = selectedProgramFilter === "all" || course.program === selectedProgramFilter.toUpperCase()
    const matchesSearch =
      course.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.program.toLowerCase().includes(searchQuery.toLowerCase())
    return matchesProg && matchesSearch
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProgramFilter])

  const totalPages = Math.ceil(filteredCourses.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedCourses = filteredCourses.slice(startIndex, startIndex + itemsPerPage)

  const handleAddCourse = async () => {
    if (!courseForm.code || !courseForm.name || !courseForm.credits || !courseForm.semester) {
      toast.error("Please fill in all course fields")
      return
    }

    const { success, error } = await addCourses(
      courseForm.name,
      courseForm.code,
      parseInt(courseForm.credits),
      parseInt(courseForm.semester),
      courseForm.program
    )

    if (success) {
      toast.success(`Course added successfully under ${courseForm.program}`)
      setIsAddOpen(false)
      setCourseForm({
        code: "",
        name: "",
        credits: "4",
        semester: "1",
        program: courseForm.program || "BCA"
      })
      loadCourses()
    } else {
      toast.error(error || "Failed to add course")
    }
  }

  const handleUpdateCourse = async () => {
    if (!editingCourse) return

    const { success, error } = await updateCourse(
      courseForm.name,
      courseForm.code,
      parseInt(courseForm.credits),
      parseInt(courseForm.semester),
      editingCourse.id,
      courseForm.program
    )

    if (success) {
      toast.success("Course updated successfully")
      setIsEditOpen(false)
      setEditingCourse(null)
      loadCourses()
    } else {
      toast.error(error || "Failed to update course")
    }
  }

  const handleDeleteCourse = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this course?")) return

    const { success, error } = await deleteCourse(id)
    if (success) {
      toast.success("Course deleted successfully")
      loadCourses()
    } else {
      toast.error(error || "Failed to delete course")
    }
  }

  // Handle Quick Resource Upload for a course
  const handleOpenUploadForCourse = (course: any) => {
    setUploadForm({
      title: "",
      type: "book",
      program: course.program || "BCA",
      semester: String(course.semester || "1"),
      course: course.code,
    })
    setSelectedFile(null)
    setFileError(null)
    setIsUploadOpen(true)
  }

  const handleUploadResource = async () => {
    if (fileError) {
      toast.error(fileError)
      return
    }
    if (!selectedFile) {
      toast.error("Please choose a PDF or image file to upload")
      return
    }

    const courseObj = courses.find(c => c.code === uploadForm.course) || courses[0]
    const assignedCourse = uploadForm.course || courseObj?.code
    if (!assignedCourse) {
      toast.error("Please select a course for this resource")
      return
    }

    const effectiveTitle = (uploadForm.title && uploadForm.title.trim())
      ? uploadForm.title.trim()
      : selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")

    const prog = courseObj?.program || uploadForm.program || "BCA"
    const sem = String(courseObj?.semester || uploadForm.semester || "1")

    setIsUploading(true)
    const formData = new FormData()
    formData.append("resourceTitle", effectiveTitle)
    formData.append("resourceType", uploadForm.type || "book")
    formData.append("program", prog)
    formData.append("semester", sem)
    formData.append("course", assignedCourse)
    formData.append("file", selectedFile)

    try {
      const response = await addResource(formData)
      if (response.success) {
        toast.success(`Resource "${effectiveTitle}" uploaded for ${assignedCourse} successfully!`)
        setIsUploadOpen(false)
        setSelectedFile(null)
        setUploadForm({ title: "", type: "book", program: "BCA", semester: "1", course: "" })
      } else {
        toast.error(`Upload failed: ${response.error || "Unknown error"}`)
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Course Management</h1>
          <p className="text-muted-foreground">
            Manage academic courses, credits, and upload course study materials
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Link / Action to Upload Resource */}
          <Link href="/admin/resources">
            <Button variant="outline" className="gap-2 bg-transparent">
              <FileText className="h-4 w-4 text-primary" />
              Manage Resources
            </Button>
          </Link>

          <Button
            variant="outline"
            className="gap-2 bg-transparent"
            onClick={() => {
              setUploadForm({
                title: "",
                type: "book",
                program: selectedProgramFilter !== "all" ? selectedProgramFilter : "BCA",
                semester: "1",
                course: courses[0]?.code || "",
              })
              setSelectedFile(null)
              setIsUploadOpen(true)
            }}
          >
            <Upload className="h-4 w-4 text-primary" />
            Upload File
          </Button>

          {/* Add Course Modal */}
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Course
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[460px]">
              <DialogHeader>
                <DialogTitle>Add New Course</DialogTitle>
                <DialogDescription>
                  Create a new academic course assigned to a specific degree program
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label>Program</Label>
                  <Select
                    value={courseForm.program}
                    onValueChange={(value) =>
                      setCourseForm((prev) => ({ ...prev, program: value, semester: "1" }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Program" />
                    </SelectTrigger>
                    <SelectContent>
                      {programs.map((p) => (
                        <SelectItem key={p.code} value={p.code}>
                          {p.code} - {p.name}
                        </SelectItem>
                      ))}
                      {programs.length === 0 && (
                        <SelectItem value="BCA">BCA - Bachelor of Computer Applications</SelectItem>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-3 gap-3">
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

                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="name">Course Name</Label>
                    <Input
                      id="name"
                      placeholder="e.g., Problem Solving & C"
                      value={courseForm.name}
                      onChange={(e) =>
                        setCourseForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
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
                        {[1, 2, 3, 4, 5, 6, 8].map((credit) => (
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
                        {Array.from({ length: maxSemestersInForm }, (_, i) => i + 1).map((sem) => (
                          <SelectItem key={sem} value={sem.toString()}>
                            Semester {sem}
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
        </div>

        {/* Edit Course Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setEditingCourse(null)
          }
        }}>
          <DialogContent className="sm:max-w-[460px]">
            <DialogHeader>
              <DialogTitle>Edit Course</DialogTitle>
              <DialogDescription>
                Update course details and curriculum assignment
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Program</Label>
                <Select
                  value={courseForm.program}
                  onValueChange={(value) =>
                    setCourseForm((prev) => ({ ...prev, program: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {programs.map((p) => (
                      <SelectItem key={p.code} value={p.code}>
                        {p.code} - {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="space-y-2">
                  <Label htmlFor="edit-code">Code</Label>
                  <Input
                    id="edit-code"
                    value={courseForm.code}
                    onChange={(e) =>
                      setCourseForm((prev) => ({ ...prev, code: e.target.value }))
                    }
                  />
                </div>

                <div className="col-span-2 space-y-2">
                  <Label htmlFor="edit-name">Course Name</Label>
                  <Input
                    id="edit-name"
                    value={courseForm.name}
                    onChange={(e) =>
                      setCourseForm((prev) => ({ ...prev, name: e.target.value }))
                    }
                  />
                </div>
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 8].map((credit) => (
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
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {Array.from({ length: maxSemestersInForm }, (_, i) => i + 1).map((sem) => (
                        <SelectItem key={sem} value={sem.toString()}>
                          Semester {sem}
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

        {/* Quick Upload Resource Modal */}
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Upload File / Study Resource</DialogTitle>
              <DialogDescription>
                Upload textbooks, lecture notes, or question papers directly for this course
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-w-full">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="upload-title">Resource Title *</Label>
                <Input
                  id="upload-title"
                  placeholder="e.g., Problem Solving Complete Book"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label>Resource Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(val) => setUploadForm(prev => ({ ...prev, type: val }))}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Textbook</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="paper">Question Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2 min-w-0">
                  <Label>Assigned Course</Label>
                  <Select
                    value={uploadForm.course}
                    onValueChange={(val) => setUploadForm(prev => ({ ...prev, course: val }))}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue placeholder="Select Course" />
                    </SelectTrigger>
                    <SelectContent className="max-w-[340px]">
                      {courses.map((c) => (
                        <SelectItem key={c.id} value={c.code}>
                          {c.code} - {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <Label>Choose File (PDF or Image, max 10MB)</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/30 w-full"
                  onClick={() => document.getElementById('quick-course-file-upload')?.click()}
                >
                  <CloudUpload className="h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium text-center truncate max-w-[90%]">
                    {selectedFile ? selectedFile.name : "Click to select PDF or image file"}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, JPEG, PNG"}
                  </p>
                  <input
                    id="quick-course-file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setSelectedFile(file)
                      if (file) {
                        if (!uploadForm.title.trim()) {
                          const autoName = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
                          setUploadForm(prev => ({ ...prev, title: autoName }))
                        }
                        if (file.size > 10 * 1024 * 1024) {
                          setFileError("File is too large! Max allowed is 10MB.")
                        } else {
                          setFileError(null)
                        }
                      }
                    }}
                    accept=".pdf,image/*"
                  />
                </div>
                {fileError && <p className="text-xs text-destructive text-center">{fileError}</p>}
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsUploadOpen(false)} disabled={isUploading}>
                Cancel
              </Button>
              <Button onClick={handleUploadResource} disabled={isUploading || !!fileError || !selectedFile}>
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Uploading to Cloud...
                  </>
                ) : (
                  "Upload File"
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Semester Overview Cards */}
      <div className="grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
        {Array.from({ length: maxSemestersForFilter }, (_, i) => i + 1).map((semId) => {
          const semCount = filteredCourses.filter(c => Number(c.semester) === semId).length
          return (
            <Card key={semId}>
              <CardContent className="p-4 text-center">
                <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                  <span className="text-lg font-bold text-primary">{semId}</span>
                </div>
                <p className="text-sm font-medium">Semester {semId}</p>
                <p className="text-xs text-muted-foreground">
                  {semCount} course{semCount !== 1 ? "s" : ""}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Search and Program Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search courses by code or title..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={selectedProgramFilter} onValueChange={setSelectedProgramFilter}>
          <SelectTrigger className="w-full sm:w-[260px]">
            <Layers className="h-4 w-4 mr-2 text-muted-foreground shrink-0" />
            <SelectValue placeholder="Filter by Program" />
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
      </div>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses</CardTitle>
          <CardDescription>
            {filteredCourses.length} course{filteredCourses.length !== 1 ? "s" : ""}{" "}
            {selectedProgramFilter !== "all" ? `in ${selectedProgramFilter} program` : "across all programs"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Credits</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12 text-muted-foreground">
                    No courses found for the selected program or search filter.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedCourses.map((course) => (
                  <TableRow key={course.id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <GraduationCap className="h-4 w-4 text-primary" />
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
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {course.program}
                      </Badge>
                    </TableCell>
                    <TableCell>{course.credits} credits</TableCell>
                    <TableCell>Semester {course.semester}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        {/* Direct File Upload for this Course */}
                        <Button
                          variant="ghost"
                          size="icon"
                          title={`Upload file for ${course.code}`}
                          className="text-primary hover:text-primary hover:bg-primary/10"
                          onClick={() => handleOpenUploadForCourse(course)}
                        >
                          <Upload className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Edit Course"
                          onClick={() => {
                            setEditingCourse(course)
                            setCourseForm({
                              code: course.code,
                              name: course.name,
                              credits: course.credits.toString(),
                              semester: course.semester.toString(),
                              program: course.program
                            })
                            setIsEditOpen(true)
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Delete Course"
                          className="text-destructive"
                          onClick={() => handleDeleteCourse(course.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
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
