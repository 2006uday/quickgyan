"use client"

import { useState, useEffect } from "react"
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
} from "@/components/ui/dialog"
import { resources, semesters, allCourses } from "@/lib/mock-data"
import {
  Upload,
  FileText,
  Search,
  Pencil,
  Trash2,
  Plus,
  CloudUpload,
} from "lucide-react"
import { toast } from "sonner"
import { useAuth } from "@/lib/auth-context"

export default function AdminResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "",
    semester: "",
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

  const {
    getResources,
    getCourses,
    addResource,
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
        // Map backend field names ("Course Name", "Course Code") to UI expectation
        const formatted = (data || []).map((c: any) => ({
          id: c._id,
          name: c["Course Name"],
          code: c["Course Code"],
          semester: c["Semester"]
        }))
        setCoursesFromDb(formatted)
      }
    } catch (error) {
      console.error("Failed to fetch courses:", error)
    }
  }

  useEffect(() => {
    fetchResources()
    fetchCourses()
  }, [])

  const filteredResources = realResources.filter(
    (resource) =>
      resource.resourceTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.course.toLowerCase().includes(searchQuery.toLowerCase())
  )

  // Reset to first page when search changes
  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery])

  // Pagination logic
  const totalPages = Math.ceil(filteredResources.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedResources = filteredResources.slice(startIndex, startIndex + itemsPerPage)

  const handleUpload = async () => {
    if (fileError) {
      toast.error(fileError)
      return
    }
    if (!selectedFile || !uploadForm.title || !uploadForm.type || !uploadForm.semester || !uploadForm.course) {
      alert("Please fill in all fields and select a file")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("resourceTitle", uploadForm.title)
    formData.append("resourceType", uploadForm.type)
    formData.append("semester", uploadForm.semester)
    formData.append("course", uploadForm.course)
    formData.append("file", selectedFile)

    try {
      const response = await addResource(formData)

      if (response.success) {
        toast.success("Resource uploaded successfully!")
        setIsUploadOpen(false)
        setUploadForm({ title: "", type: "", semester: "", course: "" })
        setSelectedFile(null)
        fetchResources() // Refresh the list
      } else {
        toast.error(`Upload failed: ${response.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Upload error:", error)
      alert("An error occurred during upload. Please check the console.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleUpdate = async () => {
    if (fileError) {
      toast.error(fileError)
      return
    }
    if (!editingResource || !uploadForm.title || !uploadForm.type || !uploadForm.semester || !uploadForm.course) {
      alert("Please fill in all fields")
      return
    }

    setIsUploading(true)
    const formData = new FormData()
    formData.append("id", editingResource._id)
    formData.append("resourceTitle", uploadForm.title)
    formData.append("resourceType", uploadForm.type)
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
        setUploadForm({ title: "", type: "", semester: "", course: "" })
        setSelectedFile(null)
        fetchResources()
      } else {
        toast.error(`Update failed: ${response.error || "Unknown error"}`)
      }
    } catch (error) {
      console.error("Update error:", error)
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
      return "file has been delete successfully"
    }

    toast.promise(deletePromise(), {
      loading: "Processing resource deletion...",
      success: (msg) => msg,
      error: (err) => err.message,
    })
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Resource Management</h1>
          <p className="text-muted-foreground">
            Upload and manage educational resources
          </p>
        </div>
        <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Resource
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Upload New Resource</DialogTitle>
              <DialogDescription>
                Add a new book, notes, or question paper to the library
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
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

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value) =>
                      setUploadForm((prev) => ({ ...prev, type: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Textbook</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="paper">Question Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={uploadForm.semester}
                    onValueChange={(value) =>
                      setUploadForm((prev) => ({ ...prev, semester: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select semester" />
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

              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={uploadForm.course}
                  onValueChange={(value) =>
                    setUploadForm((prev) => ({ ...prev, course: value }))
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select course" />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesFromDb
                      .filter(
                        (c) =>
                          !uploadForm.semester ||
                          c.semester === parseInt(uploadForm.semester)
                      )
                      .map((course) => (
                        <SelectItem key={course.id} value={course.code}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>File Upload</Label>
                <div
                  className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/30"
                  onClick={() => document.getElementById('file-upload')?.click()}
                >
                  <CloudUpload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
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
                      if (file && file.size > 10 * 1024 * 1024) {
                        setFileError("File is too large! Maximum allowed size is 10MB.")
                      } else {
                        setFileError(null)
                      }
                    }}
                    accept=".pdf,image/*"
                  />
                  {!selectedFile && (
                    <Button variant="outline" size="sm" className="mt-4 bg-transparent">
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
              }}>
                Cancel
              </Button>
              <Button onClick={handleUpload} disabled={isUploading || !!fileError}>
                {isUploading ? "Uploading..." : "Upload Resource"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Resource Dialog */}
        <Dialog open={isEditOpen} onOpenChange={(open) => {
          setIsEditOpen(open)
          if (!open) {
            setEditingResource(null)
            setUploadForm({ title: "", type: "", semester: "", course: "" })
            setSelectedFile(null)
          }
        }}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Resource</DialogTitle>
              <DialogDescription>
                Update the resource details or replace the file
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Resource Title</Label>
                <Input
                  id="edit-title"
                  value={uploadForm.title}
                  onChange={(e) => setUploadForm(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Resource Type</Label>
                  <Select
                    value={uploadForm.type}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="book">Textbook</SelectItem>
                      <SelectItem value="notes">Notes</SelectItem>
                      <SelectItem value="paper">Question Paper</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Semester</Label>
                  <Select
                    value={uploadForm.semester}
                    onValueChange={(value) => setUploadForm(prev => ({ ...prev, semester: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
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

              <div className="space-y-2">
                <Label>Course</Label>
                <Select
                  value={uploadForm.course}
                  onValueChange={(value) => setUploadForm(prev => ({ ...prev, course: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {coursesFromDb
                      .filter(
                        (c) =>
                          !uploadForm.semester ||
                          c.semester === parseInt(uploadForm.semester)
                      )
                      .map((course) => (
                        <SelectItem key={course.id} value={course.code}>
                          {course.code} - {course.name}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
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
                      if (file && file.size > 5 * 1024 * 1024) { // Reverting to original 5MB for edit
                        setFileError("File is too large! Maximum allowed size is 5MB.")
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

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search resources..."
          className="pl-9"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
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
                  <TableCell colSpan={6} className="text-center py-10">
                    Loading resources...
                  </TableCell>
                </TableRow>
              ) : filteredResources.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
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
