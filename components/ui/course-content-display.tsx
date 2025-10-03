"use client"

import React from 'react'
import { ContentBlock } from '@/lib/api'

interface CourseContentDisplayProps {
  content: ContentBlock[]
  className?: string
}

export function CourseContentDisplay({ content, className = "" }: CourseContentDisplayProps) {
  if (!content || content.length === 0) {
    return (
      <div className={`text-muted-foreground text-center py-8 ${className}`}>
        <p>No content available yet.</p>
      </div>
    )
  }

  const renderBlock = (block: ContentBlock, index: number) => {
    switch (block.type) {
      case 'heading':
        const level = block.attributes?.level || 1
        const HeadingTag = `h${level}` as React.ElementType
        return (
          <HeadingTag key={index} className={`font-bold mb-4 ${level === 1 ? 'text-2xl' : level === 2 ? 'text-xl' : 'text-lg'}`}>
            {block.content}
          </HeadingTag>
        )

      case 'text':
        return (
          <p key={index} className="mb-4 leading-relaxed">
            {block.content}
          </p>
        )

      case 'image':
        return (
          <div key={index} className="mb-6">
            <img
              src={block.content}
              alt={block.attributes?.alt || 'Course image'}
              className={`rounded-lg max-w-full h-auto ${block.attributes?.width ? `w-[${block.attributes.width}]` : 'w-full'}`}
              style={{ height: block.attributes?.height ? `${block.attributes.height}px` : 'auto' }}
            />
            {block.attributes?.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.attributes.caption}
              </p>
            )}
          </div>
        )

      case 'video':
        return (
          <div key={index} className="mb-6">
            <video
              src={block.content}
              controls
              className="rounded-lg max-w-full h-auto w-full"
              style={{ maxHeight: block.attributes?.height ? `${block.attributes.height}px` : '400px' }}
            >
              Your browser does not support the video tag.
            </video>
            {block.attributes?.caption && (
              <p className="text-sm text-muted-foreground mt-2 text-center italic">
                {block.attributes.caption}
              </p>
            )}
          </div>
        )

      case 'list':
        const ListTag = block.attributes?.ordered ? 'ol' : 'ul'
        const listItems = Array.isArray(block.content) ? block.content : [block.content]
        return (
          <ListTag key={index} className={`mb-4 ${block.attributes?.ordered ? 'list-decimal' : 'list-disc'} pl-6`}>
            {listItems.map((item, itemIndex) => (
              <li key={itemIndex} className="mb-1">
                {item}
              </li>
            ))}
          </ListTag>
        )

      case 'quote':
        return (
          <blockquote key={index} className="border-l-4 border-primary pl-4 py-2 mb-4 italic bg-muted/50">
            {block.content}
          </blockquote>
        )

      case 'code':
        return (
          <pre key={index} className="bg-muted p-4 rounded-lg overflow-x-auto mb-4">
            <code className="text-sm">{block.content}</code>
          </pre>
        )

      case 'table':
        try {
          const tableData = typeof block.content === 'string' ? JSON.parse(block.content) : block.content
          if (Array.isArray(tableData) && tableData.length > 0) {
            return (
              <div key={index} className="mb-6 overflow-x-auto">
                <table className="w-full border-collapse border border-muted">
                  <tbody>
                    {tableData.map((row: any[], rowIndex: number) => (
                      <tr key={rowIndex}>
                        {row.map((cell: any, cellIndex: number) => (
                          <td key={cellIndex} className="border border-muted p-2">
                            {cell}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )
          }
        } catch (e) {
          console.error('Error parsing table data:', e)
        }
        return null

      default:
        return (
          <div key={index} className="mb-4 p-4 border rounded bg-muted/50">
            <p className="text-sm text-muted-foreground">
              Unsupported content type: {block.type}
            </p>
            <pre className="text-xs mt-2 overflow-auto">
              {JSON.stringify(block, null, 2)}
            </pre>
          </div>
        )
    }
  }

  return (
    <div className={`prose prose-sm max-w-none ${className}`}>
      {content.map(renderBlock)}
    </div>
  )
}
