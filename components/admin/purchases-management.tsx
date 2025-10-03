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
import { Edit, DollarSign, CreditCard, Clock, CheckCircle, XCircle } from "lucide-react"
import { api, type Purchase } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function PurchasesManagement() {
  const [purchases, setPurchases] = useState<Purchase[]>([])
  const [filteredPurchases, setFilteredPurchases] = useState<Purchase[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingPurchase, setEditingPurchase] = useState<Purchase | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [searchTerm, setSearchTerm] = useState("")
  const { toast } = useToast()

  const [formData, setFormData] = useState({
    status: "pending" as "pending" | "completed" | "failed",
    amount: 0,
    method: "",
  })

  useEffect(() => {
    loadPurchases()
  }, [])

  useEffect(() => {
    filterPurchases()
  }, [purchases, statusFilter, searchTerm])

  const loadPurchases = async () => {
    try {
      const response = await api.getPurchases()
      if (response.success && response.data) {
        setPurchases(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load purchases",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterPurchases = () => {
    let filtered = purchases

    if (statusFilter !== "all") {
      filtered = filtered.filter((purchase) => purchase.status === statusFilter)
    }

    if (searchTerm) {
      filtered = filtered.filter(
        (purchase) =>
          purchase.service.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.txn_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          purchase.chat_id.includes(searchTerm),
      )
    }

    setFilteredPurchases(filtered)
  }

  const handleEdit = async () => {
    if (!editingPurchase) return

    try {
      const response = await api.updatePurchase(editingPurchase._id, formData)
      if (response.success) {
        toast({
          title: "Success",
          description: "Purchase updated successfully",
        })
        setIsEditDialogOpen(false)
        setEditingPurchase(null)
        loadPurchases()
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update purchase",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (purchase: Purchase) => {
    setEditingPurchase(purchase)
    setFormData({
      status: purchase.status,
      amount: purchase.amount,
      method: purchase.method,
    })
    setIsEditDialogOpen(true)
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Completed</Badge>
      case "pending":
        return <Badge className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">Pending</Badge>
      case "failed":
        return <Badge className="bg-red-500/10 text-red-500 border-red-500/20">Failed</Badge>
      default:
        return <Badge variant="secondary">{status}</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "completed":
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />
      case "failed":
        return <XCircle className="h-4 w-4 text-red-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const stats = {
    total: purchases.length,
    completed: purchases.filter((p) => p.status === "completed").length,
    pending: purchases.filter((p) => p.status === "pending").length,
    failed: purchases.filter((p) => p.status === "failed").length,
    totalRevenue: purchases.filter((p) => p.status === "completed").reduce((sum, p) => sum + p.amount, 0),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading purchases...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Purchases Management</h2>
          <p className="text-muted-foreground">Monitor and manage customer purchases</p>
        </div>
      </div>

      {/* Purchase Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">All time purchases</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-500">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">
              {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}% success rate
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-500">{stats.pending}</div>
            <p className="text-xs text-muted-foreground">Awaiting processing</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <XCircle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{stats.failed}</div>
            <p className="text-xs text-muted-foreground">Failed transactions</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalRevenue.toLocaleString()} ETB</div>
            <p className="text-xs text-muted-foreground">From completed purchases</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by service, transaction ID, or chat ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="w-48">
              <Label htmlFor="status-filter">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Purchases Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Purchases ({filteredPurchases.length})</CardTitle>
          <CardDescription>Manage customer purchase transactions</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Service</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Method</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Transaction ID</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPurchases.map((purchase) => (
                <TableRow key={purchase._id}>
                  <TableCell>
                    <div className="font-medium">Chat ID: {purchase.chat_id}</div>
                  </TableCell>
                  <TableCell>
                    <div>
                      <div className="font-medium">{purchase.service.displayName}</div>
                      <div className="text-sm text-muted-foreground">{purchase.service.name}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      {purchase.amount.toLocaleString()} {purchase.currency}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{purchase.method.toUpperCase()}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(purchase.status)}
                      {getStatusBadge(purchase.status)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <code className="text-sm bg-muted px-2 py-1 rounded">{purchase.txn_id}</code>
                  </TableCell>
                  <TableCell>{new Date(purchase.date).toLocaleDateString()}</TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openEditDialog(purchase)}>
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
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Purchase</DialogTitle>
            <DialogDescription>Update purchase status and details</DialogDescription>
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
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-amount">Amount</Label>
              <Input
                id="edit-amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: Number(e.target.value) })}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-method">Payment Method</Label>
              <Input
                id="edit-method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                placeholder="e.g., cbe, tele-birr"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEdit}>Update Purchase</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
