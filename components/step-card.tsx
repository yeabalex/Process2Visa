"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Checkbox } from "@/components/ui/checkbox"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ChevronDown, ChevronUp, HelpCircle, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Step } from "./student-dashboard"

interface StepCardProps {
  step: Step
  onToggleChecklistItem: (stepId: string, checklistId: string) => void
  onStepClick?: () => void
}

export function StepCard({ step, onToggleChecklistItem, onStepClick }: StepCardProps) {
  const [isOpen, setIsOpen] = useState(step.status === "in-progress")

  const Icon = step.icon
  const completedTasks = step.checklist.filter((item) => item.completed).length
  const totalTasks = step.checklist.length
  const progressPercentage = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  const getStatusColor = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "bg-green-100 text-green-800 border-green-200"
      case "in-progress":
        return "bg-accent text-accent-foreground border-accent/20"
      case "not-started":
        return "bg-muted text-muted-foreground border-border"
    }
  }

  const getStatusText = (status: Step["status"]) => {
    switch (status) {
      case "completed":
        return "Completed"
      case "in-progress":
        return "In Progress"
      case "not-started":
        return "Not Started"
    }
  }

  return (
    <Card className="transition-all duration-200 hover:shadow-md cursor-pointer" onClick={onStepClick}>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={cn(
                  "p-2 rounded-lg",
                  step.status === "completed"
                    ? "bg-green-100 text-green-600"
                    : step.status === "in-progress"
                      ? "bg-accent/20 text-accent-foreground"
                      : "bg-muted text-muted-foreground",
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <CardTitle className="text-lg leading-tight">{step.title}</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">{step.description}</p>
              </div>
            </div>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <HelpCircle className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p className="text-sm">{step.helpText}</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>

          <div className="flex items-center justify-between mt-4">
            <Badge variant="outline" className={getStatusColor(step.status)}>
              {getStatusText(step.status)}
            </Badge>
            <div className="flex items-center space-x-2">
              <span className="text-xs text-muted-foreground">
                {completedTasks}/{totalTasks} tasks
              </span>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                </Button>
              </CollapsibleTrigger>
            </div>
          </div>
        </CardHeader>

        <CollapsibleContent>
          <CardContent className="pt-0">
            <div className="space-y-3">
              {step.checklist.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start space-x-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <Checkbox
                    id={item.id}
                    checked={item.completed}
                    onCheckedChange={() => onToggleChecklistItem(step.id, item.id)}
                    className="mt-0.5"
                  />
                  <div className="flex-1 min-w-0">
                    <label
                      htmlFor={item.id}
                      className={cn(
                        "text-sm cursor-pointer",
                        item.completed ? "line-through text-muted-foreground" : "text-foreground",
                      )}
                    >
                      {item.task}
                    </label>
                    {item.deadline && (
                      <div className="flex items-center mt-1 text-xs text-muted-foreground">
                        <Calendar className="h-3 w-3 mr-1" />
                        Due: {new Date(item.deadline).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </CollapsibleContent>
      </Collapsible>
    </Card>
  )
}
