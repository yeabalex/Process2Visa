"use client"

import { useState } from "react"
import { Check, ChevronDown, ChevronUp, Play, BookOpen, FileText, Code, Clock, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { CourseProgressProps, CourseItem } from "@/types/course"
import { ContentBlockRenderer } from "./content-block-renderer"
import { useCourseProgress } from "@/hooks/use-course-progress"
import { api } from "@/lib/api"

const getTypeIcon = (type: CourseItem["type"]) => {
  switch (type) {
    case "video":
      return <Play className="w-4 h-4" />
    case "reading":
      return <BookOpen className="w-4 h-4" />
    case "assignment":
      return <FileText className="w-4 h-4" />
    case "quiz":
      return <FileText className="w-4 h-4" />
    case "lab":
      return <Code className="w-4 h-4" />
    default:
      return <FileText className="w-4 h-4" />
  }
}

const getTypeLabel = (type: CourseItem["type"]) => {
  switch (type) {
    case "video":
      return "Video"
    case "reading":
      return "Reading"
    case "assignment":
      return "Assignment"
    case "quiz":
      return "Quiz"
    case "lab":
      return "Lab"
    default:
      return "Content"
  }
}

const getCompletionStatusClass = (isCompleted: boolean) => {
  return isCompleted ? "bg-green-500 text-white" : "bg-gray-200 text-gray-400"
}

const getCompletionStatusIcon = (isCompleted: boolean) => {
  return isCompleted ? <Check className="w-3 h-3" /> : null
}

export function CourseProgress({
  title,
  subtitle,
  modules,
  onItemClick,
  onModuleToggle,
  onMarkComplete,
  className,
  selectedItem,
  userId,
  serviceId,
  progress: currentProgress,
}: CourseProgressProps & {
  userId?: string;
  serviceId?: string;
  progress?: number;
}) {
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.filter((m) => m.expanded).map((m) => m.id)),
  )
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false)
  const [internalSelectedItem, setInternalSelectedItem] = useState<{ moduleId: string; itemId: string } | null>(
    selectedItem || null,
  )
  const [moduleCompletionStatus, setModuleCompletionStatus] = useState<Record<string, Record<string, boolean>>>({})

  const { markItemComplete, isUpdating } = useCourseProgress({
    userId: userId || "",
    serviceId: serviceId || "",
    progress: currentProgress || 0,
  })

  const toggleModule = (moduleId: string) => {
    const newExpanded = new Set(expandedModules)
    if (newExpanded.has(moduleId)) {
      newExpanded.delete(moduleId)
    } else {
      newExpanded.add(moduleId)
    }
    setExpandedModules(newExpanded)
    onModuleToggle?.(moduleId)
  }

  const handleItemClick = (moduleId: string, itemId: string) => {
    setInternalSelectedItem({ moduleId, itemId })
    setIsMobileSidebarOpen(false)
    onItemClick?.(moduleId, itemId)
  }

  const getSelectedItemContent = () => {
    const currentSelected = selectedItem || internalSelectedItem
    if (!currentSelected) return null

    const module = modules.find((m) => m.id === currentSelected.moduleId)
    if (!module) return null

    const item = module.items.find((i) => i.id === currentSelected.itemId)
    return item
  }

  const selectedItemContent = getSelectedItemContent()

  const handleMarkComplete = async (moduleId: string, itemId: string) => {
    // Update local state immediately for better UX
    setModuleCompletionStatus((prev) => ({
      ...prev,
      [moduleId]: {
        ...prev[moduleId],
        [itemId]: true,
      },
    }))

    console.log(`Attempting to mark item complete: ${moduleId}/${itemId}`)

    try {
      // Call the API to persist the change with the new items completed schema
      const success = await api.updateItemsCompleted(
        serviceId || "",
        userId || "",
        itemId,
        true
      )
      console.log(`API call result: ${success}`)

      if (success) {
        // Call the original callback if provided
        await onMarkComplete?.(moduleId, itemId)
      } else {
        // Revert local state if API call failed
        setModuleCompletionStatus((prev) => ({
          ...prev,
          [moduleId]: {
            ...prev[moduleId],
            [itemId]: false,
          },
        }))
      }
    } catch (error) {
      console.error('Error marking item complete:', error)
      // Revert local state if there was an error
      setModuleCompletionStatus((prev) => ({
        ...prev,
        [moduleId]: {
          ...prev[moduleId],
          [itemId]: false,
        },
      }))
    }
  }

  const isItemCompleted = (moduleId: string, itemId: string, originalCompleted: boolean) => {
    return moduleCompletionStatus[moduleId]?.[itemId] ?? originalCompleted
  }

  return (
    <div className={cn("flex h-screen bg-gray-50", className)}>
      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden"
          onClick={() => setIsMobileSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "w-full max-w-sm bg-white border-r border-gray-200 flex flex-col",
          "fixed inset-y-0 left-0 z-50 lg:relative lg:translate-x-0 transition-transform duration-300",
          isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Header */}
        <div className="p-4 border-b border-gray-200 flex-shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-blue-600 leading-tight">{title}</h2>
              {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
            </div>
            <button onClick={() => setIsMobileSidebarOpen(false)} className="lg:hidden p-1 hover:bg-gray-100 rounded">
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {modules.map((module, moduleIndex) => {
            const isExpanded = expandedModules.has(module.id)
            const completedItems = module.items.filter((item) => item.completed).length
            const totalItems = module.items.length

            return (
              <div key={module.id} className="border-b border-gray-100">
                {/* Module Header */}
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium text-gray-600">Module {moduleIndex + 1}</span>
                      </div>
                      <h3 className="font-medium text-gray-900 text-sm leading-tight">{module.title}</h3>
                      {module.description && <p className="text-xs text-gray-500 mt-1">{module.description}</p>}
                    </div>
                    <div className="ml-2">
                      {isExpanded ? (
                        <ChevronUp className="w-4 h-4 text-gray-400" />
                      ) : (
                        <ChevronDown className="w-4 h-4 text-gray-400" />
                      )}
                    </div>
                  </div>
                </button>

                {/* Module Items */}
                {isExpanded && (
                  <div className="pb-2">
                    {module.items.map((item) => {
                      const isSelected =
                        (selectedItem || internalSelectedItem)?.moduleId === module.id &&
                        (selectedItem || internalSelectedItem)?.itemId === item.id

                      const itemCompleted = isItemCompleted(module.id, item.id, item.completed)
                      const completionStatusClass = getCompletionStatusClass(itemCompleted)
                      const completionStatusIcon = getCompletionStatusIcon(itemCompleted)

                      return (
                        <button
                          key={item.id}
                          onClick={() => handleItemClick(module.id, item.id)}
                          className={cn(
                            "w-full p-3 pl-6 text-left hover:bg-gray-50 transition-colors group",
                            isSelected && "bg-blue-50 border-r-2 border-blue-500",
                          )}
                        >
                          <div className="flex items-start gap-3">
                            {/* Completion Status */}
                            <div
                              className={cn(
                                "w-5 h-5 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0",
                                completionStatusClass,
                              )}
                            >
                              {completionStatusIcon || getTypeIcon(item.type)}
                            </div>

                            {/* Item Content */}
                            <div className="flex-1 min-w-0">
                              <h4
                                className={cn(
                                  "text-sm font-medium group-hover:text-blue-600 transition-colors",
                                  isSelected ? "text-blue-600" : "text-gray-900",
                                )}
                              >
                                {item.title}
                              </h4>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-gray-500">{getTypeLabel(item.type)}</span>
                                {item.duration && (
                                  <>
                                    <span className="text-xs text-gray-300">•</span>
                                    <span className="text-xs text-gray-500 flex items-center gap-1">
                                      <Clock className="w-3 h-3" />
                                      {item.duration}
                                    </span>
                                  </>
                                )}
                              </div>
                              {item.description && (
                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{item.description}</p>
                              )}
                            </div>
                          </div>
                        </button>
                      )
                    })}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="lg:hidden bg-white border-b border-gray-200 p-4 flex-shrink-0">
          <button
            onClick={() => setIsMobileSidebarOpen(true)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700"
          >
            <div className="w-6 h-6 flex flex-col justify-center gap-1">
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
              <div className="w-4 h-0.5 bg-current"></div>
            </div>
            <span className="font-medium">Course Menu</span>
          </button>
        </div>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto">
          {selectedItemContent ? (
            <div className="p-6 max-w-4xl mx-auto">
              {/* Content Header */}
              <div className="mb-6">
                <div className="flex items-center gap-2 mb-2">
                  {getTypeIcon(selectedItemContent.type)}
                  <span className="text-sm font-medium text-gray-600">{getTypeLabel(selectedItemContent.type)}</span>
                  {isItemCompleted(
                    (selectedItem || internalSelectedItem)?.moduleId || "",
                    (selectedItem || internalSelectedItem)?.itemId || "",
                    selectedItemContent.completed,
                  ) && (
                    <div className="flex items-center gap-1 text-green-600">
                      <Check className="w-4 h-4" />
                      <span className="text-sm font-medium">Completed</span>
                    </div>
                  )}
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {selectedItemContent.content?.title || selectedItemContent.title}
                </h1>
                {selectedItemContent.content?.description && (
                  <p className="text-lg text-gray-600">{selectedItemContent.content.description}</p>
                )}
              </div>

              {/* Dynamic Content Blocks */}
              {selectedItemContent.content?.blocks && (
                <div className="mb-8">
                  {selectedItemContent.content.blocks
                    .filter((block) => {
                      if (!block || !block.type) return false;

                      // Check if block has content in either format (nested data or direct properties)
                      const hasData = block.data && Object.keys(block.data).some(key => block.data[key]);
                      const hasDirectContent = block.content || block.text || block.src || block.videoUrl || block.code || block.quote || (block.items && block.items.length > 0);

                      return hasData || hasDirectContent;
                    })
                    .map((block) => (
                    <ContentBlockRenderer key={block.id} block={block} />
                  ))}
                </div>
              )}

              {/* Assignment Details */}
              {selectedItemContent.type === "assignment" && selectedItemContent.content && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                  <h3 className="font-semibold text-blue-900 mb-4">Assignment Details</h3>
                  {selectedItemContent.content.status && (
                    <p className="text-blue-800 mb-2">
                      <strong>Status:</strong> {selectedItemContent.content.status}
                    </p>
                  )}
                  {selectedItemContent.content.points && (
                    <p className="text-blue-800 mb-2">
                      <strong>Points:</strong> {selectedItemContent.content.points}
                    </p>
                  )}
                  {selectedItemContent.content.deadline && (
                    <p className="text-blue-800">
                      <strong>Deadline:</strong> {selectedItemContent.content.deadline}
                    </p>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-3">
                {!isItemCompleted(
                  (selectedItem || internalSelectedItem)?.moduleId || "",
                  (selectedItem || internalSelectedItem)?.itemId || "",
                  selectedItemContent.completed,
                ) && (
                  <button className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors">
                    {selectedItemContent.type === "video"
                      ? "Watch Video"
                      : selectedItemContent.type === "reading"
                        ? "Start Reading"
                        : selectedItemContent.type === "assignment"
                          ? "Start Assignment"
                          : selectedItemContent.type === "quiz"
                            ? "Take Quiz"
                            : "Start Lab"}
                  </button>
                )}
                <button className="border border-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-50 transition-colors">
                  {selectedItemContent.type === "assignment" ? "Download Materials" : "View Resources"}
                </button>
              </div>

              {/* Mark Complete Button */}
              {!isItemCompleted(
                (selectedItem || internalSelectedItem)?.moduleId || "",
                (selectedItem || internalSelectedItem)?.itemId || "",
                selectedItemContent.completed,
              ) && (
                <div className="mt-8 pt-6 border-t border-gray-200">
                  <div className="bg-gray-50 rounded-lg p-6">
                    <h3 className="font-semibold text-gray-900 mb-2">Ready to mark this as complete?</h3>
                    <p className="text-gray-600 mb-4">
                      Once you've finished this {getTypeLabel(selectedItemContent.type).toLowerCase()}, mark it as
                      complete to track your progress.
                    </p>
                    <button
                      onClick={() => {
                        const currentSelected = selectedItem || internalSelectedItem
                        if (currentSelected) {
                          handleMarkComplete(currentSelected.moduleId, currentSelected.itemId)
                        }
                      }}
                      disabled={isUpdating}
                      className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <Check className="w-4 h-4" />
                      {isUpdating ? "Marking Complete..." : "Mark as Complete"}
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center p-6">
              <div className="text-center">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <BookOpen className="w-8 h-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">Select a lesson to get started</h3>
                <p className="text-gray-500">Choose any item from the course menu to view its content.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
