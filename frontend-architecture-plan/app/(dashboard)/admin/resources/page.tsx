"use client"

import { useState } from "react"
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

export default function AdminResourcesPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [uploadForm, setUploadForm] = useState({
    title: "",
    type: "",
    semester: "",
    course: "",
  })

  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      resource.courseCode.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleUpload = () => {
    // In real app, this would upload to the server
    console.log("Uploading:", uploadForm)
    setIsUploadOpen(false)
    setUploadForm({ title: "", type: "", semester: "", course: "" })
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
                    {allCourses
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
                <div className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-8 transition-colors hover:border-primary/50 hover:bg-muted/30">
                  <CloudUpload className="h-10 w-10 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">
                    Drag & drop your file here
                  </p>
                  <p className="text-xs text-muted-foreground">or click to browse</p>
                  <Button variant="outline" size="sm" className="mt-4 bg-transparent">
                    Choose File
                  </Button>
                </div>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsUploadOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleUpload}>Upload Resource</Button>
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
              {filteredResources.map((resource) => (
                <TableRow key={resource.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="max-w-[200px] truncate font-medium">
                        {resource.title}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="capitalize">
                      {resource.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <code className="text-xs">{resource.courseCode}</code>
                  </TableCell>
                  <TableCell>Semester {resource.semester}</TableCell>
                  <TableCell>
                    {new Date(resource.uploadDate).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon">
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
