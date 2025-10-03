export interface ContentBlock {
    id: string
    type: "text" | "image" | "video" | "code" | "quote" | "list"
    data?: {
      // Text block
      content?: string
      // Image block
      src?: string
      alt?: string
      caption?: string
      // Video block
      videoUrl?: string
      thumbnail?: string
      duration?: string
      // Code block
      language?: string
      code?: string
      // Quote block
      quote?: string
      author?: string
      // List block
      items?: string[]
      ordered?: boolean
    }
    // Legacy support for direct properties
    content?: string
    text?: string
    src?: string
    alt?: string
    caption?: string
    videoUrl?: string
    thumbnail?: string
    duration?: string
    language?: string
    code?: string
    quote?: string
    author?: string
    items?: string[]
    ordered?: boolean
  }
  
  export interface CourseItem {
    id: string
    title: string
    type: "video" | "reading" | "assignment" | "quiz" | "lab"
    completed: boolean
    duration?: string
    description?: string
    content?: {
      title: string
      description: string
      blocks: ContentBlock[]
      deadline?: string
      points?: string
      status?: string
    }
  }
  
  export interface CourseModule {
    id: string
    title: string
    description?: string
    items: CourseItem[]
    expanded?: boolean
  }
  
  export interface CourseProgressProps {
    title: string
    subtitle?: string
    modules: CourseModule[]
    onItemClick?: (moduleId: string, itemId: string) => void
    onModuleToggle?: (moduleId: string) => void
    onMarkComplete?: (moduleId: string, itemId: string) => void
    className?: string
    selectedItem?: { moduleId: string; itemId: string } | null
  }
  