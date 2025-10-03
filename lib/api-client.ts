// Enhanced API client with error handling, loading states, and caching

export class ApiError extends Error {
  constructor(
    message: string,
    public status?: number,
    public code?: string,
  ) {
    super(message)
    this.name = "ApiError"
  }
}

export interface ApiRequestOptions {
  timeout?: number
  retries?: number
  useCache?: boolean
}

class ApiClient {
  private baseUrl: string
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000") {
    this.baseUrl = baseUrl
  }

  private getCacheKey(url: string, options?: RequestInit): string {
    return `${url}_${JSON.stringify(options?.body || {})}`
  }

  private isValidCache(timestamp: number): boolean {
    return Date.now() - timestamp < this.CACHE_DURATION
  }

  private async makeRequest<T>(endpoint: string, options: RequestInit & ApiRequestOptions = {}): Promise<T> {
    const { timeout = 10000, retries = 3, useCache = false, ...fetchOptions } = options
    const url = `${this.baseUrl}${endpoint}`
    const cacheKey = this.getCacheKey(url, fetchOptions)

    // Check cache for GET requests
    if (useCache && fetchOptions.method === "GET") {
      const cached = this.cache.get(cacheKey)
      if (cached && this.isValidCache(cached.timestamp)) {
        return cached.data
      }
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    const defaultHeaders = {
      "Content-Type": "application/json",
      ...fetchOptions.headers,
    }

    let lastError: Error | null = null

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          ...fetchOptions,
          headers: defaultHeaders,
          signal: controller.signal,
        })

        clearTimeout(timeoutId)

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}))
          throw new ApiError(
            errorData.message || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.code,
          )
        }

        const data = await response.json()

        // Cache successful GET requests
        if (useCache && fetchOptions.method === "GET") {
          this.cache.set(cacheKey, { data, timestamp: Date.now() })
        }

        return data
      } catch (error) {
        lastError = error as Error
        if (attempt === retries || error instanceof ApiError) {
          break
        }
        // Wait before retry (exponential backoff)
        await new Promise((resolve) => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    clearTimeout(timeoutId)
    throw lastError || new ApiError("Request failed after retries")
  }

  // GET request with caching
  async get<T>(endpoint: string, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, { ...options, method: "GET", useCache: true })
  }

  // POST request
  async post<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "POST",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // PUT request
  async put<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "PUT",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // DELETE request
  async delete<T>(endpoint: string, data?: any, options?: ApiRequestOptions): Promise<T> {
    return this.makeRequest<T>(endpoint, {
      ...options,
      method: "DELETE",
      body: data ? JSON.stringify(data) : undefined,
    })
  }

  // Clear cache
  clearCache(): void {
    this.cache.clear()
  }

  // Clear specific cache entry
  clearCacheEntry(endpoint: string): void {
    const keysToDelete = Array.from(this.cache.keys()).filter((key) => key.startsWith(endpoint))
    keysToDelete.forEach((key) => this.cache.delete(key))
  }
}

export const apiClient = new ApiClient()
