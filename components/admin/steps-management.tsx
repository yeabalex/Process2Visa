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
import { Checkbox } from "@/components/ui/checkbox"
import { Plus, Edit, Trash2, CheckSquare, Clock, PlayCircle, CheckCircle, Eye, Calendar, ListTodo } from "lucide-react"
import { ICON_OPTIONS, getIconByName } from "@/lib/icons"
import { api, type Steps, type Service, type Step, type ChecklistItem } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function StepsManagement() {
  const [allSteps, setAllSteps] = useState<Steps[]>([])
  const [services, setServices] = useState<Service[]>([])
  const [filteredSteps, setFilteredSteps] = useState<Steps[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const [editingSteps, setEditingSteps] = useState<Steps | null>(null)
  const [viewingSteps, setViewingSteps] = useState<Steps | null>(null)
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    serviceId: "",
    steps: [] as Step[],
  })

  const [newStep, setNewStep] = useState({
    id: "",
    title: "",
    description: "",
    status: "not-started" as "not-started" | "in-progress" | "completed",
    icon: "search",
    checklist: [] as ChecklistItem[],
  })

  const [newChecklistItem, setNewChecklistItem] = useState({
    id: "",
    task: "",
    completed: false,
    deadline: "",
  })

  useEffect(() => {
    loadSteps()
    loadServices()
  }, [])

  useEffect(() => {
    filterSteps()
  }, [allSteps, searchTerm])

  const loadSteps = async () => {
    try {
      const response = await api.getSteps()
      if (response.success && response.data) {
        setAllSteps(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load steps",
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

  const filterSteps = () => {
    let filtered = allSteps

    if (searchTerm) {
      filtered = filtered.filter(
        (steps) =>
          steps.serviceId.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          steps.steps.some((step) => step.title.toLowerCase().includes(searchTerm.toLowerCase())),
      )
    }

    setFilteredSteps(filtered)
  }

  const handleCreate = async () => {
    try {
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

      const stepsData = {
        serviceId: {
          _id: selectedService._id,
          name: selectedService.name,
        },
        steps: formData.steps,
      }
      const response = await api.createSteps(stepsData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Steps created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadSteps()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create steps",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingSteps) return

    try {
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

      const updatedSteps = {
        ...editingSteps,
        serviceId: {
          _id: selectedService._id,
          name: selectedService.name,
        },
        steps: formData.steps,
      }
      const response = await api.updateSteps(updatedSteps)
      if (response.success) {
        toast({
          title: "Success",
          description: "Steps updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingSteps(null)
        resetForm()
        loadSteps()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update steps",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete these steps?")) return

    try {
      const response = await api.deleteSteps(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Steps deleted successfully",
        })
        loadSteps()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete steps",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      serviceId: "",
      steps: [],
    })
    setNewStep({
      id: "",
      title: "",
      description: "",
      status: "not-started",
      icon: "search",
      checklist: [],
    })
    setNewChecklistItem({
      id: "",
      task: "",
      completed: false,
      deadline: "",
    })
  }

  const openEditDialog = (steps: Steps) => {
    setEditingSteps(steps)
    setFormData({
      serviceId: steps.serviceId._id,
      steps: steps.steps,
    })
    setIsEditDialogOpen(true)
  }

  const openViewDialog = (steps: Steps) => {
    setViewingSteps(steps)
    setIsViewDialogOpen(true)
  }

  const addStep = () => {
    if (!newStep.title) return

    const stepWithId = {
      ...newStep,
      id: `step_${Date.now()}`,
    }

    setFormData({
      ...formData,
      steps: [...formData.steps, stepWithId],
    })

    setNewStep({
      id: "",
      title: "",
      description: "",
      status: "not-started",
      icon: "🔍",
      checklist: [],
    })
  }

  const addChecklistItem = (stepIndex: number) => {
    if (!newChecklistItem.task) return

    const itemWithId = {
      ...newChecklistItem,
      id: `item_${Date.now()}`,
    }

    const updatedSteps = [...formData.steps]
    updatedSteps[stepIndex].checklist.push(itemWithId)

    setFormData({
      ...formData,
      steps: updatedSteps,
    })

    setNewChecklistItem({
      id: "",
      task: "",
      completed: false,
      deadline: "",
    })
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">In Progress</Badge>
      case "not-started":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Not Started</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "in-progress":
        return <PlayCircle className="h-4 w-4 text-yellow-500" />
      case "not-started":
        return <Clock className="h-4 w-4 text-gray-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const calculateStepStats = () => {
    const allStepsFlat = allSteps.flatMap((s) => s.steps)
    return {
      total: allStepsFlat.length,
      completed: allStepsFlat.filter((s) => s.status === "completed").length,
      inProgress: allStepsFlat.filter((s) => s.status === "in-progress").length,
      notStarted: allStepsFlat.filter((s) => s.status === "not-started").length,
      totalChecklist: allStepsFlat.reduce((sum, s) => sum + s.checklist.length, 0),
      completedChecklist: allStepsFlat.reduce((sum, s) => sum + s.checklist.filter((c) => c.completed).length, 0),
    }
  }

  const stats = calculateStepStats()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading steps...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Steps Management</h2>
          <p className="text-muted-foreground">Manage service steps and checklists</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Steps
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-3xl">
            <DialogHeader>
              <DialogTitle>Create New Steps</DialogTitle>
              <DialogDescription>Add steps and checklists for a service</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4 max-h-96 overflow-y-auto">
              <div className="grid gap-2">
                <Label htmlFor="service">Service</Label>
                <Select
                  value={formData.serviceId}
                  onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
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

              {/* Step Creation */}
              <div className="border-t pt-4">
                <h4 className="font-medium mb-2">Add Step</h4>
                <div className="grid gap-2">
                  <div className="grid grid-cols-2 gap-2">
                    <Input
                      placeholder="Step title"
                      value={newStep.title}
                      onChange={(e) => setNewStep({ ...newStep, title: e.target.value })}
                    />
                    <div className="flex gap-2">
                      <Select
                        value={newStep.icon}
                        onValueChange={(value) => setNewStep({ ...newStep, icon: value })}
                      >
                        <SelectTrigger className="flex-1">
                          <SelectValue placeholder="Select an icon" />
                        </SelectTrigger>
                        <SelectContent className="max-h-60">
                          {ICON_OPTIONS.map((iconOption) => {
                            const IconComponent = iconOption.component
                            return (
                              <SelectItem key={iconOption.name} value={iconOption.name}>
                                <div className="flex items-center gap-2">
                                  <IconComponent className="h-4 w-4" />
                                  <span>{iconOption.displayName}</span>
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Textarea
                    placeholder="Step description"
                    value={newStep.description}
                    onChange={(e) => setNewStep({ ...newStep, description: e.target.value })}
                  />
                  <Select
                    value={newStep.status}
                    onValueChange={(value: any) => setNewStep({ ...newStep, status: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="not-started">Not Started</SelectItem>
                      <SelectItem value="in-progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button type="button" onClick={addStep} size="sm">
                    Add Step
                  </Button>
                </div>
              </div>

              {/* Display Added Steps */}
              {formData.steps.length > 0 && (
                <div className="border-t pt-4">
                  <h4 className="font-medium mb-2">Added Steps</h4>
                  <div className="space-y-3">
                    {formData.steps.map((step, index) => (
                      <Card key={step.id}>
                        <CardHeader className="pb-2">
                          <div className="flex items-center gap-2">
                            {(() => {
                              const IconComponent = getIconByName(step.icon || "book-open")
                              return <IconComponent className="h-5 w-5 text-primary" />
                            })()}
                            <CardTitle className="text-base">{step.title}</CardTitle>
                            {getStatusBadge(step.status)}
                          </div>
                          <CardDescription>{step.description}</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="text-sm text-muted-foreground">{step.checklist.length} checklist items</div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              )}
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Steps</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Steps Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Steps</CardTitle>
            <CheckSquare className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Finished steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <PlayCircle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Active steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Not Started</CardTitle>
            <Clock className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.notStarted}</div>
            <p className="text-xs text-muted-foreground">Pending steps</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Checklist Items</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalChecklist}</div>
            <p className="text-xs text-muted-foreground">Total tasks</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasks Done</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completedChecklist}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalChecklist > 0 ? Math.round((stats.completedChecklist / stats.totalChecklist) * 100) : 0}%
              complete
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Steps</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by service or step title..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Steps Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Steps ({filteredSteps.length})</CardTitle>
          <CardDescription>Manage service steps and checklists</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Steps Count</TableHead>
                <TableHead>Progress</TableHead>
                <TableHead>Checklist Items</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSteps.map((steps) => {
                const completedSteps = steps.steps.filter((s) => s.status === "completed").length
                const totalSteps = steps.steps.length
                const completedTasks = steps.steps.reduce(
                  (sum, s) => sum + s.checklist.filter((c) => c.completed).length,
                  0,
                )
                const totalTasks = steps.steps.reduce((sum, s) => sum + s.checklist.length, 0)

                return (
                  <TableRow key={steps._id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{steps.serviceId.name}</div>
                        <div className="text-sm text-muted-foreground">Service steps</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <CheckSquare className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{totalSteps}</span>
                        <span className="text-sm text-muted-foreground">({completedSteps} completed)</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-1">
                        <div className="text-sm">
                          Steps: {totalSteps > 0 ? Math.round((completedSteps / totalSteps) * 100) : 0}%
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Tasks: {totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <ListTodo className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{totalTasks}</span>
                        <span className="text-sm text-muted-foreground">({completedTasks} done)</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="outline" size="sm" onClick={() => openViewDialog(steps)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="outline" size="sm" onClick={() => openEditDialog(steps)}>
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(steps._id)}
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View Steps Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Steps Details</DialogTitle>
            <DialogDescription>Complete steps and checklist information</DialogDescription>
          </DialogHeader>
          {viewingSteps && (
            <div className="grid gap-6 py-4 max-h-96 overflow-y-auto">
              <div>
                <Label className="text-sm font-medium text-muted-foreground">Service</Label>
                <div className="text-lg font-medium">{viewingSteps.serviceId.name}</div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Steps</Label>
                <div className="space-y-4 mt-2">
                  {viewingSteps.steps.map((step) => (
                    <Card key={step.id}>
                      <CardHeader className="pb-2">
                        <div className="flex items-center gap-2">
                          {(() => {
                            const IconComponent = getIconByName(step.icon || "book-open")
                            return <IconComponent className="h-5 w-5 text-primary" />
                          })()}
                          <CardTitle className="text-lg">{step.title}</CardTitle>
                          {getStatusIcon(step.status)}
                          {getStatusBadge(step.status)}
                        </div>
                        <CardDescription>{step.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Checklist</Label>
                          {step.checklist.map((item) => (
                            <div key={item.id} className="flex items-center justify-between p-2 bg-muted rounded">
                              <div className="flex items-center gap-2">
                                <Checkbox checked={item.completed} disabled />
                                <div>
                                  <div className={`${item.completed ? "line-through text-muted-foreground" : ""}`}>
                                    {item.task}
                                  </div>
                                  {item.deadline && (
                                    <div className="text-sm text-muted-foreground flex items-center gap-1">
                                      <Calendar className="h-3 w-3" />
                                      Due: {new Date(item.deadline).toLocaleDateString()}
                                    </div>
                                  )}
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

      {/* Edit Dialog - Similar structure to create dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Steps</DialogTitle>
            <DialogDescription>Update steps and checklists</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-service">Service</Label>
              <Select
                value={formData.serviceId}
                onValueChange={(value) => setFormData({ ...formData, serviceId: value })}
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
            <div className="text-sm text-muted-foreground">
              Steps: {formData.steps.length} • Total checklist items:{" "}
              {formData.steps.reduce((sum, s) => sum + s.checklist.length, 0)}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Steps</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
