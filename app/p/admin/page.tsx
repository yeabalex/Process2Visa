"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  ShoppingCart,
  BookOpen,
  Settings,
  CheckSquare,
  TrendingUp,
  DollarSign,
  UserCheck,
  GraduationCap,
  MessageCircle,
} from "lucide-react"

import { ServicesManagement } from "@/components/admin/services-management"
import { StepsManagement } from "@/components/admin/steps-management"
import { PurchasesManagement } from "@/components/admin/purchases-management"
import { UsersManagement } from "@/components/admin/users-management"
import { CoursesManagement } from "@/components/admin/courses-management"
import { SupportTicketsManagement } from "@/components/admin/support-tickets-management"
import { useToast } from "@/hooks/use-toast"
import { api, type Purchase, type User, type Course, type Service } from "@/lib/api"

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview")
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalRevenue: 0,
    activeUsers: 0,
    completedPurchases: 0,
    activeCourses: 0,
  })
  const [recentPurchases, setRecentPurchases] = useState<Purchase[]>([])
  const { toast } = useToast()

  useEffect(() => {
    if (activeTab === "overview") {
      loadOverviewData()
    }
  }, [activeTab])

  const loadOverviewData = async () => {
    try {
      setLoading(true)

      // Load all data in parallel
      const [purchasesRes, usersRes, coursesRes, servicesRes] = await Promise.all([
        api.getPurchases(),
        api.getUsers(),
        api.getCourses(),
        api.getServices(),
      ])

      if (purchasesRes.success && purchasesRes.data) {
        const purchases = purchasesRes.data
        const completedPurchases = purchases.filter(p => p.status === "completed")

        setStats(prev => ({
          ...prev,
          totalRevenue: completedPurchases.reduce((sum, p) => sum + p.amount, 0),
          completedPurchases: completedPurchases.length,
        }))

        // Get recent purchases (last 3)
        setRecentPurchases(purchases.slice(0, 3))
      }

      if (usersRes.success && usersRes.data) {
        setStats(prev => ({
          ...prev,
          activeUsers: usersRes.data!.length,
        }))
      }

      if (coursesRes.success && coursesRes.data) {
        setStats(prev => ({
          ...prev,
          activeCourses: coursesRes.data!.length,
        }))
      }

    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to load overview data",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="flex h-16 items-center px-6">
          <div className="flex items-center space-x-4">
            <GraduationCap className="h-8 w-8 text-primary" />
            <div>
              <h1 className="text-xl font-semibold text-foreground">Admin Dashboard</h1>
              <p className="text-sm text-muted-foreground">Education Consultation Management</p>
            </div>
          </div>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 border-r border-border bg-card">
          <nav className="p-4 space-y-2">
            <Button
              variant={activeTab === "overview" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("overview")}
            >
              <TrendingUp className="mr-2 h-4 w-4" />
              Overview
            </Button>
            <Button
              variant={activeTab === "services" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("services")}
            >
              <Settings className="mr-2 h-4 w-4" />
              Services
            </Button>
            <Button
              variant={activeTab === "purchases" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("purchases")}
            >
              <ShoppingCart className="mr-2 h-4 w-4" />
              Purchases
            </Button>
            <Button
              variant={activeTab === "users" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("users")}
            >
              <Users className="mr-2 h-4 w-4" />
              Users
            </Button>
            <Button
              variant={activeTab === "courses" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("courses")}
            >
              <BookOpen className="mr-2 h-4 w-4" />
              Courses
            </Button>
            <Button
              variant={activeTab === "steps" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("steps")}
            >
              <CheckSquare className="mr-2 h-4 w-4" />
              Steps
            </Button>
            <Button
              variant={activeTab === "support" ? "default" : "ghost"}
              className="w-full justify-start"
              onClick={() => setActiveTab("support")}
            >
              <MessageCircle className="mr-2 h-4 w-4" />
              Support Tickets
            </Button>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6">
          {activeTab === "overview" && (
            <div className="space-y-6">
              <div>
                <h2 className="text-3xl font-bold text-foreground">Dashboard Overview</h2>
                <p className="text-muted-foreground">Monitor your education consultation business</p>
              </div>

              {/* Stats Cards */}
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Users</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeUsers.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Registered users</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Completed Purchases</CardTitle>
                    <UserCheck className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.completedPurchases.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Successful transactions</p>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
                    <BookOpen className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.activeCourses.toLocaleString()}</div>
                    <p className="text-xs text-muted-foreground">Available courses</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Activity */}
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Recent Purchases</CardTitle>
                    <CardDescription>Latest payment transactions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    {loading ? (
                      <div className="text-sm text-muted-foreground">Loading recent purchases...</div>
                    ) : recentPurchases.length > 0 ? (
                      <div className="space-y-4">
                        {recentPurchases.map((purchase) => (
                          <div key={purchase._id} className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">Chat ID: {purchase.chat_id}</p>
                              <p className="text-sm text-muted-foreground">{purchase.service.displayName}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{purchase.amount.toLocaleString()} {purchase.currency}</p>
                              <Badge variant={purchase.status === "completed" ? "default" : "secondary"}>
                                {purchase.status}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-sm text-muted-foreground">No recent purchases found</div>
                    )}
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>System Status</CardTitle>
                    <CardDescription>Current system health</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <span>API Status</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Online</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Database</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Connected</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Payment Gateway</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between">
                        <span>Telegram Bot</span>
                        <Badge className="bg-green-500/10 text-green-500 border-green-500/20">Running</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {activeTab === "services" && <ServicesManagement />}
          {activeTab === "purchases" && <PurchasesManagement />}
          {activeTab === "users" && <UsersManagement />}
          {activeTab === "courses" && <CoursesManagement />}
          {activeTab === "steps" && <StepsManagement />}
          {activeTab === "support" && <SupportTicketsManagement />}
        </main>
      </div>
    </div>
  )
}