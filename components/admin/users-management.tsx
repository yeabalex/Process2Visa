"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Users, UserCheck, GraduationCap, Globe, Phone, Mail, Calendar, Eye } from "lucide-react"
import { api, type User } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

export function UsersManagement() {
  const [users, setUsers] = useState<User[]>([])
  const [filteredUsers, setFilteredUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadUsers()
  }, [])

  useEffect(() => {
    filterUsers()
  }, [users, searchTerm])

  const loadUsers = async () => {
    try {
      const response = await api.getUsers()
      if (response.success && response.data) {
        setUsers(response.data)
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const filterUsers = () => {
    let filtered = users

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.phoneNumber.includes(searchTerm) ||
          user.nationality.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.telegramChatId.includes(searchTerm),
      )
    }

    setFilteredUsers(filtered)
  }

  const openViewDialog = (user: User) => {
    setSelectedUser(user)
    setIsViewDialogOpen(true)
  }

  const getEducationBadge = (level: string) => {
    const colors = {
      "High School": "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Bachelor: "bg-green-500/10 text-green-500 border-green-500/20",
      Master: "bg-purple-500/10 text-purple-500 border-purple-500/20",
      PhD: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    }
    return (
      <Badge className={colors[level as keyof typeof colors] || "bg-gray-500/10 text-gray-500 border-gray-500/20"}>
        {level}
      </Badge>
    )
  }

  const stats = {
    total: users.length,
    thisMonth: users.filter((u) => {
      const userDate = new Date(u.createdAt)
      const now = new Date()
      return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear()
    }).length,
    educationLevels: users.reduce(
      (acc, user) => {
        acc[user.educationLevel] = (acc[user.educationLevel] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
    topCountries: users.reduce(
      (acc, user) => {
        acc[user.preferredCountry] = (acc[user.preferredCountry] || 0) + 1
        return acc
      },
      {} as Record<string, number>,
    ),
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-muted-foreground">Loading users...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold text-foreground">Users Management</h2>
          <p className="text-muted-foreground">View and manage registered users</p>
        </div>
      </div>

      {/* User Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
            <p className="text-xs text-muted-foreground">Registered users</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New This Month</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.thisMonth}</div>
            <p className="text-xs text-muted-foreground">New registrations</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Education</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.educationLevels).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most common level</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Top Destination</CardTitle>
            <Globe className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Object.entries(stats.topCountries).sort(([, a], [, b]) => b - a)[0]?.[0] || "N/A"}
            </div>
            <p className="text-xs text-muted-foreground">Most preferred country</p>
          </CardContent>
        </Card>
      </div>

      {/* Education Level Distribution */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Education Level Distribution</CardTitle>
            <CardDescription>User education backgrounds</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.educationLevels)
                .sort(([, a], [, b]) => b - a)
                .map(([level, count]) => (
                  <div key={level} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {getEducationBadge(level)}
                      <span className="text-sm">{level}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">({Math.round((count / stats.total) * 100)}%)</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Top Preferred Countries</CardTitle>
            <CardDescription>Most popular study destinations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {Object.entries(stats.topCountries)
                .sort(([, a], [, b]) => b - a)
                .slice(0, 5)
                .map(([country, count]) => (
                  <div key={country} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{country}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-medium">{count}</div>
                      <div className="text-xs text-muted-foreground">({Math.round((count / stats.total) * 100)}%)</div>
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="search">Search</Label>
              <Input
                id="search"
                placeholder="Search by name, email, phone, nationality, or chat ID..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Users Table */}
      <Card>
        <CardHeader>
          <CardTitle>All Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Registered user accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Education</TableHead>
                <TableHead>Preferred Country</TableHead>
                <TableHead>Nationality</TableHead>
                <TableHead>Registered</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user._id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.fullName}</div>
                      <div className="text-sm text-muted-foreground">Age: {user.age}</div>
                      <div className="text-xs text-muted-foreground">Chat: {user.telegramChatId}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1">
                      <div className="flex items-center gap-1 text-sm">
                        <Mail className="h-3 w-3" />
                        {user.email}
                      </div>
                      <div className="flex items-center gap-1 text-sm">
                        <Phone className="h-3 w-3" />
                        {user.phoneNumber}
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{getEducationBadge(user.educationLevel)}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Globe className="h-4 w-4 text-muted-foreground" />
                      {user.preferredCountry}
                    </div>
                  </TableCell>
                  <TableCell>{user.nationality}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Calendar className="h-3 w-3" />
                      {new Date(user.createdAt).toLocaleDateString()}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="outline" size="sm" onClick={() => openViewDialog(user)}>
                      <Eye className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* View User Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>User Details</DialogTitle>
            <DialogDescription>Complete user information</DialogDescription>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-6 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Full Name</Label>
                  <div className="text-lg font-medium">{selectedUser.fullName}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Age</Label>
                  <div className="text-lg">{selectedUser.age} years old</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Email</Label>
                  <div className="flex items-center gap-2">
                    <Mail className="h-4 w-4 text-muted-foreground" />
                    {selectedUser.email}
                  </div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Phone</Label>
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4 text-muted-foreground" />
                    {selectedUser.phoneNumber}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Nationality</Label>
                  <div>{selectedUser.nationality}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Preferred Country</Label>
                  <div className="flex items-center gap-2">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    {selectedUser.preferredCountry}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Education Level</Label>
                  <div>{getEducationBadge(selectedUser.educationLevel)}</div>
                </div>
                <div>
                  <Label className="text-sm font-medium text-muted-foreground">Telegram Chat ID</Label>
                  <code className="bg-muted px-2 py-1 rounded text-sm">{selectedUser.telegramChatId}</code>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium text-muted-foreground">Registration Date</Label>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  {new Date(selectedUser.createdAt).toLocaleString()}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
