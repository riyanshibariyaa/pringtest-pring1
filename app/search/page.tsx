"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Search, MapPin, Building, Users, Filter, ArrowLeft, UserPlus, Eye } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import Link from "next/link"

interface SearchProfile {
  _id: string
  email?: string
  mobile?: string
  dateOfBirth: string
  gender: string
  typeOfWork: string
  profileInfo?: {
    firstName?: string
    lastName?: string
    bio?: string
    skills?: string[]
    experience?: string
    location?: string
    company?: string
    website?: string
    linkedin?: string
    twitter?: string
    github?: string
  }
  privacy?: {
    showEmail: boolean
    showMobile: boolean
    showDateOfBirth: boolean
    allowProfileViews: boolean
    allowConnectionRequests: boolean
  }
  isVerified?: boolean
  createdAt: string
}

interface SearchFilters {
  query: string
  location: string
  industry: string
  experience: string
  sortBy: string
}

const locations = [
  "Mumbai",
  "Delhi",
  "Bangalore",
  "Hyderabad",
  "Chennai",
  "Kolkata",
  "Pune",
  "Ahmedabad",
  "Jaipur",
  "Surat",
  "Lucknow",
  "Kanpur",
  "Nagpur",
  "Indore",
  "Thane",
  "Bhopal",
  "Visakhapatnam",
  "Pimpri-Chinchwad",
  "Patna",
  "Vadodara",
]

const industries = [
  "Technology",
  "Healthcare",
  "Finance",
  "Education",
  "Retail",
  "Manufacturing",
  "Consulting",
  "Marketing",
  "Design",
  "Sales",
  "Engineering",
  "Legal",
  "Media",
  "Real Estate",
  "Hospitality",
  "Transportation",
  "Agriculture",
  "Construction",
  "Energy",
  "Government",
]

const experienceLevels = [
  { value: "entry", label: "Entry Level (0-2 years)" },
  { value: "mid", label: "Mid Level (3-5 years)" },
  { value: "senior", label: "Senior Level (6-10 years)" },
  { value: "executive", label: "Executive (10+ years)" },
]

const sortOptions = [
  { value: "relevance", label: "Most Relevant" },
  { value: "recent", label: "Recently Joined" },
  { value: "connections", label: "Most Connected" },
  { value: "verified", label: "Verified Profiles" },
]

export default function SearchPage() {
  const router = useRouter()
  const [profiles, setProfiles] = useState<SearchProfile[]>([])
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalResults, setTotalResults] = useState(0)
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    location: "",
    industry: "",
    experience: "",
    sortBy: "relevance",
  })

  useEffect(() => {
    // Load initial results
    handleSearch()
  }, [])

  const handleSearch = async (page = 1) => {
    setLoading(true)
    try {
      const searchParams = new URLSearchParams({
        ...filters,
        page: page.toString(),
        limit: "12",
      })

      const response = await fetch(`/api/search/profiles?${searchParams}`)
      const data = await response.json()

      if (response.ok) {
        setProfiles(data.profiles)
        setCurrentPage(data.currentPage)
        setTotalPages(data.totalPages)
        setTotalResults(data.totalResults)
      } else {
        toast({
          title: "Search Error",
          description: data.error || "Failed to search profiles",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong while searching",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleFilterChange = (key: keyof SearchFilters, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

  const handleConnectRequest = async (profileId: string) => {
    try {
      const response = await fetch("/api/connections/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUserId: profileId }),
      })

      const data = await response.json()

      if (response.ok) {
        toast({
          title: "Success",
          description: "Connection request sent successfully!",
        })
      } else {
        toast({
          title: "Error",
          description: data.error || "Failed to send connection request",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Something went wrong",
        variant: "destructive",
      })
    }
  }

  const formatExperience = (experience: string) => {
    const exp = experienceLevels.find((e) => e.value === experience)
    return exp ? exp.label : experience
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="bg-black border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/dashboard">
                <Button variant="ghost" className="text-white hover:bg-gray-800">
                  <ArrowLeft className="h-5 w-5" />
                </Button>
              </Link>
              <div>
                <h1 className="text-2xl font-bold text-white">Search & Discovery</h1>
                <p className="text-gray-400">Find and connect with professionals</p>
              </div>
            </div>
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant="outline"
              className="border-gray-700 text-white hover:bg-gray-800 bg-transparent"
            >
              <Filter className="h-4 w-4 mr-2" />
              Filters
            </Button>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        {/* Search Bar */}
        <div className="mb-8">
          <div className="flex gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
              <Input
                placeholder="Search by name, skills, company, or position..."
                value={filters.query}
                onChange={(e) => handleFilterChange("query", e.target.value)}
                className="pl-10 bg-gray-900 border-gray-700 text-white placeholder-gray-400 focus:border-brand-blue"
                onKeyPress={(e) => e.key === "Enter" && handleSearch()}
              />
            </div>
            <Button onClick={() => handleSearch()} className="bg-brand-blue hover:bg-blue-700">
              Search
            </Button>
          </div>
        </div>

        {/* Filters Panel */}
        {showFilters && (
          <div className="mb-8 p-6 bg-gray-900 border border-gray-800 rounded-lg">
            <h3 className="text-white font-semibold mb-4">Advanced Filters</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-white">Location</Label>
                <Select value={filters.location} onValueChange={(value) => handleFilterChange("location", value)}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue placeholder="Select location" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-800">
                      All Locations
                    </SelectItem>
                    {locations.map((location) => (
                      <SelectItem key={location} value={location} className="text-white hover:bg-gray-800">
                        {location}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Industry</Label>
                <Select value={filters.industry} onValueChange={(value) => handleFilterChange("industry", value)}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue placeholder="Select industry" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-800">
                      All Industries
                    </SelectItem>
                    {industries.map((industry) => (
                      <SelectItem key={industry} value={industry} className="text-white hover:bg-gray-800">
                        {industry}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Experience Level</Label>
                <Select value={filters.experience} onValueChange={(value) => handleFilterChange("experience", value)}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue placeholder="Select experience" />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    <SelectItem value="" className="text-white hover:bg-gray-800">
                      All Levels
                    </SelectItem>
                    {experienceLevels.map((level) => (
                      <SelectItem key={level.value} value={level.value} className="text-white hover:bg-gray-800">
                        {level.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label className="text-white">Sort By</Label>
                <Select value={filters.sortBy} onValueChange={(value) => handleFilterChange("sortBy", value)}>
                  <SelectTrigger className="bg-black border-gray-700 text-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="bg-black border-gray-700">
                    {sortOptions.map((option) => (
                      <SelectItem key={option.value} value={option.value} className="text-white hover:bg-gray-800">
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center mt-4">
              <Button
                onClick={() => {
                  setFilters({
                    query: "",
                    location: "",
                    industry: "",
                    experience: "",
                    sortBy: "relevance",
                  })
                  handleSearch()
                }}
                variant="outline"
                className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
              >
                Clear Filters
              </Button>
              <Button onClick={() => handleSearch()} className="bg-brand-blue hover:bg-blue-700">
                Apply Filters
              </Button>
            </div>
          </div>
        )}

        {/* Results Summary */}
        <div className="mb-6 flex items-center justify-between">
          <p className="text-gray-400">
            {totalResults > 0 ? `Found ${totalResults} professionals` : "No results found"}
          </p>
          {totalPages > 1 && (
            <p className="text-gray-400">
              Page {currentPage} of {totalPages}
            </p>
          )}
        </div>

        {/* Results Grid */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-gray-900 border border-gray-800 rounded-lg p-6 animate-pulse">
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-gray-700 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-700 rounded mb-2"></div>
                    <div className="h-3 bg-gray-700 rounded w-2/3"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="h-3 bg-gray-700 rounded"></div>
                  <div className="h-3 bg-gray-700 rounded w-3/4"></div>
                </div>
              </div>
            ))}
          </div>
        ) : profiles.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {profiles.map((profile) => (
              <div
                key={profile._id}
                className="bg-gray-900 border border-gray-800 rounded-lg p-6 hover:border-brand-blue transition-colors"
              >
                <div className="flex items-center space-x-4 mb-4">
                  <div className="w-16 h-16 bg-brand-blue rounded-full flex items-center justify-center text-white font-bold text-xl">
                    {profile.profileInfo?.firstName?.charAt(0) || profile.email?.charAt(0) || "U"}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <h3 className="text-white font-semibold">
                        {profile.profileInfo?.firstName && profile.profileInfo?.lastName
                          ? `${profile.profileInfo.firstName} ${profile.profileInfo.lastName}`
                          : profile.email || "Anonymous User"}
                      </h3>
                      {profile.isVerified && <Badge className="bg-brand-blue text-white text-xs">Verified</Badge>}
                    </div>
                    <p className="text-gray-400 text-sm">{profile.typeOfWork}</p>
                    {profile.profileInfo?.company && (
                      <p className="text-gray-500 text-xs flex items-center">
                        <Building className="h-3 w-3 mr-1" />
                        {profile.profileInfo.company}
                      </p>
                    )}
                  </div>
                </div>

                {profile.profileInfo?.bio && (
                  <p className="text-gray-300 text-sm mb-4 line-clamp-2">{profile.profileInfo.bio}</p>
                )}

                {profile.profileInfo?.skills && profile.profileInfo.skills.length > 0 && (
                  <div className="mb-4">
                    <div className="flex flex-wrap gap-1">
                      {profile.profileInfo.skills.slice(0, 3).map((skill, index) => (
                        <Badge key={index} className="bg-gray-800 text-gray-300 text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {profile.profileInfo.skills.length > 3 && (
                        <Badge className="bg-gray-800 text-gray-300 text-xs">
                          +{profile.profileInfo.skills.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-xs text-gray-500 mb-4">
                  {profile.profileInfo?.location && (
                    <span className="flex items-center">
                      <MapPin className="h-3 w-3 mr-1" />
                      {profile.profileInfo.location}
                    </span>
                  )}
                  <span>Joined {new Date(profile.createdAt).toLocaleDateString()}</span>
                </div>

                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => router.push(`/profile/${profile._id}`)}
                    className="flex-1 border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  >
                    <Eye className="h-4 w-4 mr-1" />
                    View Profile
                  </Button>
                  {profile.privacy?.allowConnectionRequests !== false && (
                    <Button
                      size="sm"
                      onClick={() => handleConnectRequest(profile._id)}
                      className="flex-1 bg-brand-blue hover:bg-blue-700"
                    >
                      <UserPlus className="h-4 w-4 mr-1" />
                      Connect
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No Profiles Found</h3>
            <p className="text-gray-400 mb-6">Try adjusting your search criteria or filters</p>
            <Button
              onClick={() => {
                setFilters({
                  query: "",
                  location: "",
                  industry: "",
                  experience: "",
                  sortBy: "relevance",
                })
                handleSearch()
              }}
              className="bg-brand-blue hover:bg-blue-700"
            >
              Clear All Filters
            </Button>
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="mt-8 flex justify-center space-x-2">
            <Button
              onClick={() => handleSearch(currentPage - 1)}
              disabled={currentPage === 1}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent disabled:opacity-50"
            >
              Previous
            </Button>
            {[...Array(Math.min(5, totalPages))].map((_, i) => {
              const page = i + 1
              return (
                <Button
                  key={page}
                  onClick={() => handleSearch(page)}
                  variant={currentPage === page ? "default" : "outline"}
                  className={
                    currentPage === page
                      ? "bg-brand-blue hover:bg-blue-700"
                      : "border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent"
                  }
                >
                  {page}
                </Button>
              )
            })}
            <Button
              onClick={() => handleSearch(currentPage + 1)}
              disabled={currentPage === totalPages}
              variant="outline"
              className="border-gray-700 text-gray-300 hover:bg-gray-800 bg-transparent disabled:opacity-50"
            >
              Next
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
