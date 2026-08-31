"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { useAuth, Program } from "@/lib/auth-context"
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
  DialogFooter
} from "@/components/ui/dialog"
import {
  Search,
  Plus,
  Pencil,
  Trash2,
  BookOpen,
  Layers,
  GraduationCap,
  FileText,
  CheckCircle2,
  XCircle,
  PlusCircle,
  Trash
} from "lucide-react"
import { toast } from "sonner"

export default function AdminProgramsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [isAddSingleOpen, setIsAddSingleOpen] = useState(false)
  const [isAddBatchOpen, setIsAddBatchOpen] = useState(false)
  const [isEditOpen, setIsEditOpen] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [editingProgram, setEditingProgram] = useState<Program | null>(null)

  // Single program form
  const [programForm, setProgramForm] = useState({
    code: "",
    name: "",
    description: "",
    totalSemesters: "6",
    category: "Undergraduate",
    status: "active"
  })

  // Multiple programs (batch) form
  const [batchPrograms, setBatchPrograms] = useState<Array<{
    code: string
    name: string
    description: string
    totalSemesters: string
    category: string
  }>>([
    { code: "", name: "", description: "", totalSemesters: "6", category: "Undergraduate" },
    { code: "", name: "", description: "", totalSemesters: "4", category: "Postgraduate" }
  ])

  const { programs, getPrograms, addPrograms, updateProgram, deleteProgram } = useAuth()
  const [localPrograms, setLocalPrograms] = useState<Program[]>([])
  const [loading, setLoading] = useState(true)

  // Pagination state
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8

  const loadData = async () => {
    setLoading(true)
    const res = await getPrograms()
    if (res.success && res.data) {
      setLocalPrograms(res.data)
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  useEffect(() => {
    if (programs.length > 0) {
      setLocalPrograms(programs)
    }
  }, [programs])

  // Filter logic
  const filteredPrograms = localPrograms.filter((prog) => {
    const matchesSearch =
      prog.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prog.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prog.description && prog.description.toLowerCase().includes(searchQuery.toLowerCase()))

    const matchesCategory =
      categoryFilter === "all" || prog.category === categoryFilter

    const matchesStatus =
      statusFilter === "all" || prog.status === statusFilter

    return matchesSearch && matchesCategory && matchesStatus
  })

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter, statusFilter])

  const totalPages = Math.ceil(filteredPrograms.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const paginatedPrograms = filteredPrograms.slice(startIndex, startIndex + itemsPerPage)

  // Summary counts
  const totalCount = localPrograms.length
  const activeCount = localPrograms.filter(p => p.status === "active").length
  const ugCount = localPrograms.filter(p => p.category === "Undergraduate").length
  const pgCount = localPrograms.filter(p => p.category === "Postgraduate").length

  // Add Single Program handler
  const handleAddSingle = async () => {
    if (!programForm.code.trim() || !programForm.name.trim()) {
      toast.error("Program Code and Name are required")
      return
    }

    setIsSubmitting(true)
    const res = await addPrograms({
      code: programForm.code.trim().toUpperCase(),
      name: programForm.name.trim(),
      description: programForm.description.trim(),
      totalSemesters: parseInt(programForm.totalSemesters) || 6,
      category: programForm.category,
      status: programForm.status
    })

    setIsSubmitting(false)
    if (res.success) {
      toast.success(`Program "${programForm.code.toUpperCase()}" added successfully`)
      setIsAddSingleOpen(false)
      setProgramForm({
        code: "",
        name: "",
        description: "",
        totalSemesters: "6",
        category: "Undergraduate",
        status: "active"
      })
      loadData()
    } else {
      toast.error(res.error || "Failed to add program")
    }
  }

  // Add Batch Programs handler
  const handleAddBatch = async () => {
    const validPrograms = batchPrograms.filter(p => p.code.trim() && p.name.trim())
    if (validPrograms.length === 0) {
      toast.error("Please provide valid Code and Name for at least one program")
      return
    }

    setIsSubmitting(true)
    const payload = validPrograms.map(p => ({
      code: p.code.trim().toUpperCase(),
      name: p.name.trim(),
      description: p.description.trim(),
      totalSemesters: parseInt(p.totalSemesters) || 6,
      category: p.category,
      status: "active"
    }))

    const res = await addPrograms(payload)
    setIsSubmitting(false)
    if (res.success) {
      toast.success(`${validPrograms.length} program(s) created successfully!`)
      setIsAddBatchOpen(false)
      setBatchPrograms([
        { code: "", name: "", description: "", totalSemesters: "6", category: "Undergraduate" },
        { code: "", name: "", description: "", totalSemesters: "4", category: "Postgraduate" }
      ])
      loadData()
    } else {
      toast.error(res.error || "Failed to batch add programs")
    }
  }

  const handleAddBatchRow = () => {
    setBatchPrograms(prev => [
      ...prev,
      { code: "", name: "", description: "", totalSemesters: "6", category: "Undergraduate" }
    ])
  }

  const handleRemoveBatchRow = (index: number) => {
    if (batchPrograms.length <= 1) {
      toast.info("At least one row is required")
      return
    }
    setBatchPrograms(prev => prev.filter((_, i) => i !== index))
  }

  // Update Program handler
  const handleUpdate = async () => {
    if (!editingProgram) return
    if (!programForm.code.trim() || !programForm.name.trim()) {
      toast.error("Program Code and Name are required")
      return
    }

    setIsSubmitting(true)
    const res = await updateProgram({
      id: editingProgram.id || (editingProgram as any)._id,
      code: programForm.code.trim().toUpperCase(),
      name: programForm.name.trim(),
      description: programForm.description.trim(),
      totalSemesters: parseInt(programForm.totalSemesters) || 6,
      category: programForm.category,
      status: programForm.status
    })

    setIsSubmitting(false)
    if (res.success) {
      toast.success("Program updated successfully")
      setIsEditOpen(false)
      setEditingProgram(null)
      loadData()
    } else {
      toast.error(res.error || "Failed to update program")
    }
  }

  // Delete Program handler
  const handleDelete = async (prog: Program) => {
    const courseWarn = (prog.courseCount || 0) > 0 ? ` (${prog.courseCount} courses linked)` : ""
    if (!window.confirm(`Are you sure you want to delete program "${prog.name} (${prog.code})"${courseWarn}?`)) {
      return
    }

    const res = await deleteProgram(prog.id || (prog as any)._id)
    if (res.success) {
      toast.success(`Program ${prog.code} deleted successfully`)
      loadData()
    } else {
      toast.error(res.error || "Failed to delete program")
    }
  }

  return (
    <div className="space-y-6 pb-16 lg:pb-0">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Academic Programs</h1>
          <p className="text-muted-foreground">
            Configure degrees, curriculums, and semester structures across the platform
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Add Multiple Programs Modal Trigger */}
          <Dialog open={isAddBatchOpen} onOpenChange={setIsAddBatchOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" className="gap-2 bg-transparent">
                <PlusCircle className="h-4 w-4" />
                Add Multiple Programs
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-3xl max-h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>Add Multiple Programs in Batch</DialogTitle>
                <DialogDescription>
                  Enter multiple programs simultaneously. All programs will be created and notifications broadcasted to users.
                </DialogDescription>
              </DialogHeader>

              <div className="flex-1 overflow-y-auto space-y-4 py-4 pr-1">
                {batchPrograms.map((row, idx) => (
                  <div key={idx} className="relative rounded-lg border border-border bg-card p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                        Program #{idx + 1}
                      </span>
                      {batchPrograms.length > 1 && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-6 w-6 text-destructive"
                          onClick={() => handleRemoveBatchRow(idx)}
                        >
                          <Trash className="h-3.5 w-3.5" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Program Code *</Label>
                        <Input
                          placeholder="e.g., MCA, MBA"
                          value={row.code}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchPrograms(prev => {
                              const copy = [...prev]
                              copy[idx].code = val
                              return copy
                            })
                          }}
                        />
                      </div>

                      <div className="sm:col-span-2 space-y-1">
                        <Label className="text-xs">Program Full Name *</Label>
                        <Input
                          placeholder="e.g., Master of Computer Applications"
                          value={row.name}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchPrograms(prev => {
                              const copy = [...prev]
                              copy[idx].name = val
                              return copy
                            })
                          }}
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="space-y-1">
                        <Label className="text-xs">Total Semesters</Label>
                        <Select
                          value={row.totalSemesters}
                          onValueChange={(val) => {
                            setBatchPrograms(prev => {
                              const copy = [...prev]
                              copy[idx].totalSemesters = val
                              return copy
                            })
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((s) => (
                              <SelectItem key={s} value={s.toString()}>
                                {s} Semesters
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Category</Label>
                        <Select
                          value={row.category}
                          onValueChange={(val) => {
                            setBatchPrograms(prev => {
                              const copy = [...prev]
                              copy[idx].category = val
                              return copy
                            })
                          }}
                        >
                          <SelectTrigger className="h-9">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                            <SelectItem value="Diploma">Diploma</SelectItem>
                            <SelectItem value="Certificate">Certificate</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className="space-y-1">
                        <Label className="text-xs">Description (Optional)</Label>
                        <Input
                          placeholder="Short degree summary"
                          value={row.description}
                          onChange={(e) => {
                            const val = e.target.value
                            setBatchPrograms(prev => {
                              const copy = [...prev]
                              copy[idx].description = val
                              return copy
                            })
                          }}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full border-dashed gap-1"
                  onClick={handleAddBatchRow}
                >
                  <Plus className="h-4 w-4" /> Add Another Program Row
                </Button>
              </div>

              <DialogFooter className="border-t pt-3">
                <Button variant="outline" onClick={() => setIsAddBatchOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddBatch} disabled={isSubmitting}>
                  {isSubmitting ? "Creating Programs..." : `Create ${batchPrograms.filter(p => p.code.trim()).length || ""} Programs`}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Add Single Program Modal */}
          <Dialog open={isAddSingleOpen} onOpenChange={setIsAddSingleOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="h-4 w-4" />
                Add Program
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Add New Academic Program</DialogTitle>
                <DialogDescription>
                  Define a new program curriculum with custom semesters and category.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="prog-code">Code *</Label>
                    <Input
                      id="prog-code"
                      placeholder="e.g., MCA"
                      value={programForm.code}
                      onChange={(e) =>
                        setProgramForm((prev) => ({ ...prev, code: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="prog-name">Program Full Name *</Label>
                    <Input
                      id="prog-name"
                      placeholder="e.g., Master of Computer Applications"
                      value={programForm.name}
                      onChange={(e) =>
                        setProgramForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Semesters</Label>
                    <Select
                      value={programForm.totalSemesters}
                      onValueChange={(value) =>
                        setProgramForm((prev) => ({ ...prev, totalSemesters: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            {s} Semesters
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={programForm.category}
                      onValueChange={(value) =>
                        setProgramForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Doctorate">Doctorate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="prog-desc">Description</Label>
                  <Textarea
                    id="prog-desc"
                    placeholder="Brief description about the curriculum, focus areas, or target learners"
                    rows={3}
                    value={programForm.description}
                    onChange={(e) =>
                      setProgramForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={programForm.status}
                    onValueChange={(value) =>
                      setProgramForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Visible to Students)</SelectItem>
                      <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsAddSingleOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleAddSingle} disabled={isSubmitting}>
                  {isSubmitting ? "Creating..." : "Create Program"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          {/* Edit Program Dialog */}
          <Dialog open={isEditOpen} onOpenChange={(open) => {
            setIsEditOpen(open)
            if (!open) setEditingProgram(null)
          }}>
            <DialogContent className="sm:max-w-[480px]">
              <DialogHeader>
                <DialogTitle>Edit Program</DialogTitle>
                <DialogDescription>
                  Update curriculum details and status for {editingProgram?.code}.
                </DialogDescription>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-2">
                    <Label htmlFor="edit-prog-code">Code *</Label>
                    <Input
                      id="edit-prog-code"
                      value={programForm.code}
                      onChange={(e) =>
                        setProgramForm((prev) => ({ ...prev, code: e.target.value }))
                      }
                    />
                  </div>
                  <div className="col-span-2 space-y-2">
                    <Label htmlFor="edit-prog-name">Full Name *</Label>
                    <Input
                      id="edit-prog-name"
                      value={programForm.name}
                      onChange={(e) =>
                        setProgramForm((prev) => ({ ...prev, name: e.target.value }))
                      }
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-2">
                    <Label>Total Semesters</Label>
                    <Select
                      value={programForm.totalSemesters}
                      onValueChange={(value) =>
                        setProgramForm((prev) => ({ ...prev, totalSemesters: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {[1, 2, 3, 4, 5, 6, 7, 8, 10, 12].map((s) => (
                          <SelectItem key={s} value={s.toString()}>
                            {s} Semesters
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select
                      value={programForm.category}
                      onValueChange={(value) =>
                        setProgramForm((prev) => ({ ...prev, category: value }))
                      }
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Undergraduate">Undergraduate</SelectItem>
                        <SelectItem value="Postgraduate">Postgraduate</SelectItem>
                        <SelectItem value="Diploma">Diploma</SelectItem>
                        <SelectItem value="Certificate">Certificate</SelectItem>
                        <SelectItem value="Doctorate">Doctorate</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="edit-prog-desc">Description</Label>
                  <Textarea
                    id="edit-prog-desc"
                    rows={3}
                    value={programForm.description}
                    onChange={(e) =>
                      setProgramForm((prev) => ({ ...prev, description: e.target.value }))
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={programForm.status}
                    onValueChange={(value) =>
                      setProgramForm((prev) => ({ ...prev, status: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active (Visible)</SelectItem>
                      <SelectItem value="inactive">Inactive (Hidden)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <DialogFooter>
                <Button variant="outline" onClick={() => setIsEditOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdate} disabled={isSubmitting}>
                  {isSubmitting ? "Updating..." : "Save Changes"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-primary/10 p-3 text-primary">
              <Layers className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Total Programs</p>
              <p className="text-2xl font-bold">{totalCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-green-100 p-3 text-green-700">
              <CheckCircle2 className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Active Programs</p>
              <p className="text-2xl font-bold">{activeCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-blue-100 p-3 text-blue-700">
              <GraduationCap className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Undergraduate (UG)</p>
              <p className="text-2xl font-bold">{ugCount}</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center gap-4">
            <div className="rounded-lg bg-purple-100 p-3 text-purple-700">
              <BookOpen className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Postgraduate (PG)</p>
              <p className="text-2xl font-bold">{pgCount}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search programs by code or title (e.g. BCA, Computer Applications)..."
            className="pl-9"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[170px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="Undergraduate">Undergraduate</SelectItem>
            <SelectItem value="Postgraduate">Postgraduate</SelectItem>
            <SelectItem value="Diploma">Diploma</SelectItem>
            <SelectItem value="Certificate">Certificate</SelectItem>
            <SelectItem value="Other">Other</SelectItem>
          </SelectContent>
        </Select>

        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full sm:w-[140px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Programs Table */}
      <Card>
        <CardHeader>
          <CardTitle>Configured Programs</CardTitle>
          <CardDescription>
            {filteredPrograms.length} program{filteredPrograms.length !== 1 ? "s" : ""} registered in the system
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Program</TableHead>
                <TableHead>Code</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Duration</TableHead>
                <TableHead>Courses & Resources</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    Loading academic programs...
                  </TableCell>
                </TableRow>
              ) : filteredPrograms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12 text-muted-foreground">
                    No programs found matching your filters.
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPrograms.map((prog) => (
                  <TableRow key={prog.id || (prog as any)._id}>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-semibold text-foreground">{prog.name}</span>
                        {prog.description && (
                          <span className="text-xs text-muted-foreground line-clamp-1 max-w-sm">
                            {prog.description}
                          </span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="font-mono font-bold">
                        {prog.code}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {prog.category || "Undergraduate"}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm font-medium">
                        {prog.totalSemesters} Semesters
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary" className="gap-1 text-xs">
                          <GraduationCap className="h-3 w-3" />
                          {prog.courseCount ?? 0} Courses
                        </Badge>
                        <Badge variant="outline" className="gap-1 text-xs">
                          <FileText className="h-3 w-3" />
                          {prog.resourceCount ?? 0} Res
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>
                      {prog.status === "active" ? (
                        <Badge variant="default" className="bg-emerald-600 hover:bg-emerald-700">
                          Active
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-muted-foreground">
                          Inactive
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => {
                            setEditingProgram(prog)
                            setProgramForm({
                              code: prog.code,
                              name: prog.name,
                              description: prog.description || "",
                              totalSemesters: (prog.totalSemesters || 6).toString(),
                              category: prog.category || "Undergraduate",
                              status: prog.status || "active"
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
                          onClick={() => handleDelete(prog)}
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
                Showing {startIndex + 1} to {Math.min(startIndex + itemsPerPage, filteredPrograms.length)} of {filteredPrograms.length} programs
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
