import { type NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/mongodb"
import User from "@/models/User"

export async function GET(request: NextRequest) {
  try {
    await connectDB()

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query") || ""
    const location = searchParams.get("location") || ""
    const industry = searchParams.get("industry") || ""
    const experience = searchParams.get("experience") || ""
    const sortBy = searchParams.get("sortBy") || "relevance"
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "12")

    // Build search filter
    const searchFilter: any = {
      // Only show profiles that allow profile views
      "privacy.allowProfileViews": { $ne: false },
    }

    // Text search across multiple fields
    if (query) {
      searchFilter.$or = [
        { "profileInfo.firstName": { $regex: query, $options: "i" } },
        { "profileInfo.lastName": { $regex: query, $options: "i" } },
        { "profileInfo.bio": { $regex: query, $options: "i" } },
        { "profileInfo.skills": { $regex: query, $options: "i" } },
        { "profileInfo.company": { $regex: query, $options: "i" } },
        { typeOfWork: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ]
    }

    // Location filter
    if (location) {
      searchFilter["profileInfo.location"] = { $regex: location, $options: "i" }
    }

    // Industry filter (match against typeOfWork)
    if (industry) {
      searchFilter.typeOfWork = { $regex: industry, $options: "i" }
    }

    // Experience filter (this would need to be implemented based on your data structure)
    if (experience) {
      searchFilter["profileInfo.experience"] = experience
    }

    // Build sort criteria
    let sortCriteria: any = {}
    switch (sortBy) {
      case "recent":
        sortCriteria = { createdAt: -1 }
        break
      case "verified":
        sortCriteria = { isVerified: -1, createdAt: -1 }
        break
      case "connections":
        // This would need a connections count field
        sortCriteria = { createdAt: -1 }
        break
      default: // relevance
        sortCriteria = { createdAt: -1 }
    }

    // Calculate pagination
    const skip = (page - 1) * limit

    // Execute search
    const profiles = await User.find(searchFilter)
      .select("-password") // Exclude password field
      .sort(sortCriteria)
      .skip(skip)
      .limit(limit)
      .lean()

    // Get total count for pagination
    const totalResults = await User.countDocuments(searchFilter)
    const totalPages = Math.ceil(totalResults / limit)

    // Filter sensitive information based on privacy settings
    const filteredProfiles = profiles.map((profile) => {
      const filtered: any = {
        _id: profile._id,
        typeOfWork: profile.typeOfWork,
        gender: profile.gender,
        profileInfo: profile.profileInfo,
        isVerified: profile.isVerified,
        createdAt: profile.createdAt,
        privacy: profile.privacy,
      }

      // Only include email/mobile if privacy allows
      if (profile.privacy?.showEmail !== false) {
        filtered.email = profile.email
      }
      if (profile.privacy?.showMobile !== false) {
        filtered.mobile = profile.mobile
      }
      if (profile.privacy?.showDateOfBirth !== false) {
        filtered.dateOfBirth = profile.dateOfBirth
      }

      return filtered
    })

    return NextResponse.json({
      profiles: filteredProfiles,
      currentPage: page,
      totalPages,
      totalResults,
      hasNextPage: page < totalPages,
      hasPrevPage: page > 1,
    })
  } catch (error) {
    console.error("Search profiles error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
