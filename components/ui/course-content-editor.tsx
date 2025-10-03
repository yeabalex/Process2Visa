"use client"

import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { ContentBlock, CourseModule, CourseItem } from '@/lib/api'
import {
  Plus,
  Trash2,
  Edit,
  Save,
  Eye,
  FileText,
  Video,
  Image as ImageIcon,
  List,
  BookOpen,
  ChevronDown,
  ChevronRight
} from 'lucide-react'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'

interface CourseContentEditorProps {
  modules: CourseModule[]
  onModulesChange: (modules: CourseModule[]) => void
  onContentChange?: (content: ContentBlock[]) => void
  singleModule?: boolean // New prop to handle single module mode
}

export function CourseContentEditor({
  modules,
  onModulesChange,
  onContentChange,
  singleModule = false
}: CourseContentEditorProps) {
  const [activeModuleIndex, setActiveModuleIndex] = useState<number | null>(null)
  const [editingItemIndex, setEditingItemIndex] = useState<{ moduleIndex: number; itemIndex: number } | null>(null)
  const [newModuleTitle, setNewModuleTitle] = useState('')
  const [newModuleDescription, setNewModuleDescription] = useState('')
  const [newItemTitle, setNewItemTitle] = useState('')
  const [newItemType, setNewItemType] = useState<'text' | 'video' | 'image' | 'quiz'>('text')
  const [newItemDuration, setNewItemDuration] = useState('')
  const [courseContent, setCourseContent] = useState<ContentBlock[]>([])

  const addModule = () => {
    if (!newModuleTitle.trim()) return

    const newModule: CourseModule = {
      id: `module_${Date.now()}`,
      title: newModuleTitle,
      description: newModuleDescription,
      items: []
    }

    const updatedModules = [...modules, newModule]
    onModulesChange(updatedModules)

    setNewModuleTitle('')
    setNewModuleDescription('')
    setActiveModuleIndex(modules.length) // Set the newly added module as active
  }

  const addItemToModule = (moduleIndex: number) => {
    if (!newItemTitle.trim()) return

    const newItem: CourseItem = {
      id: `item_${Date.now()}`,
      title: newItemTitle,
      type: newItemType,
      completed: false,
      duration: newItemDuration,
      content: [] // Initialize with empty content blocks
    }

    const updatedModules = [...modules]
    updatedModules[moduleIndex].items.push(newItem)
    onModulesChange(updatedModules)

    setNewItemTitle('')
    setNewItemType('text')
    setNewItemDuration('')
  }

  const removeModule = (moduleIndex: number) => {
    const updatedModules = modules.filter((_, index) => index !== moduleIndex)
    onModulesChange(updatedModules)

    if (activeModuleIndex === moduleIndex) {
      setActiveModuleIndex(null)
    } else if (activeModuleIndex && activeModuleIndex > moduleIndex) {
      setActiveModuleIndex(activeModuleIndex - 1)
    }
  }

  const removeItem = (moduleIndex: number, itemIndex: number) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].items = updatedModules[moduleIndex].items.filter((_, index) => index !== itemIndex)
    onModulesChange(updatedModules)

    if (editingItemIndex?.moduleIndex === moduleIndex && editingItemIndex?.itemIndex === itemIndex) {
      setEditingItemIndex(null)
    }
  }

  const updateItemContent = (moduleIndex: number, itemIndex: number, content: ContentBlock[]) => {
    const updatedModules = [...modules]
    updatedModules[moduleIndex].items[itemIndex].content = content
    onModulesChange(updatedModules)
  }

  const handleContentChange = (content: ContentBlock[]) => {
    setCourseContent(content)
    if (onContentChange) {
      onContentChange(content)
    }
  }

  const getItemIcon = (type: string) => {
    switch (type) {
      case 'video':
        return <Video className="h-4 w-4" />
      case 'image':
        return <ImageIcon className="h-4 w-4" />
      case 'quiz':
        return <FileText className="h-4 w-4" />
      default:
        return <FileText className="h-4 w-4" />
    }
  }

  const getItemTypeColor = (type: string) => {
    switch (type) {
      case 'video':
        return 'bg-red-100 text-red-800'
      case 'image':
        return 'bg-green-100 text-green-800'
      case 'quiz':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="space-y-6">
      {/* Course Content Editor */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Course Content Editor (Rich Text)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <RichTextEditor
            content={courseContent}
            onChange={handleContentChange}
            placeholder="Write your course content here with rich formatting, images, videos, and more..."
          />
        </CardContent>
      </Card>

      {/* Module-based Structure */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            Module Structure
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add New Module */}
          <div className="border rounded-lg p-4 bg-muted/50">
            <h4 className="font-medium mb-3">Add New Module</h4>
            <div className="grid gap-3">
              <div>
                <Label htmlFor="module-title">Module Title</Label>
                <Input
                  id="module-title"
                  value={newModuleTitle}
                  onChange={(e) => setNewModuleTitle(e.target.value)}
                  placeholder="Enter module title..."
                />
              </div>
              <div>
                <Label htmlFor="module-description">Module Description</Label>
                <Textarea
                  id="module-description"
                  value={newModuleDescription}
                  onChange={(e) => setNewModuleDescription(e.target.value)}
                  placeholder="Enter module description..."
                  rows={2}
                />
              </div>
              <Button onClick={addModule} className="w-fit">
                <Plus className="h-4 w-4 mr-2" />
                Add Module
              </Button>
            </div>
          </div>

          {/* Existing Modules */}
          <div className="space-y-3">
            {modules.map((module, moduleIndex) => (
              <Collapsible key={module.id} open={activeModuleIndex === moduleIndex} onOpenChange={(open) => setActiveModuleIndex(open ? moduleIndex : null)}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {activeModuleIndex === moduleIndex ? (
                            <ChevronDown className="h-4 w-4" />
                          ) : (
                            <ChevronRight className="h-4 w-4" />
                          )}
                          <CardTitle className="text-lg">{module.title}</CardTitle>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant="outline">{module.items.length} items</Badge>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeModule(moduleIndex)
                            }}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                      {module.description && (
                        <p className="text-sm text-muted-foreground mt-2">{module.description}</p>
                      )}
                    </CardHeader>
                  </CollapsibleTrigger>

                  <CollapsibleContent>
                    <CardContent className="pt-0">
                      {/* Add Item to Module */}
                      <div className="mb-4 p-3 border rounded bg-muted/30">
                        <h5 className="font-medium mb-2">Add Item to "{module.title}"</h5>
                        <div className="grid gap-2">
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <Label htmlFor={`item-title-${moduleIndex}`}>Item Title</Label>
                              <Input
                                id={`item-title-${moduleIndex}`}
                                value={newItemTitle}
                                onChange={(e) => setNewItemTitle(e.target.value)}
                                placeholder="Enter item title..."
                              />
                            </div>
                            <div>
                              <Label htmlFor={`item-type-${moduleIndex}`}>Type</Label>
                              <select
                                id={`item-type-${moduleIndex}`}
                                value={newItemType}
                                onChange={(e) => setNewItemType(e.target.value as any)}
                                className="w-full px-3 py-2 border rounded-md"
                              >
                                <option value="text">Text Content</option>
                                <option value="video">Video</option>
                                <option value="image">Image</option>
                                <option value="quiz">Quiz</option>
                              </select>
                            </div>
                          </div>
                          <div>
                            <Label htmlFor={`item-duration-${moduleIndex}`}>Duration (optional)</Label>
                            <Input
                              id={`item-duration-${moduleIndex}`}
                              value={newItemDuration}
                              onChange={(e) => setNewItemDuration(e.target.value)}
                              placeholder="e.g., 10 minutes"
                            />
                          </div>
                          <Button
                            onClick={() => addItemToModule(moduleIndex)}
                            size="sm"
                            className="w-fit"
                          >
                            <Plus className="h-4 w-4 mr-2" />
                            Add Item
                          </Button>
                        </div>
                      </div>

                      {/* Module Items */}
                      <div className="space-y-2">
                        {module.items.map((item, itemIndex) => (
                          <div key={item.id} className="border rounded p-3">
                            <div className="flex items-center justify-between mb-2">
                              <div className="flex items-center gap-2">
                                {getItemIcon(item.type)}
                                <span className="font-medium">{item.title}</span>
                                <Badge className={getItemTypeColor(item.type)}>
                                  {item.type}
                                </Badge>
                                {item.duration && (
                                  <span className="text-sm text-muted-foreground">
                                    • {item.duration}
                                  </span>
                                )}
                              </div>
                              <div className="flex gap-1">
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => setEditingItemIndex({ moduleIndex, itemIndex })}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => removeItem(moduleIndex, itemIndex)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </div>

                            {/* Item Content Editor */}
                            {editingItemIndex?.moduleIndex === moduleIndex && editingItemIndex?.itemIndex === itemIndex && (
                              <div className="mt-3 p-3 bg-muted/50 rounded">
                                <h6 className="font-medium mb-2">Edit Item Content</h6>
                                <RichTextEditor
                                  content={item.content || []}
                                  onChange={(content) => updateItemContent(moduleIndex, itemIndex, content)}
                                  placeholder={`Write content for "${item.title}"...`}
                                />
                                <div className="flex justify-end mt-2">
                                  <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => setEditingItemIndex(null)}
                                  >
                                    Done Editing
                                  </Button>
                                </div>
                              </div>
                            )}

                            {/* Preview of existing content */}
                            {item.content && item.content.length > 0 && editingItemIndex?.moduleIndex !== moduleIndex && editingItemIndex?.itemIndex !== itemIndex && (
                              <div className="mt-2 p-2 bg-background border rounded text-sm">
                                <div className="flex items-center gap-2 mb-1">
                                  <Eye className="h-3 w-3" />
                                  <span className="text-muted-foreground">Content preview:</span>
                                </div>
                                <div className="text-xs text-muted-foreground truncate">
                                  {item.content[0]?.content || 'Rich content available'}
                                </div>
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            ))}
          </div>

          {modules.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <BookOpen className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No modules added yet. Create your first module to get started.</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
