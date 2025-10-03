"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Progress } from "@/components/ui/progress"
import { Plus, Edit, Trash2, BookOpen, Globe, Play, Clock, CheckCircle, Eye, FileText } from "lucide-react"
import { api, type Course, type Service, type CourseModule, type CourseItem, type ContentBlock } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { RichTextEditor } from "@/components/ui/rich-text-editor"

export function CoursesManagement() {
  const [courses, setCourses] = useState<Course[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredCourses, setFilteredCourses] = useState<Course[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingCourse, setEditingCourse] = useState<Course | null>(null)
  const [viewingCourse, setViewingCourse] = useState<Course | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    progress: 0,
    country: "",
    serviceId: "", // Changed from service object to service ID string
    service: { _id: "", name: "" }, // Keep for display purposes
    modules: [] as CourseModule[],
  })

  const [newModule, setNewModule] = useState({
    id: "",
    title: "",
    description: "",
    expanded: false,
    items: [] as CourseItem[],
  })

  const [newItem, setNewItem] = useState({
    id: "",
    title: "",
    type: "video" as const,
    completed: false,
    duration: "",
    description: "",
    content: {
      title: "",
      description: "",
      blocks: [] as ContentBlock[],
      deadline: "",
      points: "",
      status: "active",
    },
  })

  const [currentModuleIndex, setCurrentModuleIndex] = useState<number | null>(null)

  useEffect(() => {
    loadCourses()
    loadServices()
  }, [])

  useEffect(() => {
    filterCourses()
  }, [courses, searchTerm])

  const loadCourses = async () => {
    try {
      const response = await api.getCourses()
      if (response.success && response.data) {
        setCourses(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load courses",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const loadServices = async () => {
    try {
      const response = await api.getServices()
      if (response.success && response.data) {
        setServices(response.data)
      }
    } catch (error) {
      console.error("Failed to load services:", error)
    }
  }

  const filterCourses = () => {
    let filtered = courses

    if (searchTerm) {
      filtered = filtered.filter(
        (course) =>
          course.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
          course.service?.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    setFilteredCourses(filtered)
  }

  const handleCreate = async () => {
    try {
      // Validate required fields
      if (!formData.progress || formData.progress < 0 || formData.progress > 100) {
        toast({
          title: "Error",
          description: "Progress must be between 0 and 100",
          variant: "destructive",
        })
        return
      }

      if (!formData.country.trim()) {
        toast({
          title: "Error",
          description: "Country is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.serviceId) {
        toast({
          title: "Error",
          description: "Please select a service",
          variant: "destructive",
        })
        return
      }

      // Find the service object from the services array
      const selectedService = services.find(service => service._id === formData.serviceId)
      if (!selectedService) {
        toast({
          title: "Error",
          description: "Please select a valid service",
          variant: "destructive",
        })
        return
      }

      const courseData = {
        progress: Number(formData.progress),
        country: formData.country.trim(),
        serviceId: selectedService._id, // Send just the ID like steps do
        module: formData.modules.map(module => ({
          ...module,
          id: module.id || `module_${Date.now()}`, // Ensure ID is present
          items: module.items.map(item => ({
            ...item,
            id: item.id || `item_${Date.now()}_${Math.random()}` // Ensure all items have IDs
          }))
        })), // Array of modules
        updatedAt: new Date().toISOString(),
      }
      const response = await api.createCourse(courseData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Course created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadCourses()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create course",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingCourse) return

    try {
      // Validate required fields
      if (!formData.progress || formData.progress < 0 || formData.progress > 100) {
        toast({
          title: "Error",
          description: "Progress must be between 0 and 100",
          variant: "destructive",
        })
        return
      }

      if (!formData.country.trim()) {
        toast({
          title: "Error",
          description: "Country is required",
          variant: "destructive",
        })
        return
      }

      if (!formData.serviceId) {
        toast({
          title: "Error",
          description: "Please select a service",
          variant: "destructive",
        })
        return
      }

      // Find the service object from the services array
      const selectedService = services.find(service => service._id === formData.serviceId)
      if (!selectedService) {
        toast({
          title: "Error",
          description: "Please select a valid service",
          variant: "destructive",
        })
        return
      }

      const updatedCourse = {
        ...editingCourse,
        progress: formData.progress,
        country: formData.country.trim(),
        serviceId: selectedService._id, // Send just the ID like steps do
        module: formData.modules.map(module => ({
          ...module,
          id: module.id || `module_${Date.now()}`, // Ensure ID is present
          items: module.items.map(item => ({
            ...item,
            id: item.id || `item_${Date.now()}_${Math.random()}` // Ensure all items have IDs
          }))
        })), // Array of modules
      }
      const response = await api.updateCourse(updatedCourse)
      if (response.success) {
        toast({
          title: "Success",
          description: "Course updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingCourse(null)
        resetForm()
        loadCourses()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update course",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this course?")) return

    try {
      const response = await api.deleteCourse(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Course deleted successfully",
        })
        loadCourses()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete course",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      progress: 0,
      country: "",
      serviceId: "", // Changed from service object to service ID string
      service: { _id: "", name: "" }, // Keep for display purposes
      modules: [],
    })
    setNewModule({
      id: "",
      title: "",
      description: "",
      expanded: false,
      items: [],
    })
    setCurrentModuleIndex(null)
  }

  const openEditDialog = (course: Course) => {
    setEditingCourse(course)
    setFormData({
      progress: course.progress,
      country: course.country,
      serviceId: course.serviceId || course.service?._id || "", // Handle both formats
      service: course.service || { _id: course.serviceId || "", name: "" }, // Keep for display purposes
      modules: course.module || [], // Use module array from API
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (course: Course) => {
    setViewingCourse(course)
    setIsViewDialogOpen(true)
  }

  const setModule = () => {
    if (!newModule.title) return

    const moduleWithId = {
      ...newModule,
      id: `module_${Date.now()}`,
      expanded: false,
      items: [],
    }

    setFormData({
      ...formData,
      modules: [...formData.modules, moduleWithId],
    })

    setNewModule({
      id: "",
      title: "",
      description: "",
      expanded: false,
      items: [],
    })
    setCurrentModuleIndex(formData.modules.length)
  }

  const addItemToModule = (moduleIndex?: number) => {
    if (!newItem.title) return

    const targetModuleIndex = moduleIndex ?? currentModuleIndex
    if (targetModuleIndex === null || targetModuleIndex >= formData.modules.length) return

    const itemWithId = {
      ...newItem,
      id: `item_${Date.now()}`,
      description: newItem.description || "",
      content: newItem.content,
    }

    const updatedModules = [...formData.modules]
    updatedModules[targetModuleIndex] = {
      ...updatedModules[targetModuleIndex],
      items: [...updatedModules[targetModuleIndex].items, itemWithId],
    }

    setFormData({
      ...formData,
      modules: updatedModules,
    })

    setNewItem({
      id: "",
      title: "",
      type: "video",
      completed: false,
      duration: "",
      description: "",
      content: {
        title: "",
        description: "",
        blocks: [],
        deadline: "",
        points: "",
        status: "active",
      },
    })
  }

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-500"
    if (progress >= 50) return "text-yellow-500"
    return "text-red-500"
  }

  const stats = {
    total: courses.length,
    completed: courses.filter((c) => c.progress === 100).length,
    inProgress: courses.filter((c) => c.progress > 0 && c.progress < 100).length,
    notStarted: courses.filter((c) => c.progress === 0).length,
    averageProgress:
      courses.length > 0 ? Math.round(courses.reduce((sum, c) => sum + c.progress, 0) / courses.length) : 0,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading courses...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Courses Management</h2>
          <p className="text-muted-foreground">Manage educational courses and modules</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Course
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Create New Course</DialogTitle>
              <DialogDescription>Add a new educational course with rich content. Fields marked with <span className="text-destructive">*</span> are required.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-6 py-4">
              {/* Basic Course Information */}
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="progress">Progress (%) <span className="text-destructive">*</span></Label>
                  <Input
                    id="progress"
                    type="number"
                    min="0"
                    max="100"
                    value={formData.progress}
                    onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="country">Country <span className="text-destructive">*</span></Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    placeholder="e.g., USA, Canada"
                  />
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="service">Service <span className="text-destructive">*</span></Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => {
                    const selectedService = services.find(service => service._id === value)
                    if (selectedService) {
                      setFormData({
                        ...formData,
                        serviceId: selectedService._id,
                        service: {
                          _id: selectedService._id,
                          name: selectedService.name,
                        }
                      })
                    }
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a service" />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((service) => (
                      <SelectItem key={service._id} value={service._id}>
                        {service.displayName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Module Creation - Multiple Modules per Course */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Course Modules</h4>
                <div className="space-y-4">
                  {/* New Module Form */}
                  <div className="border rounded-lg p-4 bg-muted/20">
                    <h5 className="font-medium mb-3">Add New Module</h5>
                    <div className="grid gap-3">
                      <div className="grid gap-2">
                        <Label htmlFor="new-module-title">Module Title <span className="text-destructive">*</span></Label>
                        <Input
                          id="new-module-title"
                          value={newModule.title}
                          onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                          placeholder="Enter module title..."
                        />
                      </div>
                      <div className="grid gap-2">
                        <Label htmlFor="new-module-description">Module Description</Label>
                        <Textarea
                          id="new-module-description"
                          value={newModule.description}
                          onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                          placeholder="Enter module description..."
                          rows={2}
                        />
                      </div>
                      <Button type="button" onClick={setModule} size="sm" className="self-start">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Module
                      </Button>
                    </div>
                  </div>

                  {/* Existing Modules */}
                  {formData.modules.length > 0 && (
                    <div className="space-y-3">
                      <h5 className="font-medium">Course Modules ({formData.modules.length})</h5>
                      {formData.modules.map((module, moduleIndex) => (
                        <Card key={module.id} className="relative">
                          <CardHeader className="pb-3">
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <CardTitle className="text-base">{module.title}</CardTitle>
                                {module.description && (
                                  <CardDescription className="mt-1">{module.description}</CardDescription>
                                )}
                              </div>
                              <Badge variant="outline">{module.items.length} items</Badge>
                            </div>
                          </CardHeader>
                          <CardContent className="pt-0">
                            {/* Module Items */}
                            {module.items.length > 0 && (
                              <div className="mb-4">
                                <h6 className="font-medium mb-2 text-sm">Module Items</h6>
                                <div className="space-y-2">
                                  {module.items.map((item) => (
                                    <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                      <div className="flex items-center gap-2">
                                        <span className="font-medium">{item.title}</span>
                                        <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                        {item.duration && <span className="text-muted-foreground">• {item.duration}</span>}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Add Item to Module */}
                            <div className="border-t pt-3">
                              <h6 className="font-medium mb-2 text-sm">Add Item to Module</h6>
                              <div className="grid gap-2 mb-2">
                                <Input
                                  value={newItem.title}
                                  onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                  placeholder="Item title..."
                                />
                              </div>
                              <div className="grid gap-2 mb-2">
                                <Label htmlFor="create-item-description" className="text-xs">Item Description</Label>
                                <Textarea
                                  id="create-item-description"
                                  value={newItem.description}
                                  onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                  placeholder="Item description..."
                                  rows={2}
                                />
                              </div>
                              <div className="grid grid-cols-4 gap-2 mb-2">
                                <select
                                  value={newItem.type}
                                  onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                                  className="px-2 py-1 border rounded text-sm"
                                >
                                  <option value="video">Video</option>
                                  <option value="reading">Reading</option>
                                  <option value="assignment">Assignment</option>
                                  <option value="quiz">Quiz</option>
                                  <option value="lab">Lab</option>
                                </select>
                                <Input
                                  value={newItem.duration}
                                  onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                                  placeholder="Duration"
                                />
                                <Input
                                  value={newItem.content.points}
                                  onChange={(e) => setNewItem({ 
                                    ...newItem, 
                                    content: { ...newItem.content, points: e.target.value } 
                                  })}
                                  placeholder="Points"
                                />
                                <Button
                                  type="button"
                                  onClick={() => addItemToModule(moduleIndex)}
                                  size="sm"
                                  className="text-xs"
                                >
                                  Add Item
                                </Button>
                              </div>
                              <div className="border-t pt-2 mt-2">
                                <Label className="text-xs font-medium text-muted-foreground mb-2 block">Item Content</Label>
                                <RichTextEditor
                                  content={newItem.content.blocks || []}
                                  onChange={(content) => {
                                    setNewItem({
                                      ...newItem,
                                      content: { ...newItem.content, blocks: content }
                                    })
                                  }}
                                  placeholder="Add rich content for this item..."
                                />
                              </div>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Course</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Course Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All courses</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">100% progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Play className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Partially completed</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <Clock className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">0% progress</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Progress</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${getProgressColor(stats.averageProgress)}`}>
              {stats.averageProgress}%
            </div>
            <p className="text-xs text-muted-foreground">Overall completion</p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Courses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by country or service..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Courses Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Courses ({filteredCourses.length})</CardTitle>
          <CardDescription>Manage educational course content</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Modules</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredCourses.map((course) => (
                <TableRow key={course._id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{course.country}</div>
                        <div className="text-sm text-muted-foreground">Study destination</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{course.service?.name || 'Unknown Service'}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Progress value={course.progress} className="flex-1" />
                        <span className={`text-sm font-medium ${getProgressColor(course.progress)}`}>
                          {course.progress}%
                        </span>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div className="font-medium">{course.module.length} modules</div>
                      <div className="text-muted-foreground">
                        {course.module.reduce((sum, m) => sum + m.items.length, 0)} items total
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{new Date(course.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openViewDialog(course)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(course)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(course._id)}
                        className="text-destructive hover:text-destructive"
                      >
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

      {/* View Course Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Course Details</DialogTitle>
            <DialogDescription>Complete course information and modules</DialogDescription>
          </DialogHeader>
          {viewingCourse && (
            <div className="grid gap-6 py-4 max-h-96 overflow-y-auto">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Country</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    {viewingCourse.country}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                  <Badge variant="outline">{viewingCourse.service?.name || 'Unknown Service'}</Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Progress</Label>
                  <div className="flex items-center gap-2">
                    <Progress value={viewingCourse.progress} className="flex-1" />
                    <span className={`text-sm font-medium ${getProgressColor(viewingCourse.progress)}`}>
                      {viewingCourse.progress}%
                    </span>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Course Modules</Label>
                <div className="space-y-4 mt-2">
                  {viewingCourse.module.map((module, index) => (
                    <Card key={module.id}>
                      <CardHeader className="pb-2">
                        <CardTitle className="text-lg">{module.title}</CardTitle>
                        <CardDescription>{module.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          {module.items.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                {item.type === "video" && <Play className="h-4 w-4" />}
                                {item.type === "text" && <BookOpen className="h-4 w-4" />}
                                <div>
                                  <div className="font-medium">{item.title}</div>
                                  <div className="text-sm text-muted-foreground">
                                    {item.type} • {item.duration}
                                  </div>
                                </div>
                              </div>
                              {item.completed && <CheckCircle className="h-4 w-4 text-green-500" />}
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Course</DialogTitle>
            <DialogDescription>Update course details and content. Fields marked with <span className="text-destructive">*</span> are required.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            {/* Basic Course Information */}
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-progress">Progress (%) <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-progress"
                  type="number"
                  min="0"
                  max="100"
                  value={formData.progress}
                  onChange={(e) => setFormData({ ...formData, progress: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-country">Country <span className="text-destructive">*</span></Label>
                <Input
                  id="edit-country"
                  value={formData.country}
                  onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="edit-service">Service <span className="text-destructive">*</span></Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => {
                  const selectedService = services.find(service => service._id === value)
                  if (selectedService) {
                    setFormData({
                      ...formData,
                      serviceId: selectedService._id,
                      service: {
                        _id: selectedService._id,
                        name: selectedService.name,
                      }
                    })
                  }
                }}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {services.map((service) => (
                    <SelectItem key={service._id} value={service._id}>
                      {service.displayName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Module Information - Multiple Modules per Course */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-2">Course Modules</h4>
              <div className="space-y-4">
                {/* New Module Form for Edit */}
                <div className="border rounded-lg p-4 bg-muted/20">
                  <h5 className="font-medium mb-3">Add New Module</h5>
                  <div className="grid gap-3">
                    <div className="grid gap-2">
                      <Label htmlFor="edit-new-module-title">Module Title <span className="text-destructive">*</span></Label>
                      <Input
                        id="edit-new-module-title"
                        value={newModule.title}
                        onChange={(e) => setNewModule({ ...newModule, title: e.target.value })}
                        placeholder="Enter module title..."
                      />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="edit-new-module-description">Module Description</Label>
                      <Textarea
                        id="edit-new-module-description"
                        value={newModule.description}
                        onChange={(e) => setNewModule({ ...newModule, description: e.target.value })}
                        placeholder="Enter module description..."
                        rows={2}
                      />
                    </div>
                    <Button type="button" onClick={setModule} size="sm" className="self-start">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Module
                    </Button>
                  </div>
                </div>

                {/* Existing Modules for Edit */}
                {formData.modules.length > 0 && (
                  <div className="space-y-3">
                    <h5 className="font-medium">Course Modules ({formData.modules.length})</h5>
                    {formData.modules.map((module, moduleIndex) => (
                      <Card key={module.id} className="relative">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-base">{module.title}</CardTitle>
                              {module.description && (
                                <CardDescription className="mt-1">{module.description}</CardDescription>
                              )}
                            </div>
                            <Badge variant="outline">{module.items.length} items</Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="pt-0">
                          {/* Module Items */}
                          {module.items.length > 0 && (
                            <div className="mb-4">
                              <h6 className="font-medium mb-2 text-sm">Module Items</h6>
                              <div className="space-y-2">
                                {module.items.map((item) => (
                                  <div key={item.id} className="flex items-center justify-between p-2 bg-muted/50 rounded text-sm">
                                    <div className="flex items-center gap-2">
                                      <span className="font-medium">{item.title}</span>
                                      <Badge variant="outline" className="text-xs">{item.type}</Badge>
                                      {item.duration && <span className="text-muted-foreground">• {item.duration}</span>}
                                    </div>
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Add Item to Module */}
                          <div className="border-t pt-3">
                            <h6 className="font-medium mb-2 text-sm">Add Item to Module</h6>
                            <div className="grid gap-2 mb-2">
                              <Input
                                value={newItem.title}
                                onChange={(e) => setNewItem({ ...newItem, title: e.target.value })}
                                placeholder="Item title..."
                              />
                            </div>
                            <div className="grid gap-2 mb-2">
                              <Label htmlFor="item-description" className="text-xs">Item Description</Label>
                              <Textarea
                                id="item-description"
                                value={newItem.description}
                                onChange={(e) => setNewItem({ ...newItem, description: e.target.value })}
                                placeholder="Item description..."
                                rows={2}
                              />
                            </div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                              <select
                                value={newItem.type}
                                onChange={(e) => setNewItem({ ...newItem, type: e.target.value as any })}
                                className="px-2 py-1 border rounded text-sm"
                              >
                                <option value="video">Video</option>
                                <option value="reading">Reading</option>
                                <option value="assignment">Assignment</option>
                                <option value="quiz">Quiz</option>
                                <option value="lab">Lab</option>
                              </select>
                              <Input
                                value={newItem.duration}
                                onChange={(e) => setNewItem({ ...newItem, duration: e.target.value })}
                                placeholder="Duration"
                              />
                              <Input
                                value={newItem.content.points}
                                onChange={(e) => setNewItem({ 
                                  ...newItem, 
                                  content: { ...newItem.content, points: e.target.value } 
                                })}
                                placeholder="Points"
                              />
                              <Input
                                value={newItem.content.deadline}
                                onChange={(e) => setNewItem({ 
                                  ...newItem, 
                                  content: { ...newItem.content, deadline: e.target.value } 
                                })}
                                placeholder="Deadline (YYYY-MM-DD)"
                              />
                              <Button
                                type="button"
                                onClick={() => addItemToModule(moduleIndex)}
                                size="sm"
                                className="text-xs"
                              >
                                Add Item
                              </Button>
                            </div>
                            <div className="border-t pt-2 mt-2">
                              <Label className="text-xs font-medium text-muted-foreground mb-2 block">Item Content</Label>
                              <RichTextEditor
                                content={newItem.content.blocks || []}
                                onChange={(content) => {
                                  setNewItem({
                                    ...newItem,
                                    content: { ...newItem.content, blocks: content }
                                  })
                                }}
                                placeholder="Add rich content for this item..."
                              />
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Course</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
