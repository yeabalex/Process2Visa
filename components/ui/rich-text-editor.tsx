"use client"

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import {
  Plus,
  Edit,
  Trash2,
  Type,
  Image as ImageIcon,
  Video,
  Heading1,
  List,
  Table as TableIcon,
  Quote,
  Code,
  FileText,
} from 'lucide-react'
import { ContentBlock } from '@/lib/api'

interface RichTextEditorProps {
  content?: ContentBlock[]
  onChange?: (blocks: ContentBlock[]) => void
  placeholder?: string
  className?: string
}

type BlockType = 'text' | 'image' | 'video' | 'heading' | 'list' | 'table' | 'quote' | 'code'

export function RichTextEditor({
  content = [],
  onChange,
  placeholder = "Add your course content blocks...",
  className = ""
}: RichTextEditorProps) {
  const [blocks, setBlocks] = useState<ContentBlock[]>(content)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [editingBlock, setEditingBlock] = useState<ContentBlock | null>(null)

  // Form state for new/editing blocks
  const [blockType, setBlockType] = useState<BlockType>('text')
  const [blockContent, setBlockContent] = useState('')
  const [blockAttributes, setBlockAttributes] = useState<Record<string, any>>({})

  const updateBlocks = (newBlocks: ContentBlock[]) => {
    setBlocks(newBlocks)
    if (onChange) {
      onChange(newBlocks)
    }
  }

  const addBlock = () => {
    const newBlock: ContentBlock = {
      id: `block_${Date.now()}`,
      type: blockType,
      content: getContentForType(blockType, blockContent),
      attributes: blockAttributes
    }

    updateBlocks([...blocks, newBlock])
    resetForm()
    setShowAddDialog(false)
  }

  const updateBlock = (updatedBlock: ContentBlock) => {
    const newBlocks = blocks.map(block =>
      block.id === updatedBlock.id ? updatedBlock : block
    )
    updateBlocks(newBlocks)
    setEditingBlock(null)
    resetForm()
  }

  const deleteBlock = (blockId: string) => {
    updateBlocks(blocks.filter(block => block.id !== blockId))
  }

  const resetForm = () => {
    setBlockType('text')
    setBlockContent('')
    setBlockAttributes({})
  }

  const getContentForType = (type: BlockType, content: string) => {
    switch (type) {
      case 'list':
        return content.split('\n').filter(item => item.trim())
      case 'table':
        return content.split('\n').map(row =>
          row.split(',').map(cell => cell.trim())
        )
      default:
        return content
    }
  }

  const getBlockIcon = (type: BlockType) => {
    switch (type) {
      case 'text': return <Type className="h-4 w-4" />
      case 'image': return <ImageIcon className="h-4 w-4" />
      case 'video': return <Video className="h-4 w-4" />
      case 'heading': return <Heading1 className="h-4 w-4" />
      case 'list': return <List className="h-4 w-4" />
      case 'table': return <TableIcon className="h-4 w-4" />
      case 'quote': return <Quote className="h-4 w-4" />
      case 'code': return <Code className="h-4 w-4" />
      default: return <FileText className="h-4 w-4" />
    }
  }

  const renderBlockPreview = (block: ContentBlock) => {
    switch (block.type) {
      case 'text':
        return <p className="text-sm text-muted-foreground">{block.content}</p>
      case 'heading':
        const level = block.attributes?.level || 1
        return <p className={`font-bold ${level === 1 ? 'text-lg' : level === 2 ? 'text-base' : 'text-sm'}`}>
          {block.content}
        </p>
      case 'image':
        return <div className="text-sm text-muted-foreground">
          <ImageIcon className="h-4 w-4 inline mr-1" />
          Image: {block.content}
        </div>
      case 'video':
        return <div className="text-sm text-muted-foreground">
          <Video className="h-4 w-4 inline mr-1" />
          Video: {block.content}
        </div>
      case 'list':
        return <div className="text-sm text-muted-foreground">
          <List className="h-4 w-4 inline mr-1" />
          List ({Array.isArray(block.content) ? block.content.length : 0} items)
        </div>
      case 'table':
        return <div className="text-sm text-muted-foreground">
          <TableIcon className="h-4 w-4 inline mr-1" />
          Table
        </div>
      case 'quote':
        return <div className="text-sm text-muted-foreground italic">
          "{block.content}"
        </div>
      case 'code':
        return <div className="text-sm text-muted-foreground">
          <Code className="h-4 w-4 inline mr-1" />
          Code block
        </div>
      default:
        return <p className="text-sm text-muted-foreground">{block.content}</p>
    }
  }

  return (
    <div className={`border rounded-lg ${className}`}>
      <Card className="border-0 border-b rounded-none">
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Content Blocks Editor</CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex items-center gap-2 p-2 bg-muted/50 rounded">
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button variant="default" size="sm">
                  <Plus className="h-4 w-4 mr-1" />
                  Add Block
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Add Content Block</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label>Block Type</Label>
                    <Select value={blockType} onValueChange={(value: BlockType) => setBlockType(value)}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="text">Text</SelectItem>
                        <SelectItem value="heading">Heading</SelectItem>
                        <SelectItem value="image">Image</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                        <SelectItem value="list">List</SelectItem>
                        <SelectItem value="table">Table</SelectItem>
                        <SelectItem value="quote">Quote</SelectItem>
                        <SelectItem value="code">Code</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {blockType === 'heading' && (
                    <div className="grid gap-2">
                      <Label>Heading Level</Label>
                      <Select
                        value={blockAttributes.level?.toString() || '1'}
                        onValueChange={(value) => setBlockAttributes({...blockAttributes, level: parseInt(value)})}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">Heading 1</SelectItem>
                          <SelectItem value="2">Heading 2</SelectItem>
                          <SelectItem value="3">Heading 3</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  <div className="grid gap-2">
                    <Label>
                      {blockType === 'text' && 'Text Content'}
                      {blockType === 'heading' && 'Heading Text'}
                      {blockType === 'image' && 'Image URL'}
                      {blockType === 'video' && 'Video URL'}
                      {blockType === 'list' && 'List Items (one per line)'}
                      {blockType === 'table' && 'Table Data (CSV format)'}
                      {blockType === 'quote' && 'Quote Text'}
                      {blockType === 'code' && 'Code Content'}
                    </Label>
                    {blockType === 'text' || blockType === 'heading' || blockType === 'quote' || blockType === 'code' ? (
                      <Textarea
                        value={blockContent}
                        onChange={(e) => setBlockContent(e.target.value)}
                        placeholder={
                          blockType === 'text' ? 'Enter your text content...' :
                          blockType === 'heading' ? 'Enter your heading text...' :
                          blockType === 'quote' ? 'Enter your quote...' :
                          'Enter your code...'
                        }
                        rows={4}
                      />
                    ) : (
                      <Textarea
                        value={blockContent}
                        onChange={(e) => setBlockContent(e.target.value)}
                        placeholder={
                          blockType === 'image' ? 'https://example.com/image.jpg' :
                          blockType === 'video' ? 'https://example.com/video.mp4' :
                          blockType === 'list' ? 'Item 1\nItem 2\nItem 3' :
                          'Row 1 Col 1, Row 1 Col 2\nRow 2 Col 1, Row 2 Col 2'
                        }
                        rows={4}
                      />
                    )}
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={addBlock} disabled={!blockContent.trim()}>
                    Add Block
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Content Blocks Display */}
      <div className="min-h-[400px] bg-background p-4">
        {blocks.length === 0 ? (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            <div className="text-center">
              <FileText className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>{placeholder}</p>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {blocks.map((block, index) => (
              <Card key={block.id} className="relative">
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-1">
                      {getBlockIcon(block.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      {renderBlockPreview(block)}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setEditingBlock(block)
                          setBlockType(block.type)
                          setBlockContent(
                            block.type === 'list' ? (block.content as string[]).join('\n') :
                            block.type === 'table' ? (block.content as string[][]).map(row => row.join(',')).join('\n') :
                            block.content as string
                          )
                          setBlockAttributes(block.attributes || {})
                        }}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deleteBlock(block.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingBlock} onOpenChange={(open) => !open && setEditingBlock(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Content Block</DialogTitle>
          </DialogHeader>
          {editingBlock && (
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label>Block Type</Label>
                <Select value={blockType} onValueChange={(value: BlockType) => setBlockType(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="text">Text</SelectItem>
                    <SelectItem value="heading">Heading</SelectItem>
                    <SelectItem value="image">Image</SelectItem>
                    <SelectItem value="video">Video</SelectItem>
                    <SelectItem value="list">List</SelectItem>
                    <SelectItem value="table">Table</SelectItem>
                    <SelectItem value="quote">Quote</SelectItem>
                    <SelectItem value="code">Code</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {blockType === 'heading' && (
                <div className="grid gap-2">
                  <Label>Heading Level</Label>
                  <Select
                    value={blockAttributes.level?.toString() || '1'}
                    onValueChange={(value) => setBlockAttributes({...blockAttributes, level: parseInt(value)})}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">Heading 1</SelectItem>
                      <SelectItem value="2">Heading 2</SelectItem>
                      <SelectItem value="3">Heading 3</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}

              <div className="grid gap-2">
                <Label>
                  {blockType === 'text' && 'Text Content'}
                  {blockType === 'heading' && 'Heading Text'}
                  {blockType === 'image' && 'Image URL'}
                  {blockType === 'video' && 'Video URL'}
                  {blockType === 'list' && 'List Items (one per line)'}
                  {blockType === 'table' && 'Table Data (CSV format)'}
                  {blockType === 'quote' && 'Quote Text'}
                  {blockType === 'code' && 'Code Content'}
                </Label>
                {blockType === 'text' || blockType === 'heading' || blockType === 'quote' || blockType === 'code' ? (
                  <Textarea
                    value={blockContent}
                    onChange={(e) => setBlockContent(e.target.value)}
                    placeholder={
                      blockType === 'text' ? 'Enter your text content...' :
                      blockType === 'heading' ? 'Enter your heading text...' :
                      blockType === 'quote' ? 'Enter your quote...' :
                      'Enter your code...'
                    }
                    rows={4}
                  />
                ) : (
                  <Textarea
                    value={blockContent}
                    onChange={(e) => setBlockContent(e.target.value)}
                    placeholder={
                      blockType === 'image' ? 'https://example.com/image.jpg' :
                      blockType === 'video' ? 'https://example.com/video.mp4' :
                      blockType === 'list' ? 'Item 1\nItem 2\nItem 3' :
                      'Row 1 Col 1, Row 1 Col 2\nRow 2 Col 1, Row 2 Col 2'
                    }
                    rows={4}
                  />
                )}
              </div>
            </div>
          )}
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setEditingBlock(null)}>
              Cancel
            </Button>
            <Button
              onClick={() => editingBlock && updateBlock({
                ...editingBlock,
                type: blockType,
                content: getContentForType(blockType, blockContent),
                attributes: blockAttributes
              })}
              disabled={!blockContent.trim()}
            >
              Update Block
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
