// API utility functions for admin dashboard

import { apiClient, ApiError } from "./api-client"

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001"

export interface ApiResponse<T> {
  success: boolean
  data?: T
  message?: string
}

export interface Service {
  _id: string
  name: string
  displayName: string
  description: string
  price: number
  currency: string
  image?: string
  createdAt: string
  updatedAt: string
}

export interface Purchase {
  _id: string
  chat_id: string
  service: {
    _id: string
    name: string
    displayName: string
  }
  amount: number
  method: string
  currency: string
  status: "pending" | "completed" | "failed"
  date: string
  txn_id: string
  createdAt: string
}

export interface User {
  _id: string
  telegramChatId: string
  fullName: string
  age: number
  phoneNumber: string
  email: string
  nationality: string
  preferredCountry: string
  educationLevel: string
  createdAt: string
}

export interface Course {
  _id: string
  progress: number
  country: string
  serviceId: string // Changed from service object to service ID string
  service?: { // Keep service object for display purposes
    _id: string
    name: string
  }
  module: CourseModule[]
  content?: ContentBlock[] // New JSON blocks structure
  createdAt: string
  updatedAt: string
}

export interface ContentBlock {
  id: string
  type: 'text' | 'image' | 'video' | 'heading' | 'list' | 'table' | 'quote' | 'code'
  content: any
  attributes?: Record<string, any>
  children?: ContentBlock[]
}

export interface CourseModule {
  id: string
  title: string
  description: string
  expanded?: boolean
  items: CourseItem[]
  content?: ContentBlock[] // Rich content for the module
}

export interface CourseItem {
  id: string
  title: string
  type: string
  completed: boolean
  duration: string
  description?: string
  content?: {
    title: string
    description: string
    blocks: ContentBlock[]
    deadline: string
    points: string
    status: string
  }
}

export interface Steps {
  _id: string
  serviceId: {
    _id: string
    name: string
  }
  steps: Step[]
}

export interface Step {
  id: string
  title: string
  description: string
  status: "not-started" | "in-progress" | "completed"
  icon: string
  checklist: ChecklistItem[]
}

export interface ChecklistItem {
  id: string
  task: string
  completed: boolean
  deadline?: string
}

// API functions
export const api = {
  // Services
  async getServices(): Promise<ApiResponse<Service[]>> {
    try {
      return await apiClient.get<ApiResponse<Service[]>>("/api/admin/services")
    } catch (error) {
      console.error("Failed to fetch services:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch services" }
    }
  },

  async createService(service: Omit<Service, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Service>> {
    try {
      const result = await apiClient.post<ApiResponse<Service>>("/api/admin/services", service)
      // Clear cache after successful creation
      apiClient.clearCacheEntry("/api/admin/services")
      return result
    } catch (error) {
      console.error("Failed to create service:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to create service" }
    }
  },

  async updateService(service: Service): Promise<ApiResponse<Service>> {
    try {
      const result = await apiClient.put<ApiResponse<Service>>("/api/admin/services", service)
      // Clear cache after successful update
      apiClient.clearCacheEntry("/api/admin/services")
      return result
    } catch (error) {
      console.error("Failed to update service:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update service" }
    }
  },

  async deleteService(id: string): Promise<ApiResponse<void>> {
    try {
      const result = await apiClient.delete<ApiResponse<void>>("/api/admin/services", { id })
      // Clear cache after successful deletion
      apiClient.clearCacheEntry("/api/admin/services")
      return result
    } catch (error) {
      console.error("Failed to delete service:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to delete service" }
    }
  },

  // Purchases
  async getPurchases(): Promise<ApiResponse<Purchase[]>> {
    try {
      return await apiClient.get<ApiResponse<Purchase[]>>("/api/admin/purchases")
    } catch (error) {
      console.error("Failed to fetch purchases:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch purchases" }
    }
  },

  async updatePurchase(id: string, updates: Partial<Purchase>): Promise<ApiResponse<Purchase>> {
    try {
      const result = await apiClient.put<ApiResponse<Purchase>>("/api/admin/purchases", { id, ...updates })
      // Clear cache after successful update
      apiClient.clearCacheEntry("/api/admin/purchases")
      return result
    } catch (error) {
      console.error("Failed to update purchase:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update purchase" }
    }
  },

  // Users
  async getUsers(): Promise<ApiResponse<User[]>> {
    try {
      return await apiClient.get<ApiResponse<User[]>>("/api/admin/users")
    } catch (error) {
      console.error("Failed to fetch users:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch users" }
    }
  },

  // Courses
  async getCourses(): Promise<ApiResponse<Course[]>> {
    try {
      return await apiClient.get<ApiResponse<Course[]>>("/api/admin/courses")
    } catch (error) {
      console.error("Failed to fetch courses:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch courses" }
    }
  },

  async createCourse(course: Omit<Course, "_id" | "createdAt" | "updatedAt">): Promise<ApiResponse<Course>> {
    try {
      const result = await apiClient.post<ApiResponse<Course>>("/api/admin/courses", course)
      // Clear cache after successful creation
      apiClient.clearCacheEntry("/api/admin/courses")
      return result
    } catch (error) {
      console.error("Failed to create course:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to create course" }
    }
  },

  async updateCourse(course: Course): Promise<ApiResponse<Course>> {
    try {
      const result = await apiClient.put<ApiResponse<Course>>("/api/admin/courses", course)
      // Clear cache after successful update
      apiClient.clearCacheEntry("/api/admin/courses")
      return result
    } catch (error) {
      console.error("Failed to update course:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update course" }
    }
  },

  async deleteCourse(id: string): Promise<ApiResponse<void>> {
    try {
      const result = await apiClient.delete<ApiResponse<void>>("/api/admin/courses", { id })
      // Clear cache after successful deletion
      apiClient.clearCacheEntry("/api/admin/courses")
      return result
    } catch (error) {
      console.error("Failed to delete course:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to delete course" }
    }
  },

  async getCompletedItems(
    userId: string,
    serviceId: string
  ): Promise<ApiResponse<{ completedItems: Array<{ item_id: string; completed_at: Date }>; count: number }>> {
    try {
      const result = await apiClient.get<ApiResponse<{ completedItems: Array<{ item_id: string; completed_at: Date }>; count: number }>>(`/api/completed-items?userId=${userId}&serviceId=${serviceId}`);
      return result;
    } catch (error) {
      console.error("Failed to fetch completed items:", error);
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch completed items" };
    }
  },

  // Steps
  async getSteps(): Promise<ApiResponse<Steps[]>> {
    try {
      return await apiClient.get<ApiResponse<Steps[]>>("/api/admin/steps")
    } catch (error) {
      console.error("Failed to fetch steps:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch steps" }
    }
  },

  async createSteps(steps: Omit<Steps, "_id">): Promise<ApiResponse<Steps>> {
    try {
      const result = await apiClient.post<ApiResponse<Steps>>("/api/admin/steps", steps)
      // Clear cache after successful creation
      apiClient.clearCacheEntry("/api/admin/steps")
      return result
    } catch (error) {
      console.error("Failed to create steps:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to create steps" }
    }
  },

  async updateSteps(steps: Steps): Promise<ApiResponse<Steps>> {
    try {
      const result = await apiClient.put<ApiResponse<Steps>>("/api/admin/steps", steps)
      // Clear cache after successful update
      apiClient.clearCacheEntry("/api/admin/steps")
      return result
    } catch (error) {
      console.error("Failed to update steps:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update steps" }
    }
  },

  async deleteSteps(id: string): Promise<ApiResponse<void>> {
    try {
      const result = await apiClient.delete<ApiResponse<void>>("/api/admin/steps", { id })
      // Clear cache after successful deletion
      apiClient.clearCacheEntry("/api/admin/steps")
      return result
    } catch (error) {
      console.error("Failed to delete steps:", error)
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to delete steps" }
    }
  },

  // Utility functions
  clearAllCache(): void {
    apiClient.clearCache()
  },

  async updateCourseProgress(
    userId: string,
    serviceId: string,
    progress: number,
    moduleId: string,
    itemId: string,
    completed: boolean
  ): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.post<ApiResponse<any>>("/api/update-course-progress", {
        userId,
        serviceId,
        progress,
        moduleId,
        itemId,
        completed
      });
      return result;
    } catch (error) {
      console.error("Failed to update course progress:", error);
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update course progress" };
    }
  },

  async updateItemsCompleted(
    serviceid: string,
    chat_id: string,
    item_id: string,
    completed: boolean
  ): Promise<ApiResponse<any>> {
    try {
      const result = await apiClient.post<ApiResponse<any>>("/api/items-completed", {
        serviceid,
        chat_id,
        item_id,
        completed
      });
      return result;
    } catch (error) {
      console.error("Failed to update items completed:", error);
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to update items completed" };
    }
  },

  async getItemsCompleted(
    serviceid?: string,
    chat_id?: string,
    item_id?: string
  ): Promise<ApiResponse<any[]>> {
    try {
      const params = new URLSearchParams();
      if (serviceid) params.append('serviceid', serviceid);
      if (chat_id) params.append('chat_id', chat_id);
      if (item_id) params.append('item_id', item_id);

      const queryString = params.toString();
      const endpoint = `/api/items-completed${queryString ? `?${queryString}` : ''}`;

      const result = await apiClient.get<ApiResponse<any[]>>(endpoint);
      return result;
    } catch (error) {
      console.error("Failed to fetch items completed:", error);
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to fetch items completed" };
    }
  },

  // Support tickets
  async submitSupportTicket(ticketData: {
    name: string;
    phoneNumber: string;
    telegramUsername?: string;
    category: string;
    subject: string;
    message: string;
  }): Promise<ApiResponse<{ ticketId: string }>> {
    try {
      const result = await apiClient.post<ApiResponse<{ ticketId: string }>>("/api/support", ticketData);
      return result;
    } catch (error) {
      console.error("Failed to submit support ticket:", error);
      return { success: false, message: error instanceof ApiError ? error.message : "Failed to submit support ticket" };
    }
  },
}
