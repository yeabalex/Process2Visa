"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sidebar } from "@/components/student-sidebar"
import { Search, GraduationCap, Bell, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { DashboardLayout } from "./dashboard-layout"

interface CollegeResult {
  name: string
  id: number
  slug: string
  address: {
    street1: string
    street2: string | null
    city: string
    state: string
    zipCode: string
  }
}

interface ApiResponse {
  results: CollegeResult[]
  total: number
}

export function ResearchPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [rankingMin, setRankingMin] = useState("")
  const [rankingMax, setRankingMax] = useState("")
  const [ratingMin, setRatingMin] = useState("")
  const [ratingMax, setRatingMax] = useState("")
  const [acceptanceRateMin, setAcceptanceRateMin] = useState("")
  const [acceptanceRateMax, setAcceptanceRateMax] = useState("")
  const [applicationFeeMin, setApplicationFeeMin] = useState("")
  const [applicationFeeMax, setApplicationFeeMax] = useState("")
  const [tuitionFeeMin, setTuitionFeeMin] = useState("")
  const [tuitionFeeMax, setTuitionFeeMax] = useState("")

  const [filterScholarship, setFilterScholarship] = useState("all")
  const [filterState, setFilterState] = useState("all")
  const [filterType, setFilterType] = useState("all")
  const [filterCourse, setFilterCourse] = useState("all")
  const [searchPreference, setSearchPreference] = useState("university")

  const [searchResults, setSearchResults] = useState<CollegeResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [hasSearched, setHasSearched] = useState(false)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsLoading(true)
    try {
      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "search",
          uni: searchTerm,
        }),
      })

      const data = await response.json()
      if (data.results) {
        setSearchResults(data.results)
      } else {
        setSearchResults([])
      }
      setHasSearched(true)
    } catch (error) {
      console.error("Search failed:", error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleApplyFilters = async () => {
    setIsLoading(true)
    try {
      const filterData = {
        scholarship: filterScholarship,
        state: filterState,
        type: filterType,
        course: filterCourse,
        ranking: {
          min: rankingMin,
          max: rankingMax,
        },
        rating: {
          min: ratingMin,
          max: ratingMax,
        },
        acceptanceRate: {
          min: acceptanceRateMin,
          max: acceptanceRateMax,
        },
        applicationFee: {
          min: applicationFeeMin,
          max: applicationFeeMax,
        },
        tuitionFee: {
          min: tuitionFeeMin,
          max: tuitionFeeMax,
        },
      }

      const response = await fetch("/api/ai", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          type: "filter",
          uni: filterData,
        }),
      })

      const data = await response.json()
      if (data.results) {
        setSearchResults(data.results)
      } else {
        setSearchResults([])
      }
      setHasSearched(true)
    } catch (error) {
      console.error("Filter failed:", error)
      setSearchResults([])
      setHasSearched(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  // Sample states and courses for filters
  const uniqueStates = ["California", "Massachusetts", "Texas", "Pennsylvania", "New York"]
  const uniqueCourses = [
    "Computer Science",
    "Engineering",
    "Business",
    "Medicine",
    "Liberal Arts",
    "Physics",
    "Mathematics",
  ]

  return (

    <DashboardLayout>
        <main
          className="min-h-[calc(100vh-80px)] relative"
          style={{
            backgroundImage: `url('/verits.jpg')`,
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <div className="absolute inset-0 bg-background/80" />
          <div className="relative z-10 w-full max-w-5xl mx-auto p-4 lg:p-6">
            <div className="space-y-8 pt-8">
              <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-sm font-medium">Search by:</span>
                    <Select value={searchPreference} onValueChange={setSearchPreference}>
                      <SelectTrigger className="w-48">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="university">University Name</SelectItem>
                        <SelectItem value="preference">Your Preferences</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              {/* Large Search Bar */}
              <div className="relative max-w-4xl mx-auto">
                <Input
                  placeholder={
                    searchPreference === "university" ? "Enter university name" : "Describe your preferences"
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="text-xl py-8 px-6 pr-20 rounded-2xl border-2 text-center shadow-lg bg-background/95 backdrop-blur-sm"
                />
                <Button
                  size="lg"
                  className="absolute right-2 top-1/2 transform -translate-y-1/2 rounded-xl px-6"
                  onClick={handleSearch}
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-6 w-6 animate-spin" /> : <Search className="h-6 w-6" />}
                </Button>
              </div>

              <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-sm">
                <CardContent className="pt-6">
                  <h3 className="text-lg font-semibold mb-4">Filter Options</h3>

                  {/* Basic Filters */}
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-6">
                    <Select value={filterScholarship} onValueChange={setFilterScholarship}>
                      <SelectTrigger>
                        <SelectValue placeholder="Scholarship" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Universities</SelectItem>
                        <SelectItem value="yes">With Scholarships</SelectItem>
                        <SelectItem value="no">No Scholarships</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterState} onValueChange={setFilterState}>
                      <SelectTrigger>
                        <SelectValue placeholder="State" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All States</SelectItem>
                        {uniqueStates.map((state) => (
                          <SelectItem key={state} value={state}>
                            {state}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Select value={filterType} onValueChange={setFilterType}>
                      <SelectTrigger>
                        <SelectValue placeholder="University Type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="Public">Public</SelectItem>
                        <SelectItem value="Private">Private</SelectItem>
                      </SelectContent>
                    </Select>

                    <Select value={filterCourse} onValueChange={setFilterCourse}>
                      <SelectTrigger>
                        <SelectValue placeholder="Course" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Courses</SelectItem>
                        {uniqueCourses.map((course) => (
                          <SelectItem key={course} value={course}>
                            {course}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Range Filters */}
                  <div className="space-y-4">
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-5">
                      <div className="space-y-2">
                        <label className="text-sm font-medium">Ranking Range</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            value={rankingMin}
                            onChange={(e) => setRankingMin(e.target.value)}
                            type="number"
                          />
                          <Input
                            placeholder="Max"
                            value={rankingMax}
                            onChange={(e) => setRankingMax(e.target.value)}
                            type="number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Rating Range</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            value={ratingMin}
                            onChange={(e) => setRatingMin(e.target.value)}
                            type="number"
                            step="0.1"
                          />
                          <Input
                            placeholder="Max"
                            value={ratingMax}
                            onChange={(e) => setRatingMax(e.target.value)}
                            type="number"
                            step="0.1"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Acceptance Rate (%)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            value={acceptanceRateMin}
                            onChange={(e) => setAcceptanceRateMin(e.target.value)}
                            type="number"
                          />
                          <Input
                            placeholder="Max"
                            value={acceptanceRateMax}
                            onChange={(e) => setAcceptanceRateMax(e.target.value)}
                            type="number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Application Fee ($)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            value={applicationFeeMin}
                            onChange={(e) => setApplicationFeeMin(e.target.value)}
                            type="number"
                          />
                          <Input
                            placeholder="Max"
                            value={applicationFeeMax}
                            onChange={(e) => setApplicationFeeMax(e.target.value)}
                            type="number"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="text-sm font-medium">Tuition Fee ($)</label>
                        <div className="flex gap-2">
                          <Input
                            placeholder="Min"
                            value={tuitionFeeMin}
                            onChange={(e) => setTuitionFeeMin(e.target.value)}
                            type="number"
                          />
                          <Input
                            placeholder="Max"
                            value={tuitionFeeMax}
                            onChange={(e) => setTuitionFeeMax(e.target.value)}
                            type="number"
                          />
                        </div>
                      </div>
                    </div>

                    <Button className="w-full" onClick={handleApplyFilters} disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Apply Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {hasSearched && (
                <Card className="max-w-4xl mx-auto bg-background/95 backdrop-blur-sm">
                  <CardContent className="pt-6">
                    <h2 className="text-xl font-semibold mb-4">
                      Search Results {searchResults.length > 0 && `(${searchResults.length} found)`}
                    </h2>
                    {searchResults.length > 0 ? (
                      <div className="space-y-3">
                        {searchResults.map((college) => (
                          <div
                            key={college.id}
                            className="p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <h3 className="font-semibold text-lg text-foreground">{college.name}</h3>
                            <p className="text-muted-foreground">
                              {college.address.city}, {college.address.state}
                            </p>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-muted-foreground text-center py-8">
                        No colleges found for "{searchTerm}". Try a different search term.
                      </p>
                    )}
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
</DashboardLayout>
  )
}
