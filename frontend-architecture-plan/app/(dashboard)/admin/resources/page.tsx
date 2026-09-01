"use client"

import { useState, useEffect, useMemo, useRef } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
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
  FileText,
  Search,
  Pencil,
  Trash2,
  Plus,
  CloudUpload,
  Layers,
  Loader2,
  Files,
  FolderUp,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  X,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

interface BulkResourceItem {
  id: string
  file: File
  title: string
  program: string
  semester: string
  course: string
  type: string
  fileError?: string | null
}

export default function AdminResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedProgramFilter, setSelectedProgramFilter] = useState("all")
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
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [editingResource, setEditingResource] = useState<any>(null)
  const [realResources, setRealResources] = useState<any[]>([])
  const [coursesFromDb, setCoursesFromDb] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [fileError, setFileError] = useState<string | null>(null)

  // Bulk Upload State
  const [isBulkOpen, setIsBulkOpen] = useState(false)
  const [bulkItems, setBulkItems] = useState<BulkResourceItem[]>([])
  const [isBulkUploading, setIsBulkUploading] = useState(false)
  const [isDragging, setIsDragging] = useState(false)
  const bulkFileInputRef = useRef<HTMLInputElement>(null)

  // Presets for bulk operations
  const [presetProgram, setPresetProgram] = useState("BCA")
  const [presetSemester, setPresetSemester] = useState("1")
  const [presetType, setPresetType] = useState("book")

  const {
    programs,
    getPrograms,
    getResources,
    getCourses,
    addResource,
    bulkAddResources,
    updateResource,
    deleteResource
  } = useAuth()

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  const fetchResources = async () => {
    try {
      const response = await getResources()
      if (response.success) {
        setRealResources(response.data.resources || [])
      }
    } catch (error) {
      console.error("Failed to fetch resources:", error)
    } finally {
      setLoading(false)
    }
  }

  const fetchCourses = async () => {
    try {
      const response = await getCourses()
      if (response.success) {
        const data = response.data
        const formatted = (data || []).map((c: any) => ({
          id: c._id,
          name: c["Course Name"] || c.name,
          code: c["Course Code"] || c.code,
          semester: c["Semester"] || c.semester,
          program: (c["Program"] || c.program || "BCA").toUpperCase()
        }))
        setCoursesFromDb(formatted)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  useEffect(() => {
    getPrograms()
    fetchResources()
    fetchCourses()
  }, [])

  // Sync default program in upload form
  useEffect(() => {
    if (programs.length > 0 && !uploadForm.program) {
      setUploadForm(prev => ({ ...prev, program: programs[0].code }))
      setPresetProgram(programs[0].code)
    }
  }, [programs])

  // Dynamic total semesters for the program in single upload form
  const formProgramObj = useMemo(() => {
    return programs.find(p => p.code.toUpperCase() === (uploadForm.program || "BCA").toUpperCase())
  }, [programs, uploadForm.program])

  const maxSemestersInForm = formProgramObj ? formProgramObj.totalSemesters : 6

  // Dynamic total semesters for preset program
  const presetProgramObj = useMemo(() => {
    return programs.find(p => p.code.toUpperCase() === (presetProgram || "BCA").toUpperCase())
  }, [programs, presetProgram])

  const maxSemestersInPreset = presetProgramObj ? presetProgramObj.totalSemesters : 6

  const filteredResources = realResources.filter((resource) => {
    const progMatch = selectedProgramFilter === "all" || (resource.program || "BCA").toUpperCase() === selectedProgramFilter.toUpperCase()
    const textMatch =
      resource.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.course.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (resource.program || "BCA").toLowerCase().includes(searchQuery.toLowerCase())
    return progMatch && textMatch
  })

  // Reset to first page when search/filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, selectedProgramFilter])

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

  const handleUpload = async () => {
    if (fileError) {
      toast.error(fileError)
      return
    }
    if (!selectedFile) {
      toast.error("Please select a file to upload")
      return
    }
    if (!uploadForm.semester || !uploadForm.course) {
      toast.error("Please select semester and course")
      return
    }

    const effectiveTitle = (uploadForm.title && uploadForm.title.trim())
      ? uploadForm.title.trim()
      : selectedFile.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")

    setIsUploading(true)
    const formData = new FormData()
    formData.append("resourceTitle", effectiveTitle)
    formData.append("resourceType", uploadForm.type || "book")
    formData.append("program", uploadForm.program || "BCA")
    formData.append("semester", uploadForm.semester)
    formData.append("course", uploadForm.course)
    formData.append("file", selectedFile)

    try {
      const response = await addResource(formData)

      if (response.success) {
        toast.success(`Resource "${effectiveTitle}" uploaded successfully!`)
        setIsUploadOpen(false)
        setUploadForm({ title: "", type: "book", program: uploadForm.program || "BCA", semester: "1", course: "" })
        setSelectedFile(null)
        fetchResources()
      } else {
        toast.error(`Upload failed: ${response.error || "Unknown error"}`)
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during upload.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async () => {
    if (fileError) {
      toast.error(fileError)
      return
    }
    if (!editingResource || !uploadForm.semester || !uploadForm.course) {
      toast.error("Please fill in all required fields")
      return
    }

    const effectiveTitle = (uploadForm.title && uploadForm.title.trim())
      ? uploadForm.title.trim()
      : editingResource.resourceTitle || "Updated Resource"

    setIsUploading(true)
    const formData = new FormData()
    formData.append("id", editingResource._id)
    formData.append("resourceTitle", effectiveTitle)
    formData.append("resourceType", uploadForm.type || "book")
    formData.append("program", uploadForm.program || "BCA")
    formData.append("semester", uploadForm.semester)
    formData.append("course", uploadForm.course)
    if (selectedFile) {
      formData.append("file", selectedFile)
    }

    try {
      const response = await updateResource(formData)

      if (response.success) {
        toast.success("Resource updated successfully!")
        setIsEditOpen(false)
        setEditingResource(null)
        setUploadForm({ title: "", type: "book", program: "BCA", semester: "1", course: "" })
        setSelectedFile(null)
        fetchResources()
      } else {
        toast.error(`Update failed: ${response.error || "Unknown error"}`)
      }
    } catch (error: any) {
      toast.error(error?.message || "An error occurred during update.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!window.confirm("Are you sure you want to delete this resource?")) return

    const deletePromise = async () => {
      const response = await deleteResource(id)

      if (!response.success) {
        throw new Error(response.error || "Failed to delete resource")
      }

      fetchResources()
      return "File has been deleted successfully"
    }

    toast.promise(deletePromise(), {
      loading: "Processing resource deletion...",
      success: (msg) => msg,
      error: (err) => err.message,
    })
  }

  // Filter available courses in single form based on selected program and semester
  const availableCoursesInForm = useMemo(() => {
    return coursesFromDb.filter((c) => {
      const progMatch = (c.program || "BCA").toUpperCase() === (uploadForm.program || "BCA").toUpperCase()
      const semMatch = !uploadForm.semester || Number(c.semester) === Number(uploadForm.semester)
      return progMatch && semMatch
    })
  }, [coursesFromDb, uploadForm.program, uploadForm.semester])

  // Get courses matching a specific row's program and semester
  const getCoursesForRow = (progCode: string, sem: string) => {
    return coursesFromDb.filter((c) => {
      const progMatch = (c.program || "BCA").toUpperCase() === (progCode || "BCA").toUpperCase()
      const semMatch = !sem || Number(c.semester) === Number(sem)
      return progMatch && semMatch
    })
  }

  // ---------------------------------------------------------------------------
  // Bulk Upload Functions
  // ---------------------------------------------------------------------------

  const handleFilesAdded = (files: FileList | File[]) => {
    const fileArray = Array.from(files)
    if (fileArray.length === 0) return

    const newItems: BulkResourceItem[] = fileArray.map((file) => {
      const cleanTitle = file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ")
      const isOversized = file.size > 10 * 1024 * 1024
      const matchingCourses = getCoursesForRow(presetProgram, presetSemester)

      return {
        id: Math.random().toString(36).substring(2, 9),
        file,
        title: cleanTitle,
        program: presetProgram || "BCA",
        semester: presetSemester || "1",
        course: matchingCourses[0]?.code || "",
        type: presetType || "book",
        fileError: isOversized ? "File exceeds 10MB limit" : null,
      }
    })

    setBulkItems((prev) => [...prev, ...newItems])
    toast.success(`Added ${newItems.length} file(s) to batch list`)
  }

  const handleApplyPresetsToAll = () => {
    if (bulkItems.length === 0) {
      toast.info("Add some files first to apply presets")
      return
    }

    setBulkItems((prev) =>
      prev.map((item) => {
        const matchingCourses = getCoursesForRow(presetProgram, presetSemester)
        return {
          ...item,
          program: presetProgram,
          semester: presetSemester,
          type: presetType,
          course: matchingCourses[0]?.code || item.course,
        }
      })
    )
    toast.success("Applied preset Program, Semester & Type to all rows!")
  }

  const handleRemoveBulkItem = (id: string) => {
    setBulkItems((prev) => prev.filter((item) => item.id !== id))
  }

  const handleUpdateBulkItem = (id: string, field: keyof BulkResourceItem, value: any) => {
    setBulkItems((prev) =>
      prev.map((item) => {
        if (item.id !== id) return item
        const updated = { ...item, [field]: value }

        // If program or semester changed, re-sync course if current course is no longer valid
        if (field === "program" || field === "semester") {
          const avail = getCoursesForRow(
            field === "program" ? value : item.program,
            field === "semester" ? value : item.semester
          )
          if (!avail.some((c) => c.code === updated.course)) {
            updated.course = avail[0]?.code || ""
          }
        }

        return updated
      })
    )
  }

  const handleBulkUploadSubmit = async () => {
    if (bulkItems.length === 0) {
      toast.error("Please add at least one file to upload")
      return
    }

    const hasErrors = bulkItems.some((item) => item.fileError)
    if (hasErrors) {
      toast.error("Please remove or replace files that exceed the 10MB limit")
      return
    }

    const missingCourse = bulkItems.some((item) => !item.course)
    if (missingCourse) {
      toast.error("Please assign a course to every resource row before uploading")
      return
    }

    setIsBulkUploading(true)
    const formData = new FormData()

    // Append all files
    bulkItems.forEach((item) => {
      formData.append("files", item.file)
    })

    // Append metadata JSON
    const metadata = bulkItems.map((item) => ({
      resourceTitle: item.title.trim() || item.file.name.replace(/\.[^/.]+$/, ""),
      resourceType: item.type,
      semester: item.semester,
      course: item.course,
      program: item.program,
    }))
    formData.append("items", JSON.stringify(metadata))

    try {
      const response = await bulkAddResources(formData)

      if (response.success) {
        toast.success(response.data?.message || `${bulkItems.length} resources uploaded successfully!`)
        setIsBulkOpen(false)
        setBulkItems([])
        fetchResources()
      } else {
        toast.error(`Bulk upload failed: ${response.error || "Unknown error"}`)
      }
    } catch (err: any) {
      toast.error(err?.message || "An error occurred during bulk upload.")
    } finally {
      setIsBulkUploading(false)
    }
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">
            Upload and manage textbooks, notes, and question papers across programs
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Bulk Upload Button */}
          <Dialog open={isBulkOpen} onOpenChange={(open) => {
            setIsBulkOpen(open)
            if (!open) {
              setBulkItems([])
            }
          }}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent border-primary/40 hover:bg-primary/5">
                <Files className="h-4 w-4 text-primary" />
                Bulk Upload
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px] w-[95vw] max-h-[90vh] flex flex-col p-6 overflow-hidden">
              <DialogHeader>
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderUp className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle className="text-lg">Bulk Resource Upload (Batch Mode)</DialogTitle>
                    <DialogDescription>
                      Upload and configure multiple study materials at once across programs and semesters
                    </DialogDescription>
                  </div>
                </div>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 pr-1 my-2">
                {/* Drag & Drop Multi-file Upload Box */}
                <div
                  className={`flex cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed p-6 transition-colors ${isDragging
                      ? "border-primary bg-primary/10"
                      : "border-border/80 hover:border-primary/50 hover:bg-muted/30"
                    }`}
                  onDragOver={(e) => {
                    e.preventDefault()
                    setIsDragging(true)
                  }}
                  onDragLeave={() => setIsDragging(false)}
                  onDrop={(e) => {
                    e.preventDefault()
                    setIsDragging(false)
                    if (e.dataTransfer.files) {
                      handleFilesAdded(e.dataTransfer.files)
                    }
                  }}
                  onClick={() => bulkFileInputRef.current?.click()}
                >
                  <CloudUpload className="h-10 w-10 text-primary/70 mb-2" />
                  <p className="text-sm font-semibold">
                    Click to browse or drag & drop multiple files (PDFs, Images)
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Upload up to 20 files at once • Maximum 10MB per file
                  </p>
                  <input
                    ref={bulkFileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files) {
                        handleFilesAdded(e.target.files)
                        e.target.value = ""
                      }
                    }}
                    accept=".pdf,image/*"
                  />
                  <Button variant="outline" size="sm" className="mt-3 bg-transparent pointer-events-none">
                    Select Multiple Files
                  </Button>
                </div>

                {/* Quick Presets Bar */}
                {bulkItems.length > 0 && (
                  <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-2">
                    <div className="flex items-center justify-between">
                      <Label className="text-xs font-semibold uppercase tracking-wider text-primary flex items-center gap-1.5">
                        <Sparkles className="h-3.5 w-3.5" />
                        Quick-Fill Presets for All Rows
                      </Label>
                      <span className="text-[11px] text-muted-foreground">
                        Set once, then click Apply
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-4 gap-2 pt-1">
                      <Select value={presetProgram} onValueChange={(v) => {
                        setPresetProgram(v)
                        setPresetSemester("1")
                      }}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Preset Program" />
                        </SelectTrigger>
                        <SelectContent>
                          {programs.map((p) => (
                            <SelectItem key={p.code} value={p.code}>
                              {p.code} - {p.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={presetSemester} onValueChange={setPresetSemester}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Preset Semester" />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({ length: maxSemestersInPreset }, (_, i) => i + 1).map((sem) => (
                            <SelectItem key={sem} value={sem.toString()}>
                              Semester {sem}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>

                      <Select value={presetType} onValueChange={setPresetType}>
                        <SelectTrigger className="h-8 text-xs bg-background">
                          <SelectValue placeholder="Preset Type" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="book">Textbook</SelectItem>
                          <SelectItem value="notes">Notes</SelectItem>
                          <SelectItem value="paper">Question Paper</SelectItem>
                        </SelectContent>
                      </Select>

                      <Button
                        type="button"
                        size="sm"
                        variant="secondary"
                        className="h-8 text-xs font-semibold"
                        onClick={handleApplyPresetsToAll}
                      >
                        Apply to All Rows
                      </Button>
                    </div>
                  </div>
                )}

                {/* Batch Items List */}
                {bulkItems.length > 0 ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-xs font-medium text-muted-foreground">
                        Configuring {bulkItems.length} Resource{bulkItems.length !== 1 ? "s" : ""}:
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs text-destructive hover:text-destructive"
                        onClick={() => setBulkItems([])}
                      >
                        Clear All
                      </Button>
                    </div>

                    <div className="space-y-2.5 max-h-[360px] overflow-y-auto pr-1">
                      {bulkItems.map((item, index) => {
                        const rowProgObj = programs.find((p) => p.code.toUpperCase() === item.program.toUpperCase())
                        const rowMaxSemesters = rowProgObj ? rowProgObj.totalSemesters : 6
                        const matchingCourses = getCoursesForRow(item.program, item.semester)

                        return (
                          <div
                            key={item.id}
                            className={`rounded-xl border p-3 bg-card shadow-xs transition-colors ${item.fileError ? "border-destructive/60 bg-destructive/5" : "border-border"
                              }`}
                          >
                            {/* File Name Header */}
                            <div className="flex items-center justify-between gap-2 pb-2 border-b border-border/40">
                              <div className="flex items-center gap-2 min-w-0">
                                <FileText className="h-4 w-4 text-primary shrink-0" />
                                <span className="text-xs font-semibold truncate max-w-[280px]">
                                  #{index + 1}: {item.file.name}
                                </span>
                                <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                                  {(item.file.size / 1024 / 1024).toFixed(2)} MB
                                </Badge>
                              </div>

                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                onClick={() => handleRemoveBulkItem(item.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            </div>

                            {/* Row Inputs */}
                            <div className="grid grid-cols-1 sm:grid-cols-12 gap-2 pt-2.5">
                              {/* Title */}
                              <div className="sm:col-span-4 min-w-0">
                                <Label className="text-[11px] text-muted-foreground">Resource Title</Label>
                                <Input
                                  value={item.title}
                                  placeholder="Resource Title"
                                  className="h-8 text-xs mt-1"
                                  onChange={(e) => handleUpdateBulkItem(item.id, "title", e.target.value)}
                                />
                              </div>

                              {/* Program */}
                              <div className="sm:col-span-2 min-w-0">
                                <Label className="text-[11px] text-muted-foreground">Program</Label>
                                <Select
                                  value={item.program}
                                  onValueChange={(val) => handleUpdateBulkItem(item.id, "program", val)}
                                >
                                  <SelectTrigger className="h-8 text-xs mt-1 w-full min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {programs.map((p) => (
                                      <SelectItem key={p.code} value={p.code}>
                                        {p.code}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Semester */}
                              <div className="sm:col-span-2 min-w-0">
                                <Label className="text-[11px] text-muted-foreground">Semester</Label>
                                <Select
                                  value={item.semester}
                                  onValueChange={(val) => handleUpdateBulkItem(item.id, "semester", val)}
                                >
                                  <SelectTrigger className="h-8 text-xs mt-1 w-full min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    {Array.from({ length: rowMaxSemesters }, (_, i) => i + 1).map((sem) => (
                                      <SelectItem key={sem} value={sem.toString()}>
                                        Sem {sem}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Course */}
                              <div className="sm:col-span-2 min-w-0">
                                <Label className="text-[11px] text-muted-foreground">Course</Label>
                                <Select
                                  value={item.course}
                                  onValueChange={(val) => handleUpdateBulkItem(item.id, "course", val)}
                                >
                                  <SelectTrigger className="h-8 text-xs mt-1 w-full min-w-0">
                                    <SelectValue placeholder={matchingCourses.length === 0 ? "No courses" : "Course"} />
                                  </SelectTrigger>
                                  <SelectContent className="max-w-[280px]">
                                    {matchingCourses.map((c) => (
                                      <SelectItem key={c.id} value={c.code}>
                                        {c.code} - {c.name}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              </div>

                              {/* Type */}
                              <div className="sm:col-span-2 min-w-0">
                                <Label className="text-[11px] text-muted-foreground">Type</Label>
                                <Select
                                  value={item.type}
                                  onValueChange={(val) => handleUpdateBulkItem(item.id, "type", val)}
                                >
                                  <SelectTrigger className="h-8 text-xs mt-1 w-full min-w-0">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="book">Textbook</SelectItem>
                                    <SelectItem value="notes">Notes</SelectItem>
                                    <SelectItem value="paper">Question Paper</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>

                            {item.fileError && (
                              <p className="text-[11px] text-destructive mt-1.5 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                {item.fileError}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-6 text-muted-foreground">
                    <Files className="h-8 w-8 mx-auto mb-2 opacity-30" />
                    <p className="text-sm">No files selected yet. Drag & drop or click above to add resources.</p>
                  </div>
                )}
              </div>

              <DialogFooter className="pt-3 border-t border-border gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setIsBulkOpen(false)
                    setBulkItems([])
                  }}
                  disabled={isBulkUploading}
                >
                  Cancel
                </Button>
                <Button
                  onClick={handleBulkUploadSubmit}
                  disabled={isBulkUploading || bulkItems.length === 0}
                  className="gap-2 font-semibold"
                >
                  {isBulkUploading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading {bulkItems.length} Resources to Cloud...
                    </>
                  ) : (
                    <>
                      <CloudUpload className="h-4 w-4" />
                      Upload All {bulkItems.length > 0 ? `(${bulkItems.length})` : ""} Resources
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Single Upload Dialog */}
          <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Upload Resource
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[520px] w-[95vw] overflow-hidden">
              <DialogHeader>
                <div className="flex items-center justify-between pr-6">
                  <div>
                    <DialogTitle>Upload New Resource</DialogTitle>
                    <DialogDescription>
                      Add a new textbook, notes, or question paper to the digital library
                    </DialogDescription>
                  </div>
                </div>
                <div className="mt-2 rounded-lg bg-primary/5 border border-primary/20 p-2.5 flex items-center justify-between">
                  <div className="text-xs text-muted-foreground flex items-center gap-1.5">
                    <Files className="h-3.5 w-3.5 text-primary" />
                    <span>Have multiple PDFs with different courses?</span>
                  </div>
                  <Button
                    type="button"
                    variant="link"
                    size="sm"
                    className="h-auto p-0 text-xs font-semibold text-primary underline"
                    onClick={() => {
                      setIsUploadOpen(false)
                      setIsBulkOpen(true)
                    }}
                  >
                    Switch to Bulk Upload
                  </Button>
                </div>
              </DialogHeader>
              <div className="grid gap-4 py-4 max-w-full">
                <div className="space-y-2 min-w-0">
                  <Label htmlFor="title">Resource Title</Label>
                  <Input
                    id="title"
                    placeholder="Enter resource title"
                    value={uploadForm.title}
                    onChange={(e) =>
                      setUploadForm((prev) => ({ ...prev, title: e.target.value }))
                    }
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label>Program</Label>
                    <Select
                      value={uploadForm.program}
                      onValueChange={(value) =>
                        setUploadForm((prev) => ({ ...prev, program: value, course: "" }))
                      }
                    >
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder="Select program" />
                      </SelectTrigger>
                      <SelectContent>
                        {programs.map((p) => (
                          <SelectItem key={p.code} value={p.code}>
                            {p.code} - {p.name}
                          </SelectItem>
                        ))}
                        {programs.length === 0 && (
                          <SelectItem value="BCA">BCA</SelectItem>
                        )}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2 min-w-0">
                    <Label>Resource Type</Label>
                    <Select
                      value={uploadForm.type}
                      onValueChange={(value) =>
                        setUploadForm((prev) => ({ ...prev, type: value }))
                      }
                    >
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="book">Textbook</SelectItem>
                        <SelectItem value="notes">Notes</SelectItem>
                        <SelectItem value="paper">Question Paper</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                  <div className="space-y-2 min-w-0">
                    <Label>Semester</Label>
                    <Select
                      value={uploadForm.semester}
                      onValueChange={(value) =>
                        setUploadForm((prev) => ({ ...prev, semester: value, course: "" }))
                      }
                    >
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder="Select semester" />
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

                  <div className="space-y-2 min-w-0">
                    <Label>Course</Label>
                    <Select
                      value={uploadForm.course}
                      onValueChange={(value) =>
                        setUploadForm((prev) => ({ ...prev, course: value }))
                      }
                    >
                      <SelectTrigger className="w-full min-w-0">
                        <SelectValue placeholder={availableCoursesInForm.length === 0 ? "No courses" : "Select course"} />
                      </SelectTrigger>
                      <SelectContent className="max-w-[340px]">
                        {availableCoursesInForm.map((course) => (
                          <SelectItem key={course.id} value={course.code}>
                            {course.code} - {course.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2 min-w-0">
                  <Label>File Upload (PDF / Image)</Label>
                  <div
                    className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-6 transition-colors hover:border-primary/50 hover:bg-muted/30 w-full"
                    onClick={() => document.getElementById('file-upload')?.click()}
                  >
                    <CloudUpload className="h-8 w-8 text-muted-foreground" />
                    <p className="mt-2 text-sm font-medium text-center truncate max-w-[90%]">
                      {selectedFile ? selectedFile.name : "Click to browse or drag & drop"}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {selectedFile ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB` : "PDF, Image (JPEG, PNG)"}
                    </p>
                    <input
                      id="file-upload"
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
                          if (file.size > 400 * 1024 * 1024) {
                            setFileError("File is too large! Maximum allowed size is 10MB.")
                          } else {
                            setFileError(null)
                          }
                        }
                      }}
                      accept=".pdf,image/*"
                    />
                    {!selectedFile && (
                      <Button variant="outline" size="sm" className="mt-3 bg-transparent">
                        Choose File
                      </Button>
                    )}
                  </div>
                  {fileError && <p className="text-xs font-medium text-destructive mt-1 text-center">{fileError}</p>}
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => {
                  setIsUploadOpen(false)
                  setFileError(null)
                }} disabled={isUploading}>
                  Cancel
                </Button>
                <Button onClick={handleUpload} disabled={isUploading || !!fileError || !selectedFile}>
                  {isUploading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Uploading...
                    </>
                  ) : (
                    "Upload Resource"
                  )}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Edit Resource Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setEditingResource(null)
            setSelectedFile(null)
          }
        }}>
          <DialogContent className="sm:max-w-[500px] w-[95vw] overflow-hidden">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Update the resource details or replace the file
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-w-full">
              <div className="space-y-2 min-w-0">
                <Label htmlFor="edit-title">Resource Title</Label>
                <Input
                  id="edit-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label>Program</Label>
                  <Select
                    value={uploadForm.program}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, program: value, course: "" }))}
                  >
                    <SelectTrigger className="w-full min-w-0">
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

                <div className="space-y-2 min-w-0">
                  <Label>Resource Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
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
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 min-w-0">
                <div className="space-y-2 min-w-0">
                  <Label>Semester</Label>
                  <Select
                    value={uploadForm.semester}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: value, course: "" }))}
                  >
                    <SelectTrigger className="w-full min-w-0">
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

                <div className="space-y-2 min-w-0">
                  <Label>Course</Label>
                  <Select
                    value={uploadForm.course}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, course: value }))}
                  >
                    <SelectTrigger className="w-full min-w-0">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="max-w-[340px]">
                      {availableCoursesInForm.map((course) => (
                        <SelectItem key={course.id} value={course.code}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2 min-w-0">
                <Label>Replace File (Optional)</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-4 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  onClick={() => document.getElementById('edit-file-upload')?.click()}
                >
                  <CloudUpload className="h-6 w-6 text-muted-foreground" />
                  <p className="mt-1 text-xs font-medium">
                    {selectedFile ? selectedFile.name : "Click to select a new file"}
                  </p>
                  <input
                    id="edit-file-upload"
                    type="file"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0] || null
                      setSelectedFile(file)
                      if (file && file.size > 400 * 1024 * 1024) {
                        setFileError("File is too large! Maximum allowed size is 10MB.")
                      } else {
                        setFileError(null)
                      }
                    }}
                    accept=".pdf,image/*"
                  />
                </div>
                {fileError && <p className="text-xs font-medium text-destructive mt-1 text-center">{fileError}</p>}
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => {
                setIsEditOpen(false)
                setFileError(null)
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpdate} disabled={isUploading || !!fileError}>
                {isUploading ? "Updating..." : "Update Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Search and Program Filter */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search resources by title or course..."
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

      {/* Resources Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Resources</CardTitle>
          <CardDescription>
            {filteredResources.length} resource{filteredResources.length !== 1 ? "s" : ""} found
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Title</TableHead>
                <TableHead>Program</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Course</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead>Upload Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    Loading resources...
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-10">
                    No resources found.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedResources.map((resource) => (
                  <TableRow key={resource._id}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <a
                          href={resource.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="max-w-[200px] truncate font-medium hover:underline hover:text-primary"
                        >
                          {resource.resourceTitle}
                        </a>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="font-bold">
                        {resource.program || "BCA"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="capitalize">
                        {resource.resourceType}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <code className="text-xs">{resource.course}</code>
                    </TableCell>
                    <TableCell>Semester {resource.semester}</TableCell>
                    <TableCell>
                      {new Date(resource.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingResource(resource)
                            setUploadForm({
                              title: resource.resourceTitle,
                              type: resource.resourceType,
                              program: (resource.program || "BCA").toUpperCase(),
                              semester: resource.semester.toString(),
                              course: resource.course
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
                          onClick={() => handleDelete(resource._id)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredResources.length)} of {filteredResources.length} resources
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
