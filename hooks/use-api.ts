"use client"

// Custom hooks for API operations with loading states and error handling

import { useState, useEffect, useCallback } from "react"
import { api, type ApiResponse } from "@/lib/api"

export interface UseApiState<T> {
  data: T | null
  loading: boolean
  error: string | null
  refetch: () => Promise<void>
}

export function useApi<T>(apiCall: () => Promise<ApiResponse<T>>, dependencies: any[] = []): UseApiState<T> {
  const [data, setData] = useState<T | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchData = useCallback(async () => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall()
      if (response.success && response.data) {
        setData(response.data)
      } else {
        setError(response.message || "Failed to fetch data")
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }, dependencies)

  useEffect(() => {
    fetchData()
  }, [fetchData])

  return {
    data,
    loading,
    error,
    refetch: fetchData,
  }
}

// Specific hooks for each resource
export function useServices() {
  return useApi(() => api.getServices())
}

export function usePurchases() {
  return useApi(() => api.getPurchases())
}

export function useUsers() {
  return useApi(() => api.getUsers())
}

export function useCourses() {
  return useApi(() => api.getCourses())
}

export function useSteps() {
  return useApi(() => api.getSteps())
}

// Hook for mutations with loading state
export function useApiMutation<T, P = any>() {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const mutate = useCallback(async (apiCall: (params: P) => Promise<ApiResponse<T>>, params: P): Promise<T | null> => {
    try {
      setLoading(true)
      setError(null)
      const response = await apiCall(params)
      if (response.success && response.data) {
        return response.data
      } else {
        setError(response.message || "Operation failed")
        return null
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
      return null
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    mutate,
    loading,
    error,
  }
}
