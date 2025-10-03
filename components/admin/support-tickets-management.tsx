"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Textarea } from "@/components/ui/textarea"
import { Edit, Phone, MessageCircle, CheckCircle, Clock, AlertCircle, User, Calendar } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

// Support Ticket interface
interface SupportTicket {
  _id: string
  name: string
  phoneNumber: string
  telegramUsername?: string
  category: string
  subject: string
  message: string
  status: "open" | "in-progress" | "resolved" | "closed"
  priority: "low" | "medium" | "high" | "urgent"
  ticketId: string
  assignedTo?: string
  resolution?: string
  createdAt: string
  updatedAt: string
}

export function SupportTicketsManagement() {
  const [tickets, setTickets] = useState<SupportTicket[]>([])
  const [filteredTickets, setFilteredTickets] = useState<SupportTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingTicket, setEditingTicket] = useState<SupportTicket | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    status: "open" as "open" | "in-progress" | "resolved" | "closed",
    priority: "medium" as "low" | "medium" | "high" | "urgent",
    assignedTo: "",
    resolution: "",
  })

  useEffect(() => {
    loadTickets()
  }, [])

  useEffect(() => {
    filterTickets()
  }, [tickets, statusFilter, categoryFilter, searchTerm])

  const loadTickets = async () => {
    try {
      setLoading(true)
      const response = await fetch("/api/support?page=1&limit=100")
      if (response.ok) {
        const data = await response.json()
        if (data.success && data.data) {
          setTickets(data.data)
        }
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load support tickets",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterTickets = () => {
    let filtered = tickets

    if (statusFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.status === statusFilter)
    }

    if (categoryFilter !== "all") {
      filtered = filtered.filter((ticket) => ticket.category === categoryFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (ticket) =>
          ticket.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.ticketId.toLowerCase().includes(searchTerm.toLowerCase()) ||
          ticket.phoneNumber.includes(searchTerm),
      )
    }

    setFilteredTickets(filtered)
  }

  const openEditDialog = (ticket: SupportTicket) => {
    setEditingTicket(ticket)
    setFormData({
      status: ticket.status,
      priority: ticket.priority,
      assignedTo: ticket.assignedTo || "",
      resolution: ticket.resolution || "",
    })
    setIsEditDialogOpen(true)
  }

  const handleEdit = async () => {
    if (!editingTicket) return

    try {
      const response = await fetch(`/api/support/${editingTicket._id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Success",
          description: "Support ticket updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingTicket(null)
        loadTickets()
      } else {
        throw new Error('Failed to update ticket')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update support ticket",
        variant: "destructive",
      })
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "open":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Open</Badge>
      case "in-progress":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">In Progress</Badge>
      case "resolved":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Resolved</Badge>
      case "closed":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Closed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case "low":
        return <Badge className="bg-gray-500/10 text-gray-500 border-gray-500/20">Low</Badge>
      case "medium":
        return <Badge className="bg-blue-500/10 text-blue-500 border-blue-500/20">Medium</Badge>
      case "high":
        return <Badge className="bg-orange-500/10 text-orange-500 border-orange-500/20">High</Badge>
      case "urgent":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Urgent</Badge>
      default:
        return <Badge variant="secondary">{priority}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "open":
        return <MessageCircle className="h-4 w-4 text-blue-500" />
      case "in-progress":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "resolved":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "closed":
        return <AlertCircle className="h-4 w-4 text-gray-500" />
      default:
        return <MessageCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const stats = {
    total: tickets.length,
    open: tickets.filter((t) => t.status === "open").length,
    inProgress: tickets.filter((t) => t.status === "in-progress").length,
    resolved: tickets.filter((t) => t.status === "resolved").length,
    closed: tickets.filter((t) => t.status === "closed").length,
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading support tickets...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Support Tickets Management</h2>
          <p className="text-muted-foreground">Manage customer support requests and inquiries</p>
        </div>
      </div>

      {/* Support Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
            <MessageCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All support requests</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
            <MessageCircle className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-500">{stats.open}</div>
            <p className="text-xs text-muted-foreground">Awaiting response</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">In Progress</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">Being worked on</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.resolved}</div>
            <p className="text-xs text-muted-foreground">Successfully resolved</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Closed</CardTitle>
            <AlertCircle className="h-4 w-4 text-gray-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{stats.closed}</div>
            <p className="text-xs text-muted-foreground">Closed tickets</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div>
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, subject, ticket ID, or phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="category-filter">Category</Label>
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="general">General Questions</SelectItem>
                  <SelectItem value="visa">Visa Applications</SelectItem>
                  <SelectItem value="technical">Technical Support</SelectItem>
                  <SelectItem value="booking">Consultation Booking</SelectItem>
                  <SelectItem value="billing">Billing & Refunds</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Support Tickets Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Support Tickets ({filteredTickets.length})</CardTitle>
          <CardDescription>Manage customer support requests</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ticket ID</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Subject</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Priority</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredTickets.map((ticket) => (
                <TableRow key={ticket._id}>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{ticket.ticketId}</code>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <div className="font-medium">{ticket.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <Phone className="h-3 w-3 text-muted-foreground" />
                        <span className="text-sm">{ticket.phoneNumber}</span>
                      </div>
                      {ticket.telegramUsername && (
                        <div className="flex items-center gap-2">
                          <MessageCircle className="h-3 w-3 text-muted-foreground" />
                          <span className="text-sm">{ticket.telegramUsername}</span>
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {ticket.category.replace("-", " ")}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="max-w-xs">
                      <div className="font-medium truncate">{ticket.subject}</div>
                      <div className="text-sm text-muted-foreground truncate">{ticket.message}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(ticket.status)}
                      {getStatusBadge(ticket.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    {getPriorityBadge(ticket.priority)}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{new Date(ticket.createdAt).toLocaleDateString()}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(ticket)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Update Support Ticket</DialogTitle>
            <DialogDescription>Update ticket status, priority, and resolution</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="open">Open</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-priority">Priority</Label>
              <Select
                value={formData.priority}
                onValueChange={(value: any) => setFormData({ ...formData, priority: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="urgent">Urgent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-assigned">Assigned To</Label>
              <Input
                id="edit-assigned"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                placeholder="Support agent name"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-resolution">Resolution Notes</Label>
              <Textarea
                id="edit-resolution"
                value={formData.resolution}
                onChange={(e) => setFormData({ ...formData, resolution: e.target.value })}
                placeholder="Add resolution notes or solution details..."
                rows={3}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Ticket</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
