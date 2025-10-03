"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Sidebar } from "@/components/student-sidebar"
import { StepCard } from "@/components/step-card"
import { NotificationBanner } from "@/components/notification-banner"
import { Bell, GraduationCap, ChevronRight } from "lucide-react"
import { getIconByName } from "@/lib/icons"
import { useAuth } from "@/context/AuthContext"

export interface Step {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  icon: React.ComponentType<{ className?: string }>
  checklist: {
    id: string
    task: string
    completed: boolean
    deadline?: string
  }[]
  helpText: string
}

// Removed defaultSteps dummy data. Steps will be fetched from API.

export function StudentDashboard() {
  const [steps, setSteps] = useState<Step[]>([])
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const params = useParams()
  const router = useRouter()
  const { chatId } = useAuth()

  const serviceId = (params?.service as string) || undefined

  const handleStepClick = (stepIndex: number) => {
    const stepNumber = stepIndex + 1
    router.push(`/${serviceId}/${stepNumber}`)
  }

  useEffect(() => {
    const fetchSteps = async () => {
      if (!chatId || !serviceId) return
      try {
        const res = await fetch(`/api/get-steps?userId=${encodeURIComponent(chatId)}&serviceId=${encodeURIComponent(serviceId)}`)
        if (!res.ok) return
        const data = await res.json()
        const iconMap: Record<string, Step["icon"]> = {
          "book-open": getIconByName("book-open"),
          "file-text": getIconByName("file-text"),
          "send": getIconByName("send"),
          "award": getIconByName("award"),
          "plane": getIconByName("plane"),
          "map-pin": getIconByName("map-pin"),
          "graduation-cap": getIconByName("graduation-cap"),
          "bell": getIconByName("bell"),
          "search": getIconByName("search"),
          "users": getIconByName("users"),
          "briefcase": getIconByName("briefcase"),
          "building": getIconByName("building"),
          "globe": getIconByName("globe"),
          "calendar": getIconByName("calendar"),
          "clock": getIconByName("clock"),
          "check-circle": getIconByName("check-circle"),
          "star": getIconByName("star"),
          "heart": getIconByName("heart"),
          "shield": getIconByName("shield"),
          "target": getIconByName("target"),
          "trending-up": getIconByName("trending-up"),
          "zap": getIconByName("zap"),
          "lightbulb": getIconByName("lightbulb"),
          "rocket": getIconByName("rocket"),
          "anchor": getIconByName("anchor"),
          "compass": getIconByName("compass"),
          "flag": getIconByName("flag"),
          "trophy": getIconByName("trophy"),
          "medal": getIconByName("medal"),
          "gift": getIconByName("gift"),
          "package": getIconByName("package"),
          "shopping-cart": getIconByName("shopping-cart"),
          "credit-card": getIconByName("credit-card"),
          "wallet": getIconByName("wallet"),
          "piggy-bank": getIconByName("piggy-bank"),
          "calculator": getIconByName("calculator"),
          "bar-chart": getIconByName("bar-chart"),
          "pie-chart": getIconByName("pie-chart"),
          "activity": getIconByName("activity"),
          "settings": getIconByName("settings"),
          "tool": getIconByName("tool"),
          "wrench": getIconByName("wrench"),
          "hammer": getIconByName("hammer"),
          "screwdriver": getIconByName("screwdriver"),
          "pen-tool": getIconByName("pen-tool"),
          "edit": getIconByName("edit"),
          "file": getIconByName("file"),
          "folder": getIconByName("folder"),
          "archive": getIconByName("archive"),
          "bookmark": getIconByName("bookmark"),
          "tag": getIconByName("tag"),
          "camera": getIconByName("camera"),
          "image": getIconByName("image"),
          "video": getIconByName("video"),
          "music": getIconByName("music"),
          "headphones": getIconByName("headphones"),
          "speaker": getIconByName("speaker"),
          "mic": getIconByName("mic"),
          "phone": getIconByName("phone"),
          "mail": getIconByName("mail"),
          "message-square": getIconByName("message-square"),
          "at-sign": getIconByName("at-sign"),
          "hash": getIconByName("hash"),
          "link": getIconByName("link"),
          "external-link": getIconByName("external-link"),
          "download": getIconByName("download"),
          "upload": getIconByName("upload"),
          "save": getIconByName("save"),
          "share": getIconByName("share"),
          "more-horizontal": getIconByName("more-horizontal"),
          "more-vertical": getIconByName("more-vertical"),
          "plus": getIconByName("plus"),
          "minus": getIconByName("minus"),
          "x": getIconByName("x"),
          "check": getIconByName("check"),
          "alert-circle": getIconByName("alert-circle"),
          "alert-triangle": getIconByName("alert-triangle"),
          "info": getIconByName("info"),
          "help-circle": getIconByName("help-circle"),
          "chevron-down": getIconByName("chevron-down"),
          "chevron-up": getIconByName("chevron-up"),
          "chevron-left": getIconByName("chevron-left"),
          "chevron-right": getIconByName("chevron-right"),
          "arrow-up": getIconByName("arrow-up"),
          "arrow-down": getIconByName("arrow-down"),
          "arrow-left": getIconByName("arrow-left"),
          "arrow-right": getIconByName("arrow-right"),
          "move": getIconByName("move"),
          "rotate-ccw": getIconByName("rotate-ccw"),
          "rotate-cw": getIconByName("rotate-cw"),
          "refresh-cw": getIconByName("refresh-cw"),
          "repeat": getIconByName("repeat"),
          "shuffle": getIconByName("shuffle"),
          "skip-back": getIconByName("skip-back"),
          "skip-forward": getIconByName("skip-forward"),
          "play": getIconByName("play"),
          "pause": getIconByName("pause"),
          "square": getIconByName("square"),
          "circle": getIconByName("circle"),
          "triangle": getIconByName("triangle"),
          "hexagon": getIconByName("hexagon"),
          "octagon": getIconByName("octagon"),
          "sun": getIconByName("sun"),
          "moon": getIconByName("moon"),
          "cloud": getIconByName("cloud"),
          "cloud-rain": getIconByName("cloud-rain"),
          "cloud-snow": getIconByName("cloud-snow"),
          "cloud-lightning": getIconByName("cloud-lightning"),
          "wind": getIconByName("wind"),
          "droplets": getIconByName("droplets"),
          "flame": getIconByName("flame"),
          "battery": getIconByName("battery"),
          "battery-charging": getIconByName("battery-charging"),
          "cpu": getIconByName("cpu"),
          "hard-drive": getIconByName("hard-drive"),
          "monitor": getIconByName("monitor"),
          "smartphone": getIconByName("smartphone"),
          "tablet": getIconByName("tablet"),
          "laptop": getIconByName("laptop"),
          "keyboard": getIconByName("keyboard"),
          "mouse": getIconByName("mouse"),
          "home": getIconByName("home"),
          "building2": getIconByName("building2"),
          "warehouse": getIconByName("warehouse"),
          "store": getIconByName("store"),
          "shopping-bag": getIconByName("shopping-bag"),
          "truck": getIconByName("truck"),
          "car": getIconByName("car"),
          "bus": getIconByName("bus"),
          "train": getIconByName("train"),
          "ship": getIconByName("ship"),
          "eye": getIconByName("eye"),
          "eye-off": getIconByName("eye-off"),
          "maximize": getIconByName("maximize"),
          "minimize": getIconByName("minimize"),
        }
        const mapped: Step[] = (data.steps ?? []).map((s: any) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          status: s.status,
          icon: iconMap[s.icon] ?? getIconByName("book-open"),
          checklist: (s.checklist ?? []).map((c: any) => ({
            id: c.id,
            task: c.task,
            completed: !!c.completed,
            deadline: c.deadline ? new Date(c.deadline).toISOString() : undefined,
          })),
          helpText: s.helpText ?? "",
        }))
        if (mapped.length) setSteps(mapped)
      } catch (e) {
        console.error(e)
      }
    }
    fetchSteps()
  }, [chatId, serviceId])

  const completedSteps = steps.filter((step) => step.status === "completed").length
  const totalSteps = steps.length
  const progressPercentage = totalSteps > 0 ? (completedSteps / totalSteps) * 100 : 0

  const toggleChecklistItem = (stepId: string, checklistId: string) => {
    setSteps((prevSteps) =>
      prevSteps.map((step) =>
        step.id === stepId
          ? {
              ...step,
              checklist: step.checklist.map((item) =>
                item.id === checklistId ? { ...item, completed: !item.completed } : item,
              ),
            }
          : step,
      ),
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar open={sidebarOpen} onOpenChange={setSidebarOpen} />

      <div className="lg:pl-64">
        <header className="border-b border-border bg-card/50 px-4 py-4 lg:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground">Study Abroad Journey</h1>
              <p className="text-sm text-muted-foreground">Track your application progress</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              className="lg:hidden bg-transparent"
              onClick={() => setSidebarOpen(true)}
            >
              <Bell className="h-4 w-4" />
            </Button>
          </div>
        </header>

        <main className="p-4 lg:p-6">
          <NotificationBanner />

          <div className="mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <GraduationCap className="h-5 w-5 text-primary" />
                  Overall Progress
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">
                      {completedSteps} of {totalSteps} steps completed
                    </span>
                    <span className="font-medium">{Math.round(progressPercentage)}%</span>
                  </div>
                  <Progress value={progressPercentage} className="h-2" />
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            {steps.map((step, index) => (
              <div
                key={step.id}
                className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer transition-colors"
                onClick={() => handleStepClick(index)}
              >
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-muted-foreground">Step {index + 1}</span>
                    <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <step.icon className="h-4 w-4 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{step.title}</h3>
                    <p className="text-sm text-muted-foreground">{step.description}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={
                    step.status === "completed"
                      ? "px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800"
                      : step.status === "in-progress"
                        ? "px-2 py-1 rounded-full text-xs font-medium bg-accent text-accent-foreground"
                        : "px-2 py-1 rounded-full text-xs font-medium bg-muted text-muted-foreground"
                  }>
                    {step.status === "completed" ? "Completed" : step.status === "in-progress" ? "In Progress" : "Not Started"}
                  </span>
                  <ChevronRight className="h-5 w-5 text-muted-foreground" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  )
}
