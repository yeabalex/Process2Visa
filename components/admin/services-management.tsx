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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Plus, Edit, Trash2, DollarSign, Settings, Image } from "lucide-react"
import { api, type Service } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function ServicesManagement() {
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingService, setEditingService] = useState<Service | null>(null)
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    name: "",
    displayName: "",
    description: "",
    price: 0,
    currency: "ETB",
    image: "",
  })

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    try {
      const response = await api.getServices()
      if (response.success && response.data) {
        setServices(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load services",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const response = await api.createService(formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Service created successfully",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        loadServices()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to create service",
        variant: "destructive",
      })
    }
  }

  const handleEdit = async () => {
    if (!editingService) return

    try {
      const updatedService = { ...editingService, ...formData }
      const response = await api.updateService(updatedService)
      if (response.success) {
        toast({
          title: "Success",
          description: "Service updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingService(null)
        resetForm()
        loadServices()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update service",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this service?")) return

    try {
      const response = await api.deleteService(id)
      if (response.success) {
        toast({
          title: "Success",
          description: "Service deleted successfully",
        })
        loadServices()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete service",
        variant: "destructive",
      })
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      displayName: "",
      description: "",
      price: 0,
      currency: "ETB",
      image: "",
    })
  }

  const openEditDialog = (service: Service) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      displayName: service.displayName,
      description: service.description,
      price: service.price,
      currency: service.currency,
      image: service.image || "",
    })
    setIsEditDialogOpen(true)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading services...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Services Management</h2>
          <p className="text-muted-foreground">Manage your consultation services and pricing</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Service
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Service</DialogTitle>
              <DialogDescription>Add a new consultation service to your offerings</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Service Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., premium_plan"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the service..."
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Background Image URL</Label>
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                  placeholder="https://example.com/image.jpg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Price</Label>
                  <Input
                    id="price"
                    type="number"
                    value={formData.price}
                    onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="currency">Currency</Label>
                  <Input
                    id="currency"
                    value={formData.currency}
                    onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                    placeholder="ETB"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreate}>Create Service</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Services Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Services</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{services.length}</div>
            <p className="text-xs text-muted-foreground">Active service offerings</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Price</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0
                ? Math.round(services.reduce((sum, s) => sum + s.price, 0) / services.length).toLocaleString()
                : 0}{" "}
              ETB
            </div>
            <p className="text-xs text-muted-foreground">Across all services</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Price Range</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {services.length > 0
                ? `${Math.min(...services.map((s) => s.price)).toLocaleString()} - ${Math.max(
                    ...services.map((s) => s.price),
                  ).toLocaleString()}`
                : "0 - 0"}{" "}
              ETB
            </div>
            <p className="text-xs text-muted-foreground">Min - Max pricing</p>
          </CardContent>
        </Card>
      </div>

      {/* Services Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Services</CardTitle>
          <CardDescription>Manage your consultation service offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Service</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Image</TableHead>
                <TableHead>Created</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {services.map((service) => (
                <TableRow key={service._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{service.displayName}</div>
                      <div className="text-sm text-muted-foreground">{service.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs truncate">{service.description}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="secondary">
                      {service.price.toLocaleString()} {service.currency}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {service.image ? (
                      <div className="flex items-center gap-2">
                        <Image className="h-4 w-4 text-green-500" />
                        <span className="text-sm text-green-600">Yes</span>
                      </div>
                    ) : (
                      <span className="text-sm text-muted-foreground">No</span>
                    )}
                  </TableCell>
                  <TableCell>{new Date(service.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="outline" size="sm" onClick={() => openEditDialog(service)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDelete(service._id)}
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

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Service</DialogTitle>
            <DialogDescription>Update the service details</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-name">Service Name</Label>
              <Input
                id="edit-name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the service..."
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-image">Background Image URL</Label>
              <Input
                id="edit-image"
                value={formData.image}
                onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                placeholder="https://example.com/image.jpg"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="edit-price">Price</Label>
                <Input
                  id="edit-price"
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="edit-currency">Currency</Label>
                <Input
                  id="edit-currency"
                  value={formData.currency}
                  onChange={(e) => setFormData({ ...formData, currency: e.target.value })}
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Service</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
