import type { ContentBlock } from "@/types/course"
import { cn } from "@/lib/utils"
import { Play } from "lucide-react"

interface ContentBlockRendererProps {
  block: ContentBlock
  className?: string
}

export function ContentBlockRenderer({ block, className }: ContentBlockRendererProps) {
  // Handle cases where block.data is undefined or block content is directly available
  const getBlockData = (block: ContentBlock) => {
    // If block.data exists, use it (current expected format)
    if (block.data) {
      return block.data;
    }
    // Otherwise, use direct properties (legacy/API format)
    return {
      content: block.content || block.text,
      src: block.src,
      alt: block.alt,
      caption: block.caption,
      videoUrl: block.videoUrl,
      thumbnail: block.thumbnail,
      duration: block.duration,
      language: block.language,
      code: block.code,
      quote: block.quote,
      author: block.author,
      items: block.items,
      ordered: block.ordered,
    };
  };

  const blockData = getBlockData(block);

  if (!blockData) {
    console.warn('Block data is undefined for block:', block);
    return null;
  }

  switch (block.type) {
    case "text":
      return (
        <div className={cn("prose prose-lg max-w-none", className)}>
          <div className="whitespace-pre-wrap leading-relaxed text-gray-700">{blockData.content || 'No content available'}</div>
        </div>
      )

    case "image":
      return (
        <div className={cn("my-6", className)}>
          <div className="rounded-lg overflow-hidden border border-gray-200">
            <img src={blockData.src || "/placeholder.svg"} alt={blockData.alt || ""} className="w-full h-auto" />
          </div>
          {blockData.caption && <p className="text-sm text-gray-600 mt-2 text-center italic">{blockData.caption}</p>}
        </div>
      )

    case "video":
      return (
        <div className={cn("my-6", className)}>
          <div className="relative rounded-lg overflow-hidden border border-gray-200 bg-gray-100">
            {blockData.thumbnail ? (
              <div className="relative group cursor-pointer">
                <img
                  src={blockData.thumbnail || "/placeholder.svg"}
                  alt="Video thumbnail"
                  className="w-full h-64 object-cover"
                />
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center group-hover:bg-opacity-40 transition-colors">
                  <div className="w-16 h-16 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                    <Play className="w-6 h-6 text-gray-800 ml-1" />
                  </div>
                </div>
                {blockData.duration && (
                  <div className="absolute bottom-2 right-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                    {blockData.duration}
                  </div>
                )}
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center">
                <div className="text-center">
                  <Play className="w-12 h-12 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600">Video Content</p>
                  {blockData.duration && <p className="text-sm text-gray-500">{blockData.duration}</p>}
                </div>
              </div>
            )}
          </div>
        </div>
      )

    case "code":
      return (
        <div className={cn("my-6", className)}>
          <div className="rounded-lg border border-gray-200 overflow-hidden">
            {blockData.language && (
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <span className="text-sm font-medium text-gray-600">{blockData.language}</span>
              </div>
            )}
            <pre className="bg-gray-900 text-gray-100 p-4 overflow-x-auto">
              <code>{blockData.code || 'No code available'}</code>
            </pre>
          </div>
        </div>
      )

    case "quote":
      return (
        <div className={cn("my-6", className)}>
          <blockquote className="border-l-4 border-blue-500 pl-6 py-2 bg-blue-50 rounded-r-lg">
            <p className="text-lg italic text-gray-700 mb-2">{blockData.quote ? `"${blockData.quote}"` : '"No quote available"'}</p>
            {blockData.author && <cite className="text-sm font-medium text-gray-600">— {blockData.author}</cite>}
          </blockquote>
        </div>
      )

    case "list":
      return (
        <div className={cn("my-6", className)}>
          {blockData.ordered ? (
            <ol className="list-decimal list-inside space-y-2 text-gray-700">
              {(blockData.items || []).map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ol>
          ) : (
            <ul className="list-disc list-inside space-y-2 text-gray-700">
              {(blockData.items || []).map((item, index) => (
                <li key={index} className="leading-relaxed">
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )

    default:
      return null
  }
}
